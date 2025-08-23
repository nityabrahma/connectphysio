
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
import { useLocalStorage } from "@/hooks/use-local-storage";
import { generateId } from "@/lib/ids";

const FEEDBACK_LS_KEY = "connectphysio:feedback";

interface FeedbackSubmission {
  id: string;
  feedback: string;
  page: string;
  submittedAt: string;
}

export function FeedbackForm() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmissions, setFeedbackSubmissions] = useLocalStorage<
    FeedbackSubmission[]
  >(FEEDBACK_LS_KEY, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim().length === 0) {
      toast({
        variant: "destructive",
        title: "Feedback cannot be empty",
      });
      return;
    }

    const newSubmission: FeedbackSubmission = {
      id: generateId(),
      feedback,
      page: pathname,
      submittedAt: new Date().toISOString(),
    };

    setFeedbackSubmissions([...feedbackSubmissions, newSubmission]);

    toast({
      title: "Feedback Submitted",
      description: "Thank you for your valuable input!",
    });
    setFeedback("");
    setIsOpen(false);
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
              placeholder="Tell us what you think..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              required
            />
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Page:</strong> {pathname}
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="feedback-form">
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
