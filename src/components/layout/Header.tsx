'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ThemeToggle } from '@/src/components/ui/theme-toggle';
import { cn } from '@/src/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Global Travel Report
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === '/' ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === '/about' ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === '/contact' ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Input
              type="search"
              placeholder="Search stories..."
              className="h-9 md:w-[300px] lg:w-[400px]"
            />
          </div>
          <nav className="flex items-center">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="h-9 w-9 p-0 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </nav>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="container py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === '/' ? 'text-foreground' : 'text-foreground/60'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === '/about' ? 'text-foreground' : 'text-foreground/60'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname === '/contact' ? 'text-foreground' : 'text-foreground/60'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 