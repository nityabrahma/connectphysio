
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { sendFeedbackEmail } from "@/actions/send-feedback";

export function FeedbackForm() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim().length === 0) {
      toast({
        variant: "destructive",
        title: "Feedback cannot be empty",
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("feedback", feedback);
    formData.append("page", pathname);
    formData.append("userEmail", user?.email || "Anonymous");

    const result = await sendFeedbackEmail(formData);

    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Failed to Send Feedback",
        description: result.error,
      });
    } else {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your valuable input! It has been sent.",
      });
      setFeedback("");
      setIsOpen(false);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-lg"
          size="icon"
        >
          <MessageSquarePlus className="h-6 w-6" />
          <span className="sr-only">Provide Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription>
            We'd love to hear your thoughts! What could we improve on this page?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="feedback-form" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">Your Feedback</Label>
            <Textarea
              id="feedback"
              name="feedback"
              placeholder="Tell us what you think..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              required
              disabled={isLoading}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Page:</strong> {pathname}
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="feedback-form" disabled={isLoading}>
            {isLoading ? "Sending..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
