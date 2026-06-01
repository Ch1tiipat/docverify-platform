"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { translations, type Language } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShieldCheck,
  Upload,
  QrCode,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Firebase Imports ---
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

interface VerifierPortalProps {
  lang: Language;
}

type VerificationState = "idle" | "verifying" | "valid" | "invalid";
type VerifyMethod = "upload" | "qr" | null;

export function VerifierPortal({ lang }: VerifierPortalProps) {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 🌟 เพิ่ม useRef สำหรับจำตัวแปรกล้อง ป้องกัน Memory Leak
  const scannerRef = useRef<any>(null);

  const [verificationState, setVerificationState] = useState<VerificationState>("idle");
  const [selectedMethod, setSelectedMethod] = useState<VerifyMethod>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scannedHash, setScannedHash] = useState<string | null>(null); 
  const [consentChecked, setConsentChecked] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  
  const [verificationResult, setVerificationResult] = useState({
    hash: "",
    timestamp: "",
    title: "",
    holderNameMasked: "",
  });

  // --- ระบบเปิดกล้อง QR Code (อัปเดตแก้ Memory Leak) ---
  useEffect(() => {
    let isMounted = true;

    if (selectedMethod === "qr" && !scannedHash && verificationState === "idle") {
      import("html5-qrcode").then(({ Html5Qrcode }) => {
        if (!isMounted) return;
        
        // เคลียร์กล้องเก่าที่อาจจะค้างอยู่ก่อนเปิดใหม่
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
        
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode; // เก็บตัวตนกล้องไว้ใน Ref

        html5QrCode.start(
          { facingMode: "environment" }, 
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => { 
            setScannedHash(decodedText);
            // ปิดกล้องทันทีเมื่อสแกนสำเร็จ
            if (scannerRef.current?.isScanning) {
              scannerRef.current.stop().catch(() => {}); 
            }
          },
          (errorMessage: string) => { 
            // Silent Catch: ซ่อน error ที่เกิดระหว่างหามุมสแกน
          }
        ).catch(() => {
          // Silent Catch: ซ่อน Error ในกรณีที่ PC ไม่มีกล้อง หรือไม่อนุญาต
        });
      });
    }

    // Cleanup Function: ปิดกล้องให้สนิทเมื่อสลับหน้าจอ
    return () => {
      isMounted = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [selectedMethod, scannedHash, verificationState]);

  const handleMethodSelect = useCallback((method: VerifyMethod) => {
    setSelectedMethod(method);
    setSelectedFile(null);
    setScannedHash(null);
    setShowConsentError(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  }, []);

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // --- ฟังก์ชันแปลงไฟล์เป็น Hash (Web Crypto API) ---
  const getFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // --- Core Logic: ตรวจสอบข้อมูลกับ Firebase & บันทึก Log ---
  const handleVerify = async () => {
    if (!consentChecked) {
      setShowConsentError(true);
      return;
    }
    setShowConsentError(false);
    setVerificationState("verifying");

    try {
      let hashToVerify = "";

      if (selectedMethod === "upload" && selectedFile) {
        hashToVerify = await getFileHash(selectedFile);
      } else if (selectedMethod === "qr" && scannedHash) {
        // หาก QR code ที่สแกนได้เป็น URL ให้แกะเอาเฉพาะค่า hash ออกมา
        let parsedHash = scannedHash;
        if (scannedHash.includes("hash=")) {
          try {
            const urlObj = new URL(scannedHash);
            parsedHash = urlObj.searchParams.get("hash") || scannedHash;
          } catch (e) {
            const match = scannedHash.match(/[?&]hash=([^&]+)/);
            if (match) parsedHash = match[1];
          }
        }
        hashToVerify = parsedHash;
      } else {
        throw new Error("No data to verify");
      }

      const q = query(
        collection(db, "issuedDocuments"),
        where("hash", "==", hashToVerify),
        where("status", "==", "valid") 
      );
      
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setVerificationResult({
          hash: docData.hash,
          timestamp: new Date().toLocaleString(),
          title: docData.title,
          holderNameMasked: docData.holderNameMasked,
        });
        setVerificationState("valid");

        // 🌟 บันทึก Log การสแกนสำเร็จ
        await addDoc(collection(db, "scanLogs"), {
          scannedHash: hashToVerify,
          status: "valid",
          documentId: docData.documentId || "Unknown",
          timestamp: serverTimestamp(),
        });
      } else {
        setVerificationState("invalid");

        // 🌟 บันทึก Log การสแกนไม่สำเร็จ (Invalid)
        await addDoc(collection(db, "scanLogs"), {
          scannedHash: hashToVerify,
          status: "invalid",
          documentId: null,
          timestamp: serverTimestamp(),
        });
      }

    } catch (error) {
      // เอา console.error ออก เพื่อให้โค้ดคลีนที่สุดในระดับ Production
      setVerificationState("invalid");
    }
  };

  const handleReset = useCallback(() => {
    setVerificationState("idle");
    setSelectedMethod(null);
    setSelectedFile(null);
    setScannedHash(null);
    setConsentChecked(false);
    setShowConsentError(false);
    setVerificationResult({ hash: "", timestamp: "", title: "", holderNameMasked: "" });
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canVerify = consentChecked && ((selectedMethod === "upload" && selectedFile) || (selectedMethod === "qr" && scannedHash));

  // ---------------- UI RENDERING ----------------

  if (verificationState === "idle") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.verifyDocument}</h1>
          <p className="text-muted-foreground">{t.verifyDocumentDesc}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Upload Method */}
          <Card
            onClick={() => handleMethodSelect("upload")}
            className={cn(
              "cursor-pointer border-2 transition-all duration-200",
              selectedMethod === "upload" ? "border-primary bg-primary/5" : "border-border/40 bg-card/50 hover:border-primary/50"
            )}
          >
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <div className={cn("flex h-16 w-16 items-center justify-center rounded-full transition-colors", selectedMethod === "upload" ? "bg-primary/20" : "bg-muted")}>
                <Upload className={cn("h-8 w-8", selectedMethod === "upload" ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground">{t.uploadToVerify}</h3>
                <p className="text-sm text-muted-foreground">{t.uploadToVerifyDesc}</p>
              </div>

              {selectedMethod === "upload" && (
                <div className="w-full pt-2">
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleFileSelect} className="hidden" />
                  <div
                    onClick={(e) => { e.stopPropagation(); handleDropZoneClick(); }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-background/30 p-4 transition-colors hover:border-primary/50"
                  >
                    {selectedFile ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t.dragDropText}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Method */}
          <Card
            onClick={() => handleMethodSelect("qr")}
            className={cn(
              "cursor-pointer border-2 transition-all duration-200",
              selectedMethod === "qr" ? "border-primary bg-primary/5" : "border-border/40 bg-card/50 hover:border-primary/50"
            )}
          >
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <div className={cn("flex h-16 w-16 items-center justify-center rounded-full transition-colors", selectedMethod === "qr" ? "bg-primary/20" : "bg-muted")}>
                <QrCode className={cn("h-8 w-8", selectedMethod === "qr" ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground">{t.scanQrCode}</h3>
                <p className="text-sm text-muted-foreground">{t.scanQrCodeDesc}</p>
              </div>

              {selectedMethod === "qr" && (
                <div className="w-full pt-4">
                  {!scannedHash ? (
                    <div id="qr-reader" className="w-full overflow-hidden rounded-lg border-2 border-primary/20 bg-black/5"></div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-blue-500 dark:text-blue-400 animate-in fade-in zoom-in duration-300">
                      <QrCode className="h-8 w-8 animate-pulse" />
                      <p className="text-sm font-bold">QR Code Detected</p>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">{scannedHash}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {selectedMethod && (
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent-verifier"
                checked={consentChecked}
                onCheckedChange={(checked) => {
                  setConsentChecked(checked === true);
                  if (checked) setShowConsentError(false);
                }}
                className="mt-0.5"
              />
              <label htmlFor="consent-verifier" className="text-sm text-muted-foreground cursor-pointer">
                {t.consentVerifier}
              </label>
            </div>
            {showConsentError && (
              <p className="text-sm text-destructive">{t.consentRequired}</p>
            )}
          </div>
        )}

        <Button
          onClick={handleVerify}
          disabled={!canVerify}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          size="lg"
        >
          <ShieldCheck className="mr-2 h-5 w-5" />
          {t.verifyAuthenticity}
        </Button>
      </div>
    );
  }

  if (verificationState === "verifying") {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">{t.verifying}</h2>
              <p className="text-muted-foreground">{t.checkingSignatures}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationState === "valid") {
    return (
      <div className="flex min-h-[400px] items-center justify-center animate-in slide-in-from-bottom-4 duration-500">
        <Card className="w-full max-w-md border-2 border-emerald-500 bg-emerald-500/5 backdrop-blur-sm shadow-emerald-500/10 shadow-xl">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{t.verifiedStatus || "Authentic"}</h2>
              <p className="text-lg text-foreground">{t.documentAuthentic}</p>
            </div>

            <div className="w-full space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">{t.documentTitle || "Document"}</p>
                  <p className="font-medium text-sm text-foreground truncate">{verificationResult.title}</p>
                </div>
                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">{t.holderName || "Holder"}</p>
                  <p className="font-medium text-sm text-foreground truncate">{verificationResult.holderNameMasked}</p>
                </div>
              </div>

              <div className="rounded-lg bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">{t.matchedHash || "Matched Hash"}</p>
                <p className="truncate font-mono text-xs text-foreground">
                  {verificationResult.hash.slice(0, 32)}...
                </p>
              </div>
              <div className="rounded-lg bg-background/60 p-3 flex justify-between items-center">
                <p className="text-xs text-muted-foreground">{t.verifiedAt || "Verified at"}</p>
                <p className="font-medium text-xs text-foreground">{verificationResult.timestamp}</p>
              </div>
            </div>

            <Button onClick={handleReset} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
              {t.verifyAnother}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationState === "invalid") {
    return (
      <div className="flex min-h-[400px] items-center justify-center animate-in shake duration-500">
        <Card className="w-full max-w-md border-2 border-destructive bg-destructive/5 backdrop-blur-sm shadow-destructive/10 shadow-xl">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-destructive">{t.invalidStatus}</h2>
              <p className="text-lg text-foreground">{t.verificationFailed}</p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {t.verificationFailedDesc}
            </p>

            <Button onClick={handleReset} variant="destructive" className="w-full">
              {t.tryAgain}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}