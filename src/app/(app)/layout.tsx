import { AuthGate } from '@/components/auth-gate';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-screen bg-secondary/50">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</div>
        </main>
      </div>
    </AuthGate>
  );
}
