import Link from "next/link";
import { Button } from "../ui/button";
import { Icons } from "../icons";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "../ui/sheet";
import { Menu } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
];

export function LandingHeader() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center justify-center">
          <Icons.logo className="h-10 w-10 text-primary" />
          <span className="ml-2 text-lg font-semibold">TheraSuite</span>
        </Link>
        <nav className="hidden lg:flex gap-4 sm:gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:underline underline-offset-4">
              {link.label}
            </Link>
          ))}
        </nav>
         <div className="hidden lg:flex items-center gap-4">
            <Link href="/login">
                <Button>Sign In</Button>
            </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader className="sr-only">
              <SheetTitle>Mobile Navigation</SheetTitle>
              <SheetDescription>Main menu for navigating the TheraSuite landing page.</SheetDescription>
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium">
                <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                <Icons.logo className="h-9 w-9 text-primary" />
                <span>TheraSuite</span>
                </Link>
                {navLinks.map(link => (
                    <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                    </Link>
                ))}
                <div className="flex flex-col gap-4 mt-4">
                    <Link href="/login">
                        <Button className="w-full">Sign In</Button>
                    </Link>
                </div>
            </nav>
          </SheetContent>
        </Sheet>

      </div>
    </header>
  );
}
