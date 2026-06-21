'use client';

import Link from 'next/link';
import { UserButton, Show, SignInButton } from '@clerk/nextjs';
import { useTheme } from '@/components/ThemeProvider';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-left">
          <Link href="/" className="header-logo">
            <span className="header-logo-icon">⚡</span>
            <span className="header-logo-text">DSA Tracker</span>
          </Link>
          <nav className="header-nav">
            <Link href="/" className="header-nav-link">
              Dashboard
            </Link>
            <Link href="/quiz" className="header-nav-link">
              Quiz
            </Link>
          </nav>
        </div>
        <div className="header-right">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <Show when="signed-in" fallback={<SignInButton />}>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
