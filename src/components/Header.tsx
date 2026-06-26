'use client';

import Link from 'next/link';
import { UserButton, Show, SignInButton, useAuth } from '@clerk/nextjs';
import { useTheme } from '@/components/ThemeProvider';
import { useState } from 'react';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { userId } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyUserId = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          <Show when="signed-in">
            <button 
              onClick={copyUserId}
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mr-2 transition-colors flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#2c2c2c]"
              title="Copy your User ID for the extension"
              aria-label="Copy User ID"
            >
              {copied ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
          </Show>
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
