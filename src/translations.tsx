export type Language = 'en' | 'fa';

export interface Translations {
    navigation: {
        about: string;
        skills: string;
        projects: string;
        contact: string;
        userName: string;
    };
    hero: {
        animationSequence: string[];
    };
    about: {
        title: string;
        subtitle: string;
        development: {
            title: string;
            description: string;
        };
        experience: {
            title: string;
            description: string;
        };
        collaboration: {
            title: string;
            description: string;
        };
        publicRepos: string;
        githubFollowers: string;
        following: string;
    };
    skills: {
        title: string;
        subtitle: string;
    };
    projects: {
        title: string;
        subtitle: string;
        noDescription: string;
        viewAllProjects: string;
    };
    contact: {
        title: string;
        subtitle: string;
        email: string;
        telegram: string;
        discordServer: string;
        joinServer: string;
        readyToCollaborate: string;
        collaborationText: string;
    };
    footer: {
        builtWith: string;
    };
    loading: {
        errorTitle: string;
        tryAgain: string;
    };
}

export const translations: Record<Language, Translations> = {
    en: {
        navigation: {
            about: 'About',
            skills: 'Skills',
            projects: 'Projects',
            contact: 'Contact',
            userName : 'Ilia',
        },
        hero: {
            animationSequence: [
                "Software Developer 🚀",
                "Game Developer 🎮",
                "Tech Enthusiast 💡",
                "Happy to connect with you! 😊",
                "Let's build something awesome together! 🤝",
            ],
        },
        about: {
            title: 'About Me',
            subtitle: 'Passionate about creating innovative solutions',
            development: {
                title: 'Development',
                description: 'Experienced in modern web technologies and software development practices.',
            },
            experience: {
                title: 'Experience',
                description: 'Building projects and contributing to open source communities.',
            },
            collaboration: {
                title: 'Collaboration',
                description: 'Love working with teams and sharing knowledge with the community.',
            },
            publicRepos: 'Public Repositories',
            githubFollowers: 'GitHub Followers',
            following: 'Following',
        },
        skills: {
            title: 'Technologies & Skills',
            subtitle: 'A look at the tools and technologies I use.',
        },
        projects: {
            title: 'Recent Projects',
            subtitle: 'Some of my latest work on GitHub',
            noDescription: 'No description available',
            viewAllProjects: 'View All Projects',
        },
        contact: {
            title: 'Get In Touch',
            subtitle: 'Let\'s connect and build something amazing together',
            email: 'Email',
            telegram: 'Telegram',
            discordServer: 'Discord Server',
            joinServer: 'Join Server',
            readyToCollaborate: 'Ready to collaborate?',
            collaborationText: 'I\'m always interested in hearing about new projects and opportunities. Whether you want to work together or just say hi, feel free to reach out through any of the channels above!',
        },
        footer: {
            builtWith: 'Built with React, TypeScript, Tailwind CSS & ❤️',
        },
        loading: {
            errorTitle: 'Error Loading Data',
            tryAgain: 'Try Again',
        },
    },
    fa: {
        navigation: {
            about: 'درباره',
            skills: 'مهارت‌ها',
            projects: 'پروژه‌ها',
            contact: 'تماس',
            userName : 'ایلیا',
        },
        hero: {
            animationSequence: [
                "توسعه‌دهنده نرم‌افزار 🚀",
                "توسعه‌دهنده بازی 🎮",
                "علاقه‌مند به تکنولوژی 💡",
                "خوشحالم که با شما آشنا می‌شوم! 😊",
                "بیایید چیز فوق‌العاده‌ای بسازیم! 🤝",
            ],
        },
        about: {
            title: 'درباره من',
            subtitle: 'علاقه‌مند به خلق راه‌حل‌های نوآورانه',
            development: {
                title: 'توسعه',
                description: 'تجربه در تکنولوژی‌های مدرن وب و شیوه‌های توسعه نرم‌افزار.',
            },
            experience: {
                title: 'تجربه',
                description: 'ساخت پروژه‌ها و مشارکت در جوامع متن‌باز.',
            },
            collaboration: {
                title: 'همکاری',
                description: 'عاشق کار تیمی و به اشتراک‌گذاری دانش با جامعه.',
            },
            publicRepos: 'مخازن عمومی',
            githubFollowers: 'دنبال‌کنندگان گیت‌هاب',
            following: 'دنبال‌شده',
        },
        skills: {
            title: 'تکنولوژی‌ها و مهارت‌ها',
            subtitle: 'نگاهی به ابزارها و تکنولوژی‌هایی که استفاده می‌کنم.',
        },
        projects: {
            title: 'پروژه‌های اخیر',
            subtitle: 'برخی از آخرین کارهایم در گیت‌هاب',
            noDescription: 'توضیحی در دسترس نیست',
            viewAllProjects: 'مشاهده همه پروژه‌ها',
        },
        contact: {
            title: 'در تماس باشیم',
            subtitle: 'بیایید ارتباط برقرار کنیم و چیز شگفت‌انگیزی بسازیم',
            email: 'ایمیل',
            telegram: 'تلگرام',
            discordServer: 'سرور دیسکورد',
            joinServer: 'عضویت در سرور',
            readyToCollaborate: 'آماده همکاری؟',
            collaborationText: 'من همیشه علاقه‌مندم که درباره پروژه‌ها و فرصت‌های جدید بشنوم. چه بخواهید با هم کار کنیم یا فقط سلام کنید، از طریق هر یک از کانال‌های بالا با من در تماس باشید!',
        },
        footer: {
            builtWith: 'ساخته شده با React، TypeScript، Tailwind CSS و ❤️',
        },
        loading: {
            errorTitle: 'خطا در بارگذاری داده‌ها',
            tryAgain: 'تلاش مجدد',
        },
    },
};

export const useTranslations = (language: Language) => {
    return translations[language];
};