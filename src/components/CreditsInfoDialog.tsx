import { useMemo } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreditsInfoDialogProps {
  credits: number;
  dailyLimit?: number;
}

const CreditsInfoDialog = ({ credits, dailyLimit = 5 }: CreditsInfoDialogProps) => {
  const safeCredits = Math.max(0, Math.min(dailyLimit, credits));
  const usedCredits = useMemo(() => Math.max(0, dailyLimit - safeCredits), [dailyLimit, safeCredits]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <Zap className="w-4 h-4 mr-1 text-accent" />
          {safeCredits} credits
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daily credits</DialogTitle>
          <DialogDescription>
            Track your usage just like Lovable style credit meter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Available now</span>
              <span className="font-medium text-foreground">{safeCredits} / {dailyLimit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Used today</span>
              <span className="font-medium text-foreground">{usedCredits}</span>
            </div>
          </div>

          {safeCredits <= 0 && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive">
              You&apos;ve reached your limit. Next credits refresh at 00:00 (Europe/Moscow).
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Daily credits are refreshed at midnight (Europe/Moscow).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditsInfoDialog;
