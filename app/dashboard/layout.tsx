import Navbar from "../components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {children}
      </main>
      <footer
        className="py-6 border-t text-center text-xs font-medium"
        style={{ borderColor: "var(--divider)", color: "var(--text-muted)" }}
      >
        GEARIFY REMASTERED APMS v2.0 — Built for Automotive Workshop Performance
      </footer>
    </>
  );
}
