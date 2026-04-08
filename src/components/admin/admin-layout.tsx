"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  LayoutTemplate,
  FileText,
  Briefcase,
  FolderOpen,
  Users,
  Star,
  Mail,
  Settings,
  LogOut,
  Code,
  Menu,
  X,
  ChevronRight,
  Headphones,
  UserCog,
} from "lucide-react";
import { useMemo, useState } from "react";

type SidebarLink = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  requireAdmin?: boolean;
};

const sidebarLinkDefs: SidebarLink[] = [
  { href: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/admin/pages", label: "หน้าเว็บไซต์", icon: FileText },
  { href: "/admin/hero-design", label: "Hero Design", icon: LayoutTemplate },
  { href: "/admin/services", label: "บริการ", icon: Briefcase },
  { href: "/admin/portfolio", label: "ผลงาน", icon: FolderOpen },
  { href: "/admin/blog", label: "บทความ", icon: FileText },
  { href: "/admin/team", label: "ทีมงาน", icon: Users },
  { href: "/admin/testimonials", label: "รีวิวลูกค้า", icon: Star },
  { href: "/admin/contacts", label: "ข้อความติดต่อ", icon: Mail },
  { href: "/admin/chat-agents", label: "แชทซัพพอร์ต", icon: Headphones, requireAdmin: true },
  { href: "/admin/users", label: "ผู้ใช้แอดมิน", icon: UserCog, requireAdmin: true },
  { href: "/admin/settings", label: "ตั้งค่า", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const sidebarLinks = useMemo(
    () => sidebarLinkDefs.filter((l) => !l.requireAdmin || role === "admin"),
    [role]
  );

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r bg-background">
        <div className="p-4 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              <Code className="h-4 w-4" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm">TRS</p>
              <p className="text-xs text-muted-foreground">แผงผู้ดูแลระบบ</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-2">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
            ดูเว็บไซต์
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b bg-background flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h2 className="font-medium text-sm hidden sm:block">
              {sidebarLinks.find((l) => l.href === pathname || (l.href !== "/admin" && pathname.startsWith(l.href)))
                ?.label || "แดชบอร์ด"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs text-muted-foreground hidden sm:block">
              {session?.user?.email}
            </span>
          </div>
        </header>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed left-0 top-0 h-full w-64 bg-background border-r shadow-xl p-4 space-y-1">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <Link href="/admin" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    <Code className="h-4 w-4" />
                  </div>
                  <span className="font-heading font-bold text-sm">TRS ผู้ดูแลระบบ</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4 shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 border-t mt-4 space-y-1">
                <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                  <ChevronRight className="h-4 w-4" /> ดูเว็บไซต์
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full"
                >
                  <LogOut className="h-4 w-4" /> ออกจากระบบ
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
