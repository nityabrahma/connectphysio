
// This layout removes the main app UI for a clean print view.
export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="bg-white">{children}</main>;
}
