import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-outline-variant/10 px-4 pt-2">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="pt-4 px-4 pb-12">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
