
import { Icons } from "@/components/icons";
import { Card } from "./ui/card";

export function AppLoader() {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 w-[50%] h-[30%] bg-background rounded-xl border-2">
      <Icons.logo className="h-12 w-12 animate-pulse" />
      <p className="text-muted-foreground">Loading...</p>
    </Card>
  );
}
