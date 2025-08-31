
import { Icons } from "@/components/icons";

export function AppLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Icons.logo className="h-12 w-12" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
