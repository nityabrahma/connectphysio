
import { AuthGate } from "@/components/auth-gate";

export default function AssignPackageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="flex-1 overflow-y-auto size-full">{children}</div>
    </AuthGate>
  );
}
