import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, CalendarCheck, Users, ShieldCheck } from 'lucide-react';
import { Icons } from '@/components/icons';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">TheraSuite</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden gap-6 md:flex">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Features
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Pricing
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Contact
              </Link>
            </nav>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container grid max-w-7xl grid-cols-1 items-center gap-12 py-20 text-center md:grid-cols-2 md:py-32 md:text-left">
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              The All-in-One Platform for Modern Therapy Practices
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
              Streamline your patient management, appointment scheduling, and billing with TheraSuite. Focus on what truly matters - your patients.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
              <Link href="/login">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="#">
                 <Button size="lg" variant="outline">
                    Request a Demo
                </Button>
              </Link>
            </div>
          </div>
          <div>
            <img
              src="https://placehold.co/600x400.png"
              alt="TheraSuite Dashboard"
              className="rounded-2xl shadow-2xl"
              data-ai-hint="app dashboard"
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full bg-muted py-24">
          <div className="container max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything You Need to Run Your Practice
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                From patient intake to session notes, TheraSuite provides a seamless, integrated experience for your entire team.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                <FeatureCard
                    icon={<Users className="h-8 w-8 text-primary" />}
                    title="Patient Management"
                    description="Keep comprehensive patient records, track progress, and manage treatment plans all in one secure place."
                />
                <FeatureCard
                    icon={<CalendarCheck className="h-8 w-8 text-primary" />}
                    title="Smart Scheduling"
                    description="Effortlessly book appointments, manage therapist schedules, and send automated reminders to reduce no-shows."
                />
                <FeatureCard
                    icon={<Briefcase className="h-8 w-8 text-primary" />}
                    title="Package & Billing"
                    description="Create custom therapy packages, manage sales, and streamline your invoicing and billing processes with ease."
                />
                <FeatureCard
                    icon={<ShieldCheck className="h-8 w-8 text-primary" />}
                    title="Secure & Compliant"
                    description="Rest easy knowing your data is protected with industry-standard security and privacy features."
                />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TheraSuite. All rights reserved.
          </p>
          <div className="flex gap-4">
             <Link href="#" className="text-sm hover:underline">Privacy Policy</Link>
             <Link href="#" className="text-sm hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl shadow-md transition-transform hover:-translate-y-2">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
                {icon}
            </div>
            <h3 className="mb-2 text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}