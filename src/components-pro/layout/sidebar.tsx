'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChartBarIcon, 
  CubeIcon, 
  CurrencyDollarIcon, 
  BoltIcon, 
  UsersIcon, 
  ArrowsRightLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

interface SidebarLink {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: { title: string; href: string }[];
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Ensure pathname is never null
  const currentPath = pathname || '/';

  const links: SidebarLink[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <ChartBarIcon className="h-5 w-5" />,
    },
    {
      title: "Market",
      href: "/market",
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
      submenu: [
        { title: "Overview", href: "/market" },
        { title: "Price Analysis", href: "/market/price" },
        { title: "Volume Analysis", href: "/market/volume" },
        { title: "Smart Money", href: "/market/smart-money" },
      ],
    },
    {
      title: "Ordinals",
      href: "/ordinals",
      icon: <CubeIcon className="h-5 w-5" />,
      submenu: [
        { title: "Explorer", href: "/ordinals" },
        { title: "Collections", href: "/ordinals/collections" },
        { title: "Marketplace", href: "/ordinals/marketplace" },
        { title: "Analytics", href: "/ordinals/analytics" },
      ],
    },
    {
      title: "Runes",
      href: "/runes",
      icon: <CubeIcon className="h-5 w-5" />,
      submenu: [
        { title: "Explorer", href: "/runes" },
        { title: "Protocols", href: "/runes/protocols" },
        { title: "Analytics", href: "/runes/analytics" },
      ],
    },
    {
      title: "Mining",
      href: "/mining",
      icon: <BoltIcon className="h-5 w-5" />,
      submenu: [
        { title: "Statistics", href: "/mining" },
        { title: "Profitability", href: "/mining/profitability" },
        { title: "Pools", href: "/mining/pools" },
      ],
    },
    {
      title: "Social",
      href: "/social",
      icon: <UsersIcon className="h-5 w-5" />,
    },
    {
      title: "Arbitrage",
      href: "/arbitrage",
      icon: <ArrowsRightLeftIcon className="h-5 w-5" />,
    },
  ];

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col border-r border-zinc-800 bg-zinc-900/50 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-end px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {links.map((link) => (
            <div key={link.href} className="space-y-1">
              {link.submenu ? (
                <>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start font-normal",
                      currentPath.startsWith(link.href) && "bg-zinc-800/80"
                    )}
                    onClick={() => toggleSubmenu(link.title)}
                  >
                    {link.icon}
                    {!collapsed && (
                      <span className="ml-2 flex-1 text-left">{link.title}</span>
                    )}
                    {!collapsed && openSubmenu === link.title && (
                      <ChevronLeftIcon className="h-4 w-4" />
                    )}
                    {!collapsed && openSubmenu !== link.title && (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </Button>
                  {!collapsed && openSubmenu === link.title && (
                    <div className="ml-6 space-y-1">
                      {link.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={cn(
                            "flex h-8 items-center rounded-md px-3 text-sm font-medium",
                            currentPath === subitem.href
                              ? "bg-zinc-800 text-white"
                              : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                          )}
                        >
                          {subitem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={link.href}
                  className={cn(
                    "flex h-9 items-center rounded-md px-3",
                    currentPath === link.href
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white",
                    collapsed && "justify-center px-0"
                  )}
                >
                  {link.icon}
                  {!collapsed && <span className="ml-2">{link.title}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <div className="h-2 w-2 rounded-full bg-green-500" />
          {!collapsed && <span className="text-xs text-zinc-400">All systems operational</span>}
        </div>
      </div>
    </div>
  );
}