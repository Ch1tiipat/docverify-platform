"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { translations, type Language } from "@/lib/translations";
import {
  LayoutDashboard,
  FileUp,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavItem = {
  id: string;
  labelKey: keyof typeof translations.en;
  icon: React.ReactNode;
  isBottom?: boolean;
};

const navItems: NavItem[] = [
  { id: "overview", labelKey: "overview", icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: "issuer", labelKey: "issuerPortal", icon: <FileUp className="h-5 w-5" /> },
  { id: "verifier", labelKey: "verifierPortal", icon: <ShieldCheck className="h-5 w-5" /> },
];

// ลบปุ่ม Help ออกจากกลุ่มเมนูด้านล่าง เหลือแค่ Settings
const bottomNavItems: NavItem[] = [
  { id: "settings", labelKey: "settings", icon: <Settings className="h-5 w-5" />, isBottom: true },
];

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  onHelpClick: () => void;
}

export function SidebarNav({ activeTab, setActiveTab, lang, onHelpClick }: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState(false);
  const t = translations[lang];

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const handleNavClick = useCallback(
    (id: string) => {
      // ตัดเงื่อนไขปุ่ม Help ออกไป เพราะเราลบปุ่มไปแล้ว
      if (id !== "settings") {
        setActiveTab(id);
      }
    },
    [setActiveTab]
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Fingerprint className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">DocVerify</span>
              <span className="text-xs text-muted-foreground">{t.enterprise}</span>
            </div>
          )}
        </div>

        {/* Main Nav */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    <span className={cn(isActive && "text-primary")}>{item.icon}</span>
                    {!collapsed && <span>{t[item.labelKey]}</span>}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="font-medium">
                    {t[item.labelKey]}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom Nav */}
        <div className="space-y-1 border-t border-sidebar-border p-3">
          {bottomNavItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                >
                  {item.icon}
                  {!collapsed && <span>{t[item.labelKey]}</span>}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="font-medium">
                  {t[item.labelKey]}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>
    </TooltipProvider>
  );
}