
"use client";

import { useState, useContext, createContext } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { sendFeedbackEmail } from "@/actions/send-feedback";


interface FeedbackContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <FeedbackContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
};


export const FeedbackButton = () => {
    const { setIsOpen } = useFeedback();
    return (
         <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            aria-label="Provide Feedback"
        >
            <MessageSquarePlus className="h-5 w-5" />
        </Button>
    )
}


export function FeedbackDialog() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isOpen, setIsOpen } = useFeedback();
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
  
  // Reset feedback text when dialog is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setFeedback("");
        setIsLoading(false);
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
