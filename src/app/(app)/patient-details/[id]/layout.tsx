import { AuthGate } from "@/components/auth-gate";
import { Topbar } from "@/components/layout/topbar";

export default function PatientDetailLayout({
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
