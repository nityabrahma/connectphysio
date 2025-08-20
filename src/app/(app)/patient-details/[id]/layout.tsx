
import { AuthGate } from '@/components/auth-gate';
import { Topbar } from '@/components/layout/topbar';

export default function PatientDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="flex h-screen bg-secondary/50 overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </AuthGate>
  );
}
