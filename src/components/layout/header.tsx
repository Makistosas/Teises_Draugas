'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Scale,
  Menu,
  User,
  LogOut,
  Settings,
  FileText,
  PlusCircle,
  Bell,
  Globe,
} from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { data: session } = useSession();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Scale className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">
            Teisės Draugas
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('nav.dashboard')}
              </Link>
              <Link
                href="/dashboard/cases"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('nav.cases')}
              </Link>
              <Link href="/dashboard/cases/new">
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t('nav.newCase')}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('features.title')}
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {language === 'lt' ? 'Kaip tai veikia' : 'How it works'}
              </Link>
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('lt')}>
                <span className={cn(language === 'lt' && 'font-bold')}>
                  Lietuvių
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                <span className={cn(language === 'en' && 'font-bold')}>
                  English
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {session ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <FileText className="h-4 w-4 mr-2" />
                      {t('nav.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/cases">
                      <FileText className="h-4 w-4 mr-2" />
                      {t('nav.cases')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      {t('nav.settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">{t('nav.register')}</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container px-4 py-4 space-y-2">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  href="/dashboard/cases"
                  className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.cases')}
                </Link>
                <Link
                  href="/dashboard/cases/new"
                  className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.newCase')}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
