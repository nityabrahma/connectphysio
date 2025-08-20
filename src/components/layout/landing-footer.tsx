import Link from "next/link";
import { Icons } from "../icons";

export function LandingFooter() {
  return (
    <footer className="bg-muted p-6 md:py-8 w-full">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-2">
           <Icons.logo className="h-6 w-6 text-primary" />
           <p className="text-sm font-semibold">ConnectPhysio</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-4 md:mt-0 text-sm">
          <Link href="#features" className="text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            Contact
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground mt-4 md:mt-0">
          © {new Date().getFullYear()} ConnectPhysio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
