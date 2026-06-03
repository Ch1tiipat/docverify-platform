"use client";

import { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { translations, type Language } from "@/lib/translations";
import { SidebarNav } from "./sidebar-nav";
import { Overview } from "./overview";
import { IssuerPortal } from "./issuer-portal";
import { SettingsPortal } from "./settings-portal";
import { VerifierPortal } from "./verifier-portal";
import { HistoryPortal } from "./history-portal";
import { PackagesPortal } from "./packages-portal";
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
  Sun,
  Moon,
  Bell,
  HelpCircle,
  Upload,
  Shield,
  ScanLine,
  Menu,
  Zap,
} from "lucide-react";

// --- Firebase Imports ---
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

function getRelativeTime(timestamp: any, lang: Language) {
  if (!timestamp) return lang === "th" ? "เมื่อสักครู่" : "Just now";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return lang === "th" ? "เมื่อสักครู่" : "Just now";
  if (diffMins < 60) return lang === "th" ? `${diffMins} นาทีที่แล้ว` : `${diffMins} min ago`;
  
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return lang === "th" ? `${diffHrs} ชั่วโมงที่แล้ว` : `${diffHrs} hr ago`;
  
  const diffDays = Math.floor(diffHrs / 24);
  return lang === "th" ? `${diffDays} วันที่แล้ว` : `${diffDays} days ago`;
}

export function DashboardLayout() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState("overview");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // State สำหรับจัดการการแจ้งเตือนจริงจาก Firebase
  const [realNotifications, setRealNotifications] = useState<any[]>([]);

  // Avoid hydration mismatch by only rendering theme-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const t = translations[lang];

  // ดึงข้อมูลการแจ้งเตือนสดจาก Firebase (ทั้งสแกนและออกเอกสาร)
  useEffect(() => {
    let activeDocs: any[] = [];
    let activeLogs: any[] = [];

    const updateNotifications = () => {
      const combined = [...activeDocs, ...activeLogs]
        .sort((a, b) => b.rawTimestamp - a.rawTimestamp)
        .slice(0, 5)
        .map((item) => {
          const relativeTime = getRelativeTime(item.timestamp, lang);
          return {
            id: item.id,
            message: item.message,
            time: relativeTime,
            color: item.color
          };
        });
      setRealNotifications(combined);
    };

    const qDocs = query(collection(db, "issuedDocuments"), orderBy("createdAt", "desc"), limit(5));
    const unsubDocs = onSnapshot(qDocs, (snapshot) => {
      activeDocs = snapshot.docs.map(doc => {
        const data = doc.data();
        const rawTime = data.createdAt ? data.createdAt.toDate() : new Date();
        return {
          id: `doc_${doc.id}`,
          message: lang === "th" 
            ? `เอกสารใหม่ถูกออก: ${data.title} (${data.documentId})` 
            : `New document issued: ${data.title} (${data.documentId})`,
          timestamp: data.createdAt,
          rawTimestamp: rawTime.getTime(),
          color: "bg-blue-500"
        };
      });
      updateNotifications();
    });

    const qLogs = query(collection(db, "scanLogs"), orderBy("timestamp", "desc"), limit(5));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      activeLogs = snapshot.docs.map(doc => {
        const data = doc.data();
        const rawTime = data.timestamp ? data.timestamp.toDate() : new Date();
        const isValid = data.status === "valid";
        return {
          id: `scan_${doc.id}`,
          message: isValid
            ? (lang === "th" 
                ? `เอกสาร ${data.documentId} ผ่านการตรวจสอบสำเร็จ` 
                : `Document ${data.documentId} was verified successfully`)
            : (lang === "th" 
                ? `การตรวจสอบเอกสารล้มเหลว` 
                : `Document verification failed`),
          timestamp: data.timestamp,
          rawTimestamp: rawTime.getTime(),
          color: isValid ? "bg-primary" : "bg-destructive"
        };
      });
      updateNotifications();
    });

    return () => {
      unsubDocs();
      unsubLogs();
    };
  }, [lang]);

  const changeLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("dv_lang", newLang);
    }
  }, []);

  const handleHelpClick = useCallback(() => {
    setShowHelpModal(true);
  }, []);

  const markAllRead = useCallback(() => {
    setNotificationsRead(true);
  }, []);

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

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300" 
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Sidebar drawer content */}
          <div className="relative z-10 w-64 h-full animate-in slide-in-from-left duration-200">
            <SidebarNav
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileSidebarOpen(false);
              }}
              lang={lang}
              onHelpClick={handleHelpClick}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-sm">
          {/* Logo (mobile/tablet) */}
          <div className="flex items-center gap-3 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground mr-1"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden bg-background">
              <img src="/docverify_logo.png" alt="Logo" className="h-7 w-7 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">{t.appName}</span>
              <span className="text-xs text-muted-foreground">{t.enterprise}</span>
            </div>
          </div>

          <div className="hidden lg:block" />

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Upgrade Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("pricing")}
              className="h-9 gap-1.5 rounded-full border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold"
            >
              <Zap className="h-4 w-4 animate-pulse fill-primary" />
              <span>{lang === "th" ? "อัปเกรดบริการ" : "Upgrade Plan"}</span>
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
                  {realNotifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      {lang === "th" ? "ไม่มีการแจ้งเตือนใหม่" : "No new notifications"}
                    </div>
                  ) : (
                    realNotifications.map((notification) => (
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
                    ))
                  )}
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

            {/* Go to Verify Portal */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/verify"}
              className="h-9 gap-1.5 rounded-full border-border/40 hover:bg-background/50 text-muted-foreground hover:text-foreground"
            >
              <ScanLine className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">
                {lang === "th" ? "หน้าตรวจสอบสาธารณะ" : "Public Verify"}
              </span>
            </Button>

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
          {activeTab === "issuer" && <IssuerPortal lang={lang} setActiveTab={setActiveTab} />}
          {activeTab === "history" && <HistoryPortal lang={lang} />}
          {activeTab === "verifier" && <VerifierPortal lang={lang} />}
          {activeTab === "settings" && <SettingsPortal lang={lang} setLang={changeLanguage} />}
          {activeTab === "pricing" && <PackagesPortal lang={lang} />}
        </main>
      </div>
      {/* Upgrade / Pricing Packages Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-5xl bg-background/95 border-border/40 backdrop-blur-md overflow-y-auto max-h-[90vh] no-scrollbar">
          <div className="py-4">
            <PackagesPortal lang={lang} />
          </div>
        </DialogContent>
      </Dialog>
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