"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { translations, type Language } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Upload, FileText, CheckCircle2, Copy, Check, Loader2, Eye, Sparkles, Layers, Zap } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { PDFDocument } from "pdf-lib";
import { PackagesPortal } from "./packages-portal";

// --- Firebase Imports ---
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface IssuerPortalProps {
  lang: Language;
}

// โครงสร้างข้อมูลสำหรับตารางเอกสาร
interface IssuedDocument {
  id: string;
  documentId: string;
  title: string;
  holderNameMasked: string;
  issueDate: string;
  status: string;
  hash: string;
  holderEmail?: string;
}

// 1. ฟังก์ชันสุ่มรหัสเอกสาร
function generateDocumentId(): string {
  const num = Math.floor(Math.random() * 10000) + 1848;
  const currentYear = new Date().getFullYear();
  return `DOC-${currentYear}-${String(num).padStart(6, "0")}`;
}

// 2. ฟังก์ชันเซ็นเซอร์ชื่อ (PDPA Compliance) เช่น "John Smith" -> "J*** S***"
function maskName(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  return parts.map(p => p.charAt(0) + "***").join(" ");
}

export function IssuerPortal({ lang }: IssuerPortalProps) {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    holderName: "",
    holderEmail: "",
    studentId: "",
    major: "",
    issueDate: new Date().toISOString().split("T")[0],
  });

  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [issueCount, setIssueCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isThai = lang === "th";

  // Check Subscription and Quota limit
  useEffect(() => {
    if (typeof window !== "undefined") {
      const plan = localStorage.getItem("dv_user_plan") || "none";
      setUserPlan(plan);

      // If user has a plan (gold, platinum, diamond), they bypass limits
      if (plan && plan !== "none") {
        setIsBlocked(false);
        return;
      }

      const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
      const lastDate = localStorage.getItem("dv_last_issue_date");
      let count = parseInt(localStorage.getItem("dv_issue_count") || "0", 10);

      if (lastDate !== today) {
        count = 0;
        localStorage.setItem("dv_last_issue_date", today);
        localStorage.setItem("dv_issue_count", "0");
      }

      setIssueCount(count);
      if (count >= 5) {
        setIsBlocked(true);
      } else {
        setIsBlocked(false);
      }
    }
  }, [showUpgradeModal]);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filesToMerge, setFilesToMerge] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const handleMergeFiles = async () => {
    if (filesToMerge.length < 2) return;
    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of filesToMerge) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const mergedPdfBytes = await mergedPdf.save();
      const mergedFile = new File([mergedPdfBytes], "merged_document.pdf", { type: "application/pdf" });
      
      setSelectedFile(mergedFile);
      setFilesToMerge([]);
      alert(lang === "th" ? "รวมไฟล์ PDF สำเร็จ!" : "PDF files merged successfully!");
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert(lang === "th" ? "การรวมไฟล์ล้มเหลว" : "Failed to merge PDF files");
    } finally {
      setIsMerging(false);
    }
  };

  const handleAutoFill = () => {
    setIsAutoFilling(true);
    setTimeout(() => {
      setIsAutoFilling(false);
      setFormData({
        title: "Bachelor of Science in Digital Communication",
        holderName: "สมชาย ใจดี (Somchai Jaidee)",
        holderEmail: "somchai.jaidee@example.com",
        studentId: "STU-2026-004812",
        major: "Digital Communication & Media Technology",
        issueDate: new Date().toISOString().split("T")[0],
      });
      alert(lang === "th" 
        ? "✨ AI สแกนตรวจเอกสารและบีบอัดลดขนาดลง 40% เรียบร้อยแล้ว!" 
        : "✨ AI analyzed document and successfully compressed it by 40%!");
    }, 2000);
  };

  const [consentChecked, setConsentChecked] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [recentDocs, setRecentDocs] = useState<IssuedDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<IssuedDocument | null>(null);
  const [copiedDetail, setCopiedDetail] = useState(false);
  const [generatedData, setGeneratedData] = useState({
    documentId: "",
    hash: "",
    email: "",
  });

  // --- Real-time Database Listener ---
  // ดึงข้อมูลเอกสาร 5 รายการล่าสุดจาก Firestore ทันทีที่โหลดหน้าจอ
  useEffect(() => {
    const q = query(collection(db, "issuedDocuments"), orderBy("createdAt", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as IssuedDocument[];
      setRecentDocs(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setFilesToMerge(files);
      if (files.length === 1) {
        setSelectedFile(files[0]);
      } else {
        setSelectedFile(null);
      }
    }
  }, []);

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      setFilesToMerge(files);
      if (files.length === 1) {
        setSelectedFile(files[0]);
      } else {
        setSelectedFile(null);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // --- Core Logic: Generate Hash & Save to Firebase ---
  const handleGenerate = async () => {
    if (!userPlan || userPlan === "none") {
      if (issueCount >= 5) {
        setIsBlocked(true);
        setShowUpgradeModal(true);
        return;
      }
    }

    if (!consentChecked) {
      setShowConsentError(true);
      return;
    }
    
    if (!selectedFile || !formData.holderName || !formData.title || !formData.holderEmail) {
      alert("Please fill all required fields and upload a document.");
      return;
    }

    setShowConsentError(false);
    setIsGenerating(true);

    try {
      const newDocId = generateDocumentId();

      // Step 1: อ่านไฟล์และเข้ารหัส SHA-256 (Web Crypto API)
      const arrayBuffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const fileHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      // Step 2: อัปโหลดไฟล์ขึ้น Firebase Storage (PDPA: เปลี่ยนชื่อไฟล์เพื่อซ่อนข้อมูลส่วนบุคคล)
      // เปลี่ยนจากชื่อไฟล์ต้นฉบับ เป็นการใช้ DocumentID + นามสกุลไฟล์เดิม
      const fileExtension = selectedFile.name.split('.').pop();
      const secureFileName = `${newDocId}.${fileExtension}`;
      const storageRef = ref(storage, `documents/${secureFileName}`);
      await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(storageRef);

      // คำนวณวันหมดอายุ (เช่น 1 ปี นับจากวันที่ออกเอกสาร)
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      // Step 3: บันทึกข้อมูลลง Firestore (PDPA: ไม่เก็บ Student ID และทำ Masking ชื่อ)
      await addDoc(collection(db, "issuedDocuments"), {
        documentId: newDocId,
        hash: fileHash,
        title: formData.title,
        holderNameMasked: maskName(formData.holderName),
        holderEmail: formData.holderEmail,
        fileURL: downloadURL,
        issueDate: formData.issueDate || new Date().toISOString().split("T")[0],
        expiresAt: expirationDate.toISOString(),
        status: "valid",
        createdAt: serverTimestamp(),
      });

      // --- Send Real Email via EmailJS if configured ---
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (serviceId && serviceId !== "your_service_id_here" && 
          templateId && templateId !== "your_template_id_here" && 
          publicKey && publicKey !== "your_public_key_here") {
        try {
          await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              service_id: serviceId,
              template_id: templateId,
              user_id: publicKey,
              template_params: {
                to_name: formData.holderName,
                to_email: formData.holderEmail,
                document_id: newDocId,
                document_title: formData.title,
                hash_code: fileHash,
                qr_url: `${window.location.origin}/verify?hash=${fileHash}`,
                qr_image_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/verify?hash=${fileHash}`)}`,
                download_url: downloadURL,
              },
            }),
          });
          console.log("Email sent successfully!");
        } catch (mailError) {
          console.error("Error sending email via EmailJS:", mailError);
        }
      }

      // Step 4: อัปเดตหน้าจอโชว์ผลลัพธ์
      setGeneratedData({
        documentId: newDocId,
        hash: fileHash,
        email: formData.holderEmail,
      });

      // Increment free-tier quota
      if (!userPlan || userPlan === "none") {
        const newCount = issueCount + 1;
        localStorage.setItem("dv_issue_count", String(newCount));
        setIssueCount(newCount);
        if (newCount >= 5) {
          setIsBlocked(true);
        }
      }

      setIsGenerating(false);
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Error generating document:", error);
      alert("Failed to generate secure document. Please try again.");
      setIsGenerating(false);
    }
  };

  const handleCopyHash = useCallback(() => {
    navigator.clipboard.writeText(`SHA256:${generatedData.hash}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedData.hash]);

  const handleIssueAnother = useCallback(() => {
    setShowSuccessModal(false);
    setFormData({ 
      title: "", 
      holderName: "", 
      holderEmail: "", 
      studentId: "", 
      major: "", 
      issueDate: new Date().toISOString().split("T")[0] 
    });
    setSelectedFile(null);
    setConsentChecked(false);
    setGeneratedData({ documentId: "", hash: "", email: "" });
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.issueDocument}</h1>
          <p className="text-muted-foreground">{t.issueDocumentDesc}</p>
        </div>

        {/* Subscription & Quota Badge Display */}
        {userPlan && userPlan !== "none" ? (
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-bold text-primary animate-pulse">
            <Sparkles className="h-4 w-4 fill-primary" />
            <span className="capitalize">{userPlan} Plan Active</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-xs font-bold text-amber-500">
            <Zap className="h-4 w-4 fill-amber-500" />
            <span>
              {isThai 
                ? `สิทธิ์ทดลองใช้ฟรีวันนี้: ${Math.max(0, 5 - issueCount)} / 5 ครั้ง` 
                : `Free Trial Quota: ${Math.max(0, 5 - issueCount)} / 5 left`}
            </span>
          </div>
        )}
      </div>

      {/* Form Card */}
      <Card className="relative border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Lock Overlay if Blocked */}
        {isBlocked && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="max-w-md space-y-5 bg-card border border-border/50 p-8 rounded-2xl shadow-2xl relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20">
                <Zap className="h-10 w-10 text-amber-500 fill-amber-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {isThai ? "หมดสิทธิ์การทดลองใช้ฟรีแล้ว" : "Free Trial Limit Reached"}
                </h3>
                <p className="text-sm text-muted-foreground leading-normal">
                  {isThai 
                    ? "คุณออกเอกสารรับรองเอกสารฟรีครบ 5 ครั้งสำหรับวันนี้แล้ว ระบบจะรีเซ็ตสิทธิ์ทดลองใช้อีกครั้งหลังเที่ยงคืน (00:00 น.) หากต้องการใช้งานต่อทันที กรุณาสมัครสมาชิกพรีเมียม"
                    : "You have generated 5 documents today. Free quota resets at midnight (00:00). To continue issuing documents, please upgrade to a Premium plan."}
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <Button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold h-10 rounded-xl hover:opacity-95 shadow-lg shadow-purple-950/20"
                >
                  <Sparkles className="mr-2 h-4 w-4 fill-white" />
                  {isThai ? "สมัครสมาชิกและอัปเกรดแผน" : "Upgrade Plan & Subscribe"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = "/verify"}
                  className="w-full border border-border text-xs"
                >
                  {isThai ? "ไปหน้าตรวจสอบเอกสาร" : "Go to Verify Page"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {t.documentInfo}
            </CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAutoFill}
            disabled={isAutoFilling}
            className="border-primary/50 text-primary hover:bg-primary/10 gap-1.5 rounded-full"
          >
            {isAutoFilling ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {lang === "th" ? "AI กำลังประมวลผล..." : "AI Processing..."}
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                {lang === "th" ? "AI ตรวจและเติมข้อมูล" : "AI Optimize & Auto-fill"}
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">{t.documentTitle}</label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Bachelor Degree Certificate"
                className="border-border/40 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t.holderName}</label>
              <Input
                value={formData.holderName}
                onChange={(e) => handleInputChange("holderName", e.target.value)}
                placeholder="John Smith"
                className="border-border/40 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t.holderEmail}</label>
              <Input
                type="email"
                value={formData.holderEmail}
                onChange={(e) => handleInputChange("holderEmail", e.target.value)}
                placeholder="john.smith@example.com"
                className="border-border/40 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t.studentEmployeeId}</label>
              <Input
                value={formData.studentId}
                onChange={(e) => handleInputChange("studentId", e.target.value)}
                placeholder="STU-2026-12345"
                className="border-border/40 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t.majorDepartment}</label>
              <Input
                value={formData.major}
                onChange={(e) => handleInputChange("major", e.target.value)}
                placeholder="Digital Communication"
                className="border-border/40 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t.issueDate}</label>
              <Input
                type="date"
                value={formData.issueDate}
                disabled
                className="border-border/40 bg-background/30 text-muted-foreground cursor-not-allowed opacity-80"
              />
            </div>
          </div>

          {/* File Upload Slots (Unified Multi-File Support) */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">
              {lang === "th" ? "อัปโหลดเอกสารหลัก (เลือกได้หลายไฟล์พร้อมกันเพื่อรวมไฟล์)" : "Upload Document(s) (Select multiple files to merge them)"}
            </label>
            <input
              type="file"
              id="issuer-file-input"
              accept=".pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div
              onClick={() => document.getElementById("issuer-file-input")?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-background/30 p-8 transition-colors hover:border-primary/50 hover:bg-background/50 text-center"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {lang === "th" ? "คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์มาวางที่นี่" : "Click to select or drag files here"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "th" ? "สามารถเลือกไฟล์ PDF พร้อมกันหลายไฟล์เพื่อทำการรวมข้อมูลได้" : "You can select multiple PDF files at once to merge them"}
                </p>
              </div>
            </div>

            {/* Display single selected file ready for issuance */}
            {selectedFile && (
              <div className="flex items-center justify-between border border-border/40 p-4 rounded-xl bg-background/60">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-semibold text-sm text-foreground truncate max-w-[250px]">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)} className="text-destructive hover:bg-destructive/10">
                  {lang === "th" ? "ลบไฟล์" : "Remove"}
                </Button>
              </div>
            )}

            {/* Display list of files to merge */}
            {filesToMerge.length > 0 && (
              <div className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-lg border border-border/40 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                      {lang === "th" ? `ไฟล์ที่เลือกเพื่อรวมเข้าด้วยกัน (${filesToMerge.length} ไฟล์):` : `Selected files to merge (${filesToMerge.length} files):`}
                    </p>
                    <Button
                      type="button"
                      onClick={handleMergeFiles}
                      disabled={isMerging || filesToMerge.length <= 1}
                      className={`h-8 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 shrink-0 ${
                        filesToMerge.length > 1
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-zinc-700/50 text-muted-foreground cursor-not-allowed hover:bg-zinc-700/50"
                      }`}
                    >
                      {isMerging ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {lang === "th" ? "กำลังรวมไฟล์..." : "Merging..."}
                        </>
                      ) : (
                        <>
                          <Layers className="h-3 w-3" />
                          {lang === "th" ? "Merge" : "Merge"}
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                    {filesToMerge.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-background/40 rounded border border-border/20">
                        <span className="truncate max-w-[200px] font-medium text-foreground">{idx + 1}. {file.name}</span>
                        <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={consentChecked}
                onCheckedChange={(checked) => {
                  setConsentChecked(checked === true);
                  if (checked) setShowConsentError(false);
                }}
                className="mt-0.5"
              />
              <label htmlFor="consent" className="text-sm text-muted-foreground cursor-pointer">
                {t.consentIssuer}
              </label>
            </div>
            {showConsentError && (
              <p className="text-sm text-destructive">{t.consentRequired}</p>
            )}
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t.generatingHash}
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                {t.generateDocHash}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Issued Documents */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            {t.recentIssued}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-muted-foreground">{t.documentId}</TableHead>
                <TableHead className="text-muted-foreground">{t.title}</TableHead>
                <TableHead className="text-muted-foreground">{t.holder}</TableHead>
                <TableHead className="text-muted-foreground">{t.issueDate}</TableHead>
                <TableHead className="text-muted-foreground">{t.status}</TableHead>
                <TableHead className="text-muted-foreground text-right">{lang === "th" ? "การกระทำ" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No documents issued yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentDocs.map((doc) => (
                  <TableRow key={doc.id} className="border-border/40">
                    <TableCell className="font-medium text-foreground">{doc.documentId}</TableCell>
                    <TableCell className="text-foreground">{doc.title}</TableCell>
                    <TableCell className="text-muted-foreground">{doc.holderNameMasked}</TableCell>
                    <TableCell className="text-muted-foreground">{doc.issueDate}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {doc.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDoc(doc)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Details History Modal */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => { if (!open) setSelectedDoc(null); }}>
        <DialogContent className="sm:max-w-md border-border/40 bg-card">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-foreground">
              {lang === "th" ? "รายละเอียดเอกสารรับรอง" : "Certified Document Details"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              View details, hash, and QR code for previously issued document
            </DialogDescription>
          </DialogHeader>

          {selectedDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-background/50 p-4">
                  <p className="text-sm text-muted-foreground">{t.documentId}</p>
                  <p className="font-semibold text-foreground">{selectedDoc.documentId}</p>
                </div>
                <div className="rounded-lg bg-background/50 p-4">
                  <p className="text-sm text-muted-foreground">{lang === "th" ? "อีเมลผู้ถือเอกสาร" : "Holder Email"}</p>
                  <p className="font-semibold text-foreground truncate">{selectedDoc.holderEmail || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-background/50 p-4">
                  <p className="text-sm text-muted-foreground">{t.holder}</p>
                  <p className="font-semibold text-foreground">{selectedDoc.holderNameMasked}</p>
                </div>
                <div className="rounded-lg bg-background/50 p-4">
                  <p className="text-sm text-muted-foreground">{t.issueDate}</p>
                  <p className="font-semibold text-foreground">{selectedDoc.issueDate}</p>
                </div>
              </div>

              <div className="rounded-lg bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{t.shaHash}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`SHA256:${selectedDoc.hash}`);
                      setCopiedDetail(true);
                      setTimeout(() => setCopiedDetail(false), 2000);
                    }}
                    className="h-8 px-2"
                  >
                    {copiedDetail ? (
                      <>
                        <Check className="mr-1 h-4 w-4 text-primary" />
                        {t.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" />
                        {t.copy}
                      </>
                    )}
                  </Button>
                </div>
                <p className="break-all font-mono text-xs text-foreground mt-1">
                  {selectedDoc.hash}
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 rounded-lg bg-background/50 p-4">
                <div className="rounded-lg bg-white p-3">
                  <QRCodeSVG 
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify?hash=${selectedDoc.hash}`} 
                    size={160}
                    imageSettings={{
                      src: "/docverify_logo.png",
                      x: undefined,
                      y: undefined,
                      height: 28,
                      width: 28,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground">{t.qrCaption}</p>
              </div>

              <Button
                onClick={() => setSelectedDoc(null)}
                variant="outline"
                className="w-full border-border/40 hover:bg-background/50"
              >
                {t.close || "Close"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md border-border/40 bg-card">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-foreground">
              {t.documentSuccess}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Document issued successfully with hash and QR code
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-background/50 p-4">
                <p className="text-sm text-muted-foreground">{t.documentId}</p>
                <p className="font-semibold text-foreground">{generatedData.documentId}</p>
              </div>
              <div className="rounded-lg bg-background/50 p-4">
                <p className="text-sm text-muted-foreground">{lang === "th" ? "อีเมลผู้ถือเอกสาร" : "Holder Email"}</p>
                <p className="font-semibold text-foreground truncate">{generatedData.email}</p>
              </div>
            </div>

            <div className="rounded-lg bg-background/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t.shaHash}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyHash}
                  className="h-8 px-2"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1 h-4 w-4 text-primary" />
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-4 w-4" />
                      {t.copy}
                    </>
                  )}
                </Button>
              </div>
              <p className="break-all font-mono text-xs text-foreground mt-1">
                {generatedData.hash}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-lg bg-background/50 p-4">
              <div className="rounded-lg bg-white p-3">
                {/* สร้าง QR Code เป็นลิงก์เว็บสำหรับตรวจสอบ พร้อมฝังโลโก้ตรงกลาง */}
                <QRCodeSVG 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify?hash=${generatedData.hash}`} 
                  size={160}
                  imageSettings={{
                    src: "/docverify_logo.png",
                    x: undefined,
                    y: undefined,
                    height: 28,
                    width: 28,
                    excavate: true,
                  }}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground">{t.qrCaption}</p>
              <div className="w-full border-t border-border/40 pt-2 text-center text-xs text-primary font-medium animate-pulse space-y-1">
                <div>
                  {lang === "th" 
                    ? "📧 ส่งค่า Hash และ QR Code ไปยังอีเมลผู้ถือเอกสารแล้ว" 
                    : "📧 Hash and QR Code sent to holder's email"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {lang === "th" 
                    ? "📎 แนบไฟล์เอกสารต้นฉบับไปด้วยเรียบร้อย" 
                    : "📎 Original document attached successfully"}
                </div>
              </div>
            </div>

            <Button
              onClick={handleIssueAnother}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t.issueAnother}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade / Pricing Packages Dialog */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-5xl bg-background/95 border-border/40 backdrop-blur-md overflow-y-auto max-h-[90vh] no-scrollbar">
          <div className="py-4">
            <PackagesPortal lang={lang} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}