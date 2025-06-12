import Link from 'next/link';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Building2 } from 'lucide-react';
import { MainNav } from '@/components/main-nav';
import { ModeToggle } from '@/components/mode-toggle';


export function SiteHeader() {
  // Mock user data for now
  const user = { name: 'John Doe', email: 'john.doe@example.com', avatarUrl: 'https://placehold.co/100x100.png' };
  const isLoggedIn = true; // Simulate user login state

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg font-headline">
            Review Central
          </span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          {isLoggedIn && (
            <div className="hidden md:flex">
               <MainNav />
            </div>
          )}
          <ModeToggle />
          {isLoggedIn ? (
            <UserNav user={user} />
          ) : (
            <Button asChild>
              <Link href="/">Login</Link>
            </Button>
          )}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <Link href="/" className="mr-6 flex items-center space-x-2 mb-4 px-4">
                  <Building2 className="h-6 w-6 text-primary" />
                  <span className="font-bold sm:inline-block text-lg font-headline">
                    Review Central
                  </span>
                </Link>
                <div className="flex flex-col space-y-2 px-2">
                  <MainNav isMobile={true} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
