"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  Leaf,
  LayoutDashboard,
  Layers,
  Box,
  ShoppingCart,
  SlidersHorizontal,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/categories", icon: Layers, label: "Danh mục" },
  { href: "/admin/products", icon: Box, label: "Sản phẩm" },
  { href: "/admin/option-groups", icon: SlidersHorizontal, label: "Tuỳ chọn" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Đơn hàng" },
];

import * as React from "react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  React.useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };
    fetchUser();
  }, [supabase.auth]);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-primary/10 bg-surface"
    >
      <SidebarHeader className="p-6 transition-all duration-300 group-data-[state=collapsed]:p-2 group-data-[state=collapsed]:items-center">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-data-[state=collapsed]:size-8">
            <Leaf className="size-6 fill-primary/10 group-data-[state=collapsed]:size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none transition-all duration-300 group-data-[state=collapsed]:hidden group-data-[state=collapsed]:opacity-0">
            <span className="font-headline font-extrabold text-primary tracking-tighter text-lg leading-tight uppercase">
              Fruitholic
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-on-surface-variant opacity-60 font-bold">
              Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-6 group-data-[state=collapsed]:px-1 transition-all duration-300">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.25em] font-black text-on-surface-variant opacity-40 px-4 mb-4 group-data-[state=collapsed]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "h-12 px-5 rounded-full transition-all duration-300 relative",
                        "group-data-[state=collapsed]:h-10 group-data-[state=collapsed]:w-10 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:mx-auto group-data-[state=collapsed]:justify-center",
                        active
                          ? "bg-primary/10 text-primary font-extrabold shadow-sm after:content-[''] after:absolute after:left-2 after:top-1/2 after:-translate-y-1/2 after:w-1.5 after:h-1.5 after:bg-secondary after:rounded-full group-data-[state=collapsed]:after:hidden"
                          : "text-on-surface-variant/80 hover:bg-primary/5 hover:text-primary transition-colors",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-5 transition-all duration-300",
                          active
                            ? "text-primary scale-110"
                            : "text-on-surface-variant/70 group-hover/menu-button:text-primary",
                        )}
                      />
                      <span className="font-headline font-semibold text-sm tracking-wide ml-1 group-data-[state=collapsed]:hidden">
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-primary/5 group-data-[state=collapsed]:p-2 transition-all duration-300">
        {userEmail && (
          <div className="px-5 mb-2 group-data-[state=collapsed]:hidden animate-in fade-in slide-in-from-bottom-1 duration-500">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-50 font-bold mb-0.5">
              Welcome,
            </p>
            <p className="text-xs font-semibold text-primary truncate">
              {userEmail}
            </p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Đăng xuất"
              className={cn(
                "h-12 px-5 rounded-full text-on-surface-variant/70 hover:bg-error/5 hover:text-error transition-all",
                "group-data-[state=collapsed]:h-10 group-data-[state=collapsed]:w-10 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:mx-auto group-data-[state=collapsed]:justify-center",
              )}
            >
              <LogOut className="size-5" />
              <span className="font-headline font-semibold text-sm ml-1 group-data-[state=collapsed]:hidden">
                Đăng xuất
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
