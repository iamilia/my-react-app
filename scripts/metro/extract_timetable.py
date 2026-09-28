"""
Turn a Tehran Metro "جدول ایستگاهی" (.xls station timetable) into the JSON the
site reads (src/metro/data/line-<id>.json).

Nothing is estimated here. Every number in the output is a difference between
two clock times printed in the workbook:

  * segmentSeconds  — for each pair of neighbouring stations, the time between
                      them on the trips of a sheet (the value most trips use).
  * segmentPeriods  — runs of trips whose times differ from that (e.g. Line 5
                      locals held for an express), keyed by their departure
                      at the terminal, so every trip is represented exactly.
                      Nothing is averaged.
  * service         — per day type, one entry per service pattern (trips
                      that share a start and end station): first/last
                      departure and headway bands (runs of equal gap between
                      consecutive departures), all at the pattern's first
                      station.

Usage (Windows, from the repo root):

    py -m pip install xlrd==2.0.1
    py scripts/metro/extract_timetable.py --line 4 ^
        --xls "C:/path/4_ ایستگاهی خط چهار - مهر 1404.xls" ^
        --out src/metro/data/line-4.json

Station order, ids and English names come from scripts/metro/stations.json.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from datetime import date
from pathlib import Path

try:
    import xlrd  # .xls (BIFF) reader; openpyxl cannot open these files
except ImportError:  # pragma: no cover
    sys.exit("xlrd is required:  py -m pip install xlrd==2.0.1")

HERE = Path(__file__).resolve().parent
DAY_TYPES = ("weekday", "thursday", "holiday")


# --------------------------------------------------------------------------- #
# text helpers
# --------------------------------------------------------------------------- #


def to_persian(text: str) -> str:
    """Arabic yeh/kaf -> Persian, collapse whitespace."""
    text = str(text).replace("ي", "ی").replace("ك", "ک").replace("ى", "ی")
    text = text.replace("\u0640", "")  # tatweel, as in 'زمـزم'
    return " ".join(text.split())


def match_key(text: str) -> str:
    """Spelling-insensitive key: the workbooks write 'نيروهوايي' and
    'نيرو هوايي' for the same station, with and without ZWNJ."""
    key = to_persian(text).replace("\u200c", "").replace(" ", "")
    # '17' in one sheet, '۱۷' in stations.json
    return key.translate(str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789"))


def minutes_of(value: object) -> int | None:
    """Excel stores clock times as a fraction of a day."""
    if isinstance(value, float) and 0 < value < 1.5:
        return round(value * 1440)
    return None


def hhmm(total_minutes: int) -> str:
    return f"{total_minutes // 60:02d}:{total_minutes % 60:02d}"


def day_type_of(sheet_name: str) -> str:
    name = to_persian(sheet_name)
    if "جمعه" in name or "تعطیل" in name:
        return "holiday"
    if "پنج" in name:
        return "thursday"
    return "weekday"


# --------------------------------------------------------------------------- #
# sheet parsing
# --------------------------------------------------------------------------- #


def parse_sheet(sheet):
    """Return (station names in sheet order, trips). A trip is a list of
    minutes-since-midnight per station column, None where the train does not
    call (short-turn trips start mid-line)."""
    header_row = None
    for r in range(min(12, sheet.nrows)):
        cells = [to_persian(sheet.cell_value(r, c)) for c in range(sheet.ncols)]
        if any(c.startswith("هدوی") for c in cells):
            header_row = r
            break
    if header_row is None:
        raise ValueError(f"{sheet.name}: no header row with 'هدوی'")

    header = [sheet.cell_value(header_row, c) for c in range(sheet.ncols)]
    headway_col = next(
        c for c, v in enumerate(header) if to_persian(v).startswith("هدوی")
    )
    station_cols = [
        (c, to_persian(v))
        for c, v in enumerate(header)
        if c > headway_col and isinstance(v, str) and to_persian(v)
    ]

    trips, skipped_express = [], 0
    for r in range(header_row + 1, sheet.nrows):
        marker = str(sheet.cell_value(r, headway_col)).upper()
        times = [minutes_of(sheet.cell_value(r, c)) for c, _ in station_cols]
        if sum(t is not None for t in times) < 2:
            continue
        if "EXP" in marker:
            skipped_express += 1
            continue
        trips.append(times)

    return [name for _, name in station_cols], trips, skipped_express


def runs_of_equal_gap(departures: list[int]):
    bands = []
    for a, b in zip(departures, departures[1:]):
        gap = b - a
        if bands and bands[-1]["minutes"] == gap and bands[-1]["_to"] == a:
            bands[-1]["_to"] = b
        else:
            bands.append({"_from": a, "_to": b, "minutes": gap})
    return [
        {"from": hhmm(x["_from"]), "to": hhmm(x["_to"]), "minutes": x["minutes"]}
        for x in bands
    ]


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #


def extract(line_id: str, xls_path: Path, meta: dict):
    stations = meta["stations"]
    keys = [match_key(s["fa"]) for s in stations]
    n = len(stations)
    warnings: list[str] = []

    # direction -> day type -> segment list / service
    segments: dict[str, dict[str, list]] = {"forward": {}, "backward": {}}
    periods: dict[str, list] = {"forward": [], "backward": []}
    service: dict[str, dict[str, dict]] = {"forward": {}, "backward": {}}
    sheets_used = []

    book = xlrd.open_workbook(str(xls_path))
    for sheet in book.sheets():
        names, trips, skipped = parse_sheet(sheet)
        day = day_type_of(sheet.name)
        sheet_keys = [match_key(x) for x in names]

        unknown = [x for x, k in zip(names, sheet_keys) if k not in keys]
        if unknown:
            raise ValueError(
                f"{sheet.name}: stations not in stations.json: {unknown}"
            )
        idx = [keys.index(k) for k in sheet_keys]
        if idx == list(range(n)):
            direction = "forward"
        elif idx == list(range(n - 1, -1, -1)):
            direction = "backward"
        else:
            raise ValueError(f"{sheet.name}: station order matches neither direction")

        if skipped:
            warnings.append(f"{sheet.name}: ignored {skipped} express (EXP) trips")

        def canonical(k: int) -> int:
            """Sheet pair k → pair index i = (stations[i], stations[i+1])."""
            return k if direction == "forward" else n - 2 - k

        # The day's segment times: for each pair, the value most trips use.
        modal: list[int | None] = [None] * (n - 1)
        for k in range(n - 1):
            deltas = Counter(
                (t[k + 1] - t[k]) % 1440
                for t in trips
                if t[k] is not None and t[k + 1] is not None
            )
            if deltas:
                # most common; ties broken by the smaller value, for determinism
                modal[k] = min(deltas, key=lambda d: (-deltas[d], d))

        seg: list[int | None] = [None] * (n - 1)
        for k, value in enumerate(modal):
            seg[canonical(k)] = None if value is None else value * 60
        segments[direction][day] = seg

        # Trips that differ from the day's times (e.g. Line 5 locals held for
        # an express to overtake) become periods keyed by their departure at
        # the terminal. Every trip is represented exactly; nothing averaged.
        def deviation(t):
            return tuple(
                (k, (t[k + 1] - t[k]) % 1440)
                for k in range(n - 1)
                if t[k] is not None
                and t[k + 1] is not None
                and (t[k + 1] - t[k]) % 1440 != modal[k]
            )

        dated = sorted((t for t in trips if t[0] is not None), key=lambda t: t[0])
        undated = [t for t in trips if t[0] is None and deviation(t)]
        if undated:
            warnings.append(
                f"{sheet.name}: {len(undated)} short-turn trip(s) with unusual "
                "segment times can't be tied to a terminal departure — ignored"
            )
        run = None
        for t in dated + [None]:
            dev = deviation(t) if t is not None else None
            if run and dev == run["dev"]:
                run["to"] = t[0]
                continue
            if run:
                vec = list(seg)
                for k, d in run["dev"]:
                    vec[canonical(k)] = d * 60
                periods[direction].append(
                    {
                        "dayType": day,
                        "from": hhmm(run["from"]),
                        "to": hhmm(run["to"]),
                        "segmentSeconds": vec,
                    }
                )
                changed = ", ".join(
                    f"{names[k]}→{names[k + 1]} {d} min (usually {modal[k]})"
                    for k, d in run["dev"]
                )
                warnings.append(
                    f"{sheet.name}: departures {hhmm(run['from'])}–"
                    f"{hhmm(run['to'])} differ: {changed} — stored as a period"
                )
            run = {"from": t[0], "to": t[0], "dev": dev} if dev else None

        # Service patterns: trips grouped by where they start and end. Most
        # lines have one; Line 1 also runs Tajrish ↔ Shahr-e Rey short trips.
        # Times are departures at the pattern's first station.
        groups: dict[tuple[int, int], list[int]] = {}
        for t in trips:
            first = next(k for k, x in enumerate(t) if x is not None)
            last = max(k for k, x in enumerate(t) if x is not None)
            groups.setdefault((first, last), []).append(t[first])
        patterns = []
        for (first, last), deps in sorted(groups.items(), key=lambda g: -len(g[1])):
            deps.sort()
            if len(deps) < 2:
                warnings.append(
                    f"{sheet.name}: 1 trip {names[first]} → {names[last]} at "
                    f"{hhmm(deps[0])} has no headway and is left out"
                )
                continue
            patterns.append(
                {
                    "from": stations[idx[first]]["id"],
                    "to": stations[idx[last]]["id"],
                    "firstDeparture": hhmm(deps[0]),
                    "lastDeparture": hhmm(deps[-1]),
                    "headways": runs_of_equal_gap(deps),
                }
            )
        service[direction][day] = patterns
        sheets_used.append(sheet.name)

    directions = {}
    for direction, towards in (("forward", stations[-1]), ("backward", stations[0])):
        per_day = segments[direction]
        base = per_day.get("weekday")
        if base is None:
            base = [None] * (n - 1)
            warnings.append(f"{direction}: no weekday sheet — segmentSeconds is null")
        overrides = {
            day: seg for day, seg in per_day.items() if day != "weekday" and seg != base
        }
        entry = {"towards": towards["id"], "segmentSeconds": base}
        if overrides:
            entry["segmentSecondsByDayType"] = overrides
        if periods[direction]:
            entry["segmentPeriods"] = periods[direction]
        entry["service"] = {day: service[direction].get(day) for day in DAY_TYPES}
        for day in DAY_TYPES:
            if entry["service"][day] is None:
                warnings.append(f"{direction}/{day}: no sheet — service is null")
        directions[direction] = entry

    line = {
        "id": line_id,
        "name": meta["name"],
        "color": meta["color"],
        "source": {
            "file": xls_path.name,
            "sheets": sheets_used,
            "extractedOn": date.today().isoformat(),
            "note": "Station timetable (جدول ایستگاهی). Times at each terminal; "
            "segment times are station-to-station and include dwell.",
        },
        "segmentsIncludeDwell": True,
        "dwellSeconds": None,
        "stations": [{"id": s["id"], "fa": s["fa"], "en": s["en"]} for s in stations],
        "directions": directions,
        "missing": meta.get("missing", []),
    }
    return line, warnings


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--line", required=True)
    ap.add_argument("--xls", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--stations", type=Path, default=HERE / "stations.json")
    args = ap.parse_args()

    meta = json.loads(args.stations.read_text(encoding="utf-8"))
    if args.line not in meta:
        sys.exit(f"line {args.line} has no entry in {args.stations}")

    line, warnings = extract(args.line, args.xls, meta[args.line])
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps(line, ensure_ascii=False, indent=4) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"wrote {args.out}")
    for w in warnings:
        print("  warning:", w)


if __name__ == "__main__":
    main()
