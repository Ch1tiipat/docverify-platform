"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PackagesPortal } from "@/components/dashboard/packages-portal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Shield } from "lucide-react";
import { type Language } from "@/lib/translations";

export default function PricingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("dv_lang") as Language;
      if (savedLang === "en" || savedLang === "th") {
        setLang(savedLang);
      } else {
        const browserLang = navigator.language || (navigator as any).userLanguage || "";
        if (browserLang.toLowerCase().startsWith("th")) {
          setLang("th");
        }
      }
    }
  }, []);

  const isThai = lang === "th";

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_50rem_at_top,theme(colors.primary.100),white)] opacity-10 dark:bg-[radial-gradient(60rem_60rem_at_top,theme(colors.primary.900),theme(colors.background))] dark:opacity-30" />

      {/* Premium Header/Navigation */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.5 9A1 1 0 0 1 9.5 8h3.5l2.5 2.5v6a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 8.5 16.5V9Zm4.5-1h0.8v1.7h1.7v0.8H13V8Zm-3 3.2h3.5a0.6 0 0 1 0 1.2H10a0.6 0 0 1 0-1.2Zm0 2.2h4a0.6 0 0 1 0 1.2H10a0.6 0 0 1 0-1.2Zm0 2.2h2.5a0.6 0 0 1 0 1.2H10a0.6 0 0 1 0-1.2Z"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">DocVerify</span>
            <span className="text-[10px] text-muted-foreground">Security Ledger</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-9 gap-1.5 rounded-full border-border/40 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isThai ? "ย้อนกลับ" : "Back"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="h-9 gap-1.5 rounded-full border-border/40 hover:bg-background/50 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4 text-primary" />
            <span>{isThai ? "หน้าหลัก" : "Home"}</span>
          </Button>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col justify-center">
        <PackagesPortal lang={lang} />
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border/20 py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 DocVerify Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
