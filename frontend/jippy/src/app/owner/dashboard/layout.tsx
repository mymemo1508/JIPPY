import Navbar from "@/features/owner/navbar/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <main className="pt-[60px] px-4">{children}</main>
    </div>
  );
}
