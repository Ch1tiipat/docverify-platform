"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Shield, Home } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { VerifierPortal } from "@/components/dashboard/verifier-portal";
import { type Language } from "@/lib/translations";

type VerificationState = "loading" | "valid" | "invalid" | "no_hash";

function VerifyContent() {
  const searchParams = useSearchParams();
  const hash = searchParams.get("hash");

  const [state, setState] = useState<VerificationState>("loading");
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
  const [result, setResult] = useState({
    documentId: "",
    title: "",
    holderNameMasked: "",
    issueDate: "",
    expiresAt: "",
    hash: "",
  });

  useEffect(() => {
    if (!hash) {
      setState("no_hash");
      return;
    }

    const verifyHash = async () => {
      try {
        const q = query(
          collection(db, "issuedDocuments"),
          where("hash", "==", hash),
          where("status", "==", "valid")
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          
          // Check expiration
          let isValid = true;
          if (docData.expiresAt) {
            const expiry = new Date(docData.expiresAt);
            if (expiry < new Date()) {
              isValid = false;
            }
          }

          if (isValid) {
            setResult({
              documentId: docData.documentId || "Unknown",
              title: docData.title || "Untitled Document",
              holderNameMasked: docData.holderNameMasked || "Masked Name",
              issueDate: docData.issueDate || "-",
              expiresAt: docData.expiresAt ? new Date(docData.expiresAt).toLocaleDateString() : "-",
              hash: docData.hash,
            });
            setState("valid");

            // Save success scan log
            await addDoc(collection(db, "scanLogs"), {
              scannedHash: hash,
              status: "valid",
              documentId: docData.documentId || "Unknown",
              timestamp: serverTimestamp(),
            });
          } else {
            setState("invalid");
            // Save expired/invalid scan log
            await addDoc(collection(db, "scanLogs"), {
              scannedHash: hash,
              status: "invalid",
              documentId: docData.documentId || "Unknown",
              timestamp: serverTimestamp(),
            });
          }
        } else {
          setState("invalid");
          // Save invalid scan log
          await addDoc(collection(db, "scanLogs"), {
            scannedHash: hash,
            status: "invalid",
            documentId: null,
            timestamp: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Verification error:", error);
        setState("invalid");
      }
    };

    verifyHash();
  }, [hash]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.100),white)] opacity-20 dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.900),theme(colors.background))] dark:opacity-40" />

      {state === "loading" && (
        <Card className="w-full max-w-md border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary/20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold">กำลังตรวจสอบเอกสาร...</h2>
              <p className="text-sm text-muted-foreground">กำลังค้นหาและตรวจสอบค่าลายเซ็นดิจิทัลในระบบ</p>
            </div>
          </CardContent>
        </Card>
      )}

      {state === "valid" && (
        <Card className="w-full max-w-md border-2 border-emerald-500 bg-emerald-500/5 backdrop-blur-sm shadow-emerald-500/10 shadow-2xl">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold text-emerald-500 tracking-wider">VERIFIED</h2>
              <p className="text-lg font-medium">เอกสารนี้ถูกต้องแท้จริง</p>
            </div>

            <div className="w-full space-y-3 border-y border-border/40 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">ชื่อเอกสาร</p>
                  <p className="font-semibold text-sm truncate">{result.title}</p>
                </div>
                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">ชื่อผู้ถือเอกสาร</p>
                  <p className="font-semibold text-sm truncate">{result.holderNameMasked}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">วันที่ออกเอกสาร</p>
                  <p className="font-semibold text-sm truncate">{result.issueDate}</p>
                </div>
                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">วันหมดอายุการรับรอง</p>
                  <p className="font-semibold text-sm truncate text-amber-500 dark:text-amber-400">{result.expiresAt}</p>
                </div>
              </div>

              <div className="rounded-lg bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">รหัสความปลอดภัย (SHA-256)</p>
                <p className="truncate font-mono text-xs text-foreground select-all">
                  {result.hash}
                </p>
              </div>
            </div>

            <div className="w-full space-y-2">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  กลับไปหน้าหลัก
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {state === "invalid" && (
        <Card className="w-full max-w-md border-2 border-destructive bg-destructive/5 backdrop-blur-sm shadow-destructive/10 shadow-2xl">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold text-destructive tracking-wider">INVALID</h2>
              <p className="text-lg font-medium">การตรวจสอบเอกสารล้มเหลว</p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              ไม่พบรหัสเอกสารนี้ในระบบรับรองความถูกต้อง หรือเอกสารนี้หมดอายุการใช้งานแล้ว โปรดตรวจสอบไฟล์เอกสารต้นฉบับอีกครั้ง
            </p>

            <div className="w-full space-y-2">
              <Button asChild variant="destructive" className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  กลับไปหน้าหลัก
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {state === "no_hash" && (
        <div className="w-full max-w-4xl bg-card/30 backdrop-blur-sm p-6 rounded-2xl border border-border/40 shadow-xl space-y-4">
          <div className="flex justify-end">
            <Button asChild size="sm" variant="outline" className="border-border/40 hover:bg-background/50">
              <Link href="/">
                <Home className="mr-1.5 h-4 w-4" />
                {lang === "th" ? "แดชบอร์ดระบบ" : "Go to Dashboard"}
              </Link>
            </Button>
          </div>
          <VerifierPortal lang={lang} />
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">กำลังโหลดหน้ายืนยันเอกสาร...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
