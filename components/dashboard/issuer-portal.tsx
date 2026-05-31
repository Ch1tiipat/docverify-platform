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
import { Shield, Upload, FileText, CheckCircle2, Copy, Check, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// --- Firebase Imports ---
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

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
}

// 1. ฟังก์ชันสุ่มรหัสเอกสาร
function generateDocumentId(): string {
  const num = Math.floor(Math.random() * 10000) + 1848;
  return `DOC-2024-${String(num).padStart(6, "0")}`;
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
    studentId: "",
    major: "",
    issueDate: "",
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [recentDocs, setRecentDocs] = useState<IssuedDocument[]>([]);
  const [generatedData, setGeneratedData] = useState({
    documentId: "",
    hash: "",
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

  // --- Core Logic: Generate Hash & Save to Firebase ---
  const handleGenerate = async () => {
    if (!consentChecked) {
      setShowConsentError(true);
      return;
    }
    
    if (!selectedFile || !formData.holderName || !formData.title) {
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

      // Step 3: บันทึกข้อมูลลง Firestore (PDPA: ไม่เก็บ Student ID และทำ Masking ชื่อ)
      await addDoc(collection(db, "issuedDocuments"), {
        documentId: newDocId,
        hash: fileHash,
        title: formData.title,
        holderNameMasked: maskName(formData.holderName),
        issueDate: formData.issueDate || new Date().toISOString().split("T")[0],
        status: "valid",
        createdAt: serverTimestamp(),
      });

      // Step 4: อัปเดตหน้าจอโชว์ผลลัพธ์
      setGeneratedData({
        documentId: newDocId,
        hash: fileHash,
      });
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
    setFormData({ title: "", holderName: "", studentId: "", major: "", issueDate: "" });
    setSelectedFile(null);
    setConsentChecked(false);
    setGeneratedData({ documentId: "", hash: "" });
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.issueDocument}</h1>
        <p className="text-muted-foreground">{t.issueDocumentDesc}</p>
      </div>

      {/* Form Card */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            {t.documentInfo}
          </CardTitle>
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
              <label className="text-sm font-medium text-foreground">{t.studentEmployeeId}</label>
              <Input
                value={formData.studentId}
                onChange={(e) => handleInputChange("studentId", e.target.value)}
                placeholder="STU-2024-12345"
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
                onChange={(e) => handleInputChange("issueDate", e.target.value)}
                className="border-border/40 bg-background/50"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t.fileUpload}</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={handleDropZoneClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border/60 bg-background/30 p-8 transition-colors hover:border-primary/50 hover:bg-background/50"
            >
              {selectedFile ? (
                <div className="flex items-center gap-3">
                  <FileText className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-center text-sm text-muted-foreground">{t.dragDropText}</p>
                  <p className="text-xs text-muted-foreground/70">{t.acceptedFormats}</p>
                </>
              )}
            </div>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
            <div className="rounded-lg bg-background/50 p-4">
              <p className="text-sm text-muted-foreground">{t.documentId}</p>
              <p className="font-semibold text-foreground">{generatedData.documentId}</p>
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
                {/* สร้าง QR Code จากค่า Hash ตรงๆ เพื่อให้หน้าตรวจสอบนำไปค้นหาได้ */}
                <QRCodeSVG value={generatedData.hash} size={160} />
              </div>
              <p className="text-center text-xs text-muted-foreground">{t.qrCaption}</p>
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
    </div>
  );
}