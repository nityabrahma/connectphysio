import { FeedbackDialog, FeedbackProvider } from "@/components/feedback-form";
import { LandingFooter } from "@/components/layout/landing-footer";
import { LandingHeader } from "@/components/layout/landing-header";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <FeedbackProvider>
      <div className="flex min-h-screen flex-col">
        <LandingHeader />
        <main className="flex-1">{children}</main>
        <LandingFooter />
        <FeedbackDialog />
      </div>
    </FeedbackProvider>
  );
}
