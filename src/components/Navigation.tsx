import { useState } from 'react';
import { IconMenu2, IconX, IconSun, IconMoon } from '@tabler/icons-react';

interface NavigationProps {
    userName: string;
    darkMode: boolean;
    toggleDarkMode: () => void;
    scrollToSection: (sectionId: string) => void;
}

export const Navigation = ({
    userName,
    darkMode,
    toggleDarkMode,
    scrollToSection,
}: NavigationProps) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleScrollToSection = (sectionId: string) => {
        scrollToSection(sectionId);
        setMobileMenuOpen(false);
    };

    return (
        <nav className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-6xl liquid-card z-50 transition-all duration-300 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
            <div className="px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex justify-between items-center">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-sky-600 to-teal-500 dark:from-cyan-950 dark:to-stone-950 bg-clip-text text-transparent">
                        {userName || 'Ilia'}
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                        <button
                            onClick={() => scrollToSection('about')}
                            className="text-slate-600 dark:text-cyan-400 hover:text-sky-500 dark:hover:text-zinc-300 transition-all duration-300 font-medium hover:scale-105 text-sm lg:text-base"
                        >
                            About
                        </button>
                        <button
                            onClick={() => scrollToSection('projects')}
                            className="text-slate-600 dark:text-cyan-400 hover:text-sky-500 dark:hover:text-zinc-300 transition-all duration-300 font-medium hover:scale-105 text-sm lg:text-base"
                        >
                            Projects
                        </button>
                        <button
                            onClick={() => scrollToSection('contact')}
                            className="text-slate-600 dark:text-cyan-400 hover:text-sky-500 dark:hover:text-zinc-300 transition-all duration-300 font-medium hover:scale-105 text-sm lg:text-base"
                        >
                            Contact
                        </button>
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 sm:p-3 rounded-full liquid-card text-slate-600 dark:text-cyan-400 hover:scale-110 transition-all duration-300"
                        >
                            {darkMode ? (
                                <IconSun size={18} />
                            ) : (
                                <IconMoon size={18} />
                            )}
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-2 sm:space-x-3">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 sm:p-3 rounded-full liquid-card text-slate-600 dark:text-cyan-400 hover:scale-110 transition-all duration-300"
                        >
                            {darkMode ? (
                                <IconSun size={18} />
                            ) : (
                                <IconMoon size={18} />
                            )}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 sm:p-3 rounded-full liquid-card text-slate-600 dark:text-cyan-400 hover:scale-110 transition-all duration-300"
                        >
                            {mobileMenuOpen ? (
                                <IconX size={20} />
                            ) : (
                                <IconMenu2 size={20} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200/60 dark:border-zinc-700/20">
                        <div className="flex flex-col space-y-3 sm:space-y-4">
                            <button
                                onClick={() => handleScrollToSection('about')}
                                className="text-slate-600 dark:text-cyan-400 hover:text-sky-500 dark:hover:text-zinc-300 transition-all duration-300 text-left font-medium py-2 text-sm sm:text-base"
                            >
                                About
                            </button>
                            <button
                                onClick={() =>
                                    handleScrollToSection('projects')
                                }
                                className="text-slate-600 dark:text-cyan-400 hover:text-sky-500 dark:hover:text-zinc-300 transition-all duration-300 text-left font-medium py-2 text-sm sm:text-base"
                            >
                                Projects
                            </button>
                            <button
                                onClick={() => handleScrollToSection('contact')}
                                className="text-slate-600 dark:text-cyan-400 hover:text-sky-500 dark:hover:text-zinc-300 transition-all duration-300 text-left font-medium py-2 text-sm sm:text-base"
                            >
                                Contact
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
