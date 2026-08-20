# Iam Ilia - Software Developer Portfolio

A modern, responsive portfolio built with **React**, **TypeScript**, and **Tailwind CSS**. Showcasing my projects, skills, and experience as a software developer and tech enthusiast.

![Portfolio Screenshot](public/icon.svg)

## ✨ Features

- Animated hero section with dynamic typing and animated background
- GitHub integration: profile and recent repositories, proxied and cached by the
  backend so the browser never has to reach api.github.com
- Responsive design with dark mode (auto and manual toggle)
- Language switcher (English & Persian) with RTL/LTR support
- Smooth navigation and animated section scrolling
- Stylish cards for skills, projects, and contact info
- Contact section with email, Telegram, Discord, and location
- Custom transitions and effects
- Modern scrollbar, safe area insets, and accessibility improvements

## 🛠️ Tech Stack

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zustand](https://zustand.docs.pmnd.rs/) (state + persisted cache)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Axios](https://axios-http.com/)
- [Tabler Icons](https://tabler.io/icons)
- [i18next](https://www.i18next.com/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

```sh
git clone https://github.com/iamilia/my-react-app.git
cd my-react-app
npm install
# or
bun install
```

### Development

```sh
npm run dev
# or
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```sh
npm run build
```

### Lint & Format

```sh
npm run lint
npm run format
```

## 📁 Project Structure

```
src/
  components/    # UI components (Hero, About, Projects, etc.)
  hooks/         # Custom React hooks (useReveal, usePageview, useMagnetic)
  store/         # Zustand stores — all persisted client state lives here
                 #   githubStore   profile + repos, cached
                 #   themeStore    dark mode (`theme`)
                 #   languageStore en/fa + dir/lang + i18next (`language`)
  services/      # API services (GitHub proxy, analytics)
  types/         # TypeScript types
  i18n.ts        # i18n configuration
  style.css      # Tailwind and custom styles
  App.tsx        # Main app component
  main.tsx       # Entry point
public/
  fonts/         # Custom fonts
  locales/       # i18n translation files
    en/
      translation.json
    fa/
      translation.json
```

## ⚙️ Configuration

- **GitHub Username:** Change `USERNAME` in [`src/pages/Home.tsx`](src/pages/Home.tsx). The
  backend only serves usernames listed in its `GITHUB_USERS` env var, so add it there too.
- **GitHub data:** Fetched from the Express app at `/_gh/:username`, which caches it
  server-side and keeps serving the last known copy when GitHub is unreachable — see
  `GITHUB.md` in `my-express-app`. The client caches it again in `localStorage` via
  [`src/store/githubStore.ts`](src/store/githubStore.ts), and only falls back to calling
  api.github.com directly if the proxy itself cannot be reached.
- **Contact Info:** Update links and addresses in [`src/components/Hero.tsx`](src/components/Hero.tsx) and [`src/components/Contact.tsx`](src/components/Contact.tsx).
- **Skills & Projects:** Edit [`src/components/Skills.tsx`](src/components/Skills.tsx) and [`src/components/Projects.tsx`](src/components/Projects.tsx) to customize your stack and featured repositories.
- **Languages:** Update translation files in [`public/locales/`](public/locales/) and configuration in [`src/i18n.ts`](src/i18n.ts).

## 📦 Deployment

```sh
npm run build
```

Then serve the `dist/` folder. It is served by the companion Express app
(`my-express-app`), which also provides the two same-origin endpoints the site
expects: `/_gh` for GitHub data and `/_a` for analytics. On plain static hosting
the page still renders — the GitHub calls fall back to api.github.com — but that
fallback is exactly what this setup exists to avoid.

In development, `vite.config.ts` proxies both prefixes to `http://localhost:3000`,
so run the Express app alongside `npm run dev`.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

> Built with ❤️ by Ilia
