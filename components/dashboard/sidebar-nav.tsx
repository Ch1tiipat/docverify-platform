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
  History,
  FileText,
  Briefcase,
  CreditCard,
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
  { id: "history", labelKey: "historyPortal", icon: <History className="h-5 w-5" /> },
  { id: "verifier", labelKey: "verifierPortal", icon: <ShieldCheck className="h-5 w-5" /> },
  { id: "pricing", labelKey: "packages", icon: <CreditCard className="h-5 w-5" /> },
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
  isMobile?: boolean;
}

export function SidebarNav({ activeTab, setActiveTab, lang, onHelpClick, isMobile = false }: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState(false);
  const t = translations[lang];

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const handleNavClick = useCallback(
    (id: string) => {
      setActiveTab(id);
    },
    [setActiveTab]
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          isMobile ? "w-64" : (collapsed ? "w-16" : "w-64"),
          isMobile ? "flex" : "hidden lg:flex"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Professional Shield Outline */}
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              {/* Refined Document with Crease & Rounded Lines */}
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.5 9A1 1 0 0 1 9.5 8h3.5l2.5 2.5v6a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 8.5 16.5V9Zm4.5-1h0.8v1.7h1.7v0.8H13V8Zm-3 3.2h3.5a0.6 0 0 1 0 1.2H10a0.6 0 0 1 0-1.2Zm0 2.2h4a0.6 0 0 1 0 1.2H10a0.6 0 0 1 0-1.2Zm0 2.2h2.5a0.6 0 0 1 0 1.2H10a0.6 0 0 1 0-1.2Z"
                fill="currentColor"
                stroke="none"
              />
            </svg>
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
          {bottomNavItems.map((item) => {
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
        </div>

        {/* Collapse Toggle */}
        {!isMobile && (
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
        )}
      </aside>
    </TooltipProvider>
  );
}