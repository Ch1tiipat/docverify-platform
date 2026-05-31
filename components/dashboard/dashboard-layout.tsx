"use client";

import { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { translations, type Language } from "@/lib/translations";
import { SidebarNav } from "./sidebar-nav";
import { Overview } from "./overview";
import { IssuerPortal } from "./issuer-portal";
import { VerifierPortal } from "./verifier-portal";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Fingerprint,
  Sun,
  Moon,
  Bell,
  HelpCircle,
  Upload,
  Shield,
  ScanLine,
} from "lucide-react";

export function DashboardLayout() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState("overview");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);

  // Avoid hydration mismatch by only rendering theme-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const t = translations[lang];

  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === "en" ? "th" : "en"));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const handleHelpClick = useCallback(() => {
    setShowHelpModal(true);
  }, []);

  const markAllRead = useCallback(() => {
    setNotificationsRead(true);
  }, []);

  const notifications = [
    {
      id: 1,
      message: t.notification1,
      time: t.time2min,
      color: "bg-primary",
    },
    {
      id: 2,
      message: t.notification2,
      time: t.time15min,
      color: "bg-blue-500",
    },
    {
      id: 3,
      message: t.notification3,
      time: t.time1hr,
      color: "bg-amber-500",
    },
  ];

  const helpSteps = [
    {
      icon: Upload,
      title: t.step1Title,
      description: t.step1Desc,
    },
    {
      icon: Shield,
      title: t.step2Title,
      description: t.step2Desc,
    },
    {
      icon: ScanLine,
      title: t.step3Title,
      description: t.step3Desc,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        onHelpClick={handleHelpClick}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-sm">
          {/* Logo (mobile/tablet) */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Fingerprint className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{t.appName}</span>
              <span className="text-xs text-muted-foreground">{t.enterprise}</span>
            </div>
          </div>

          <div className="hidden lg:block" />

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="h-9 gap-2 rounded-full px-3"
            >
              <span className="flex h-6 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {lang.toUpperCase()}
              </span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {!notificationsRead && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="border-b border-border/40 p-4">
                  <h3 className="font-semibold text-foreground">{t.notifications}</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 border-b border-border/40 p-4 last:border-0"
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.color}`} />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/40 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={markAllRead}
                  >
                    {t.markAllRead}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Help */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleHelpClick}
              className="h-9 w-9 rounded-full"
            >
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && <Overview lang={lang} />}
          {activeTab === "issuer" && <IssuerPortal lang={lang} />}
          {activeTab === "verifier" && <VerifierPortal lang={lang} />}
        </main>
      </div>

      {/* Help Modal */}
      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="sm:max-w-lg border-border/40 bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {t.helpTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Step-by-step guide on how to use DocVerify
            </DialogDescription>
            {/* โค้ดปุ่ม X ที่ซ้อนกันถูกลบออกไปจากตรงนี้แล้วครับ */}
          </DialogHeader>

          <div className="space-y-6 py-4">
            {helpSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      <span className="mr-2 text-primary">Step {index + 1}:</span>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}