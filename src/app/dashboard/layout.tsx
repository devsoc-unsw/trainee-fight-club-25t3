import { AppSidebar } from "@/components/app-sidebar";
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
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-b-border/50 px-4 my-1">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-border/50" />
        </header>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
