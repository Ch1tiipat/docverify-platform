"use client";

import { useState, useEffect, useCallback } from "react";
import { translations, type Language } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Copy, Check, Eye, Search, Clock, Calendar } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// --- Firebase Imports ---
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

interface HistoryPortalProps {
  lang: Language;
}

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

export function HistoryPortal({ lang }: HistoryPortalProps) {
  const t = translations[lang];
  const [documents, setDocuments] = useState<IssuedDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<IssuedDocument | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch all issued documents from Firestore (up to 100)
  useEffect(() => {
    const q = query(collection(db, "issuedDocuments"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as IssuedDocument[];
      setDocuments(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleCopyHash = useCallback((hash: string) => {
    navigator.clipboard.writeText(`SHA256:${hash}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // Filter documents based on search query
  const filteredDocs = documents.filter((doc) => {
    const queryLower = searchQuery.toLowerCase();
    return (
      doc.documentId?.toLowerCase().includes(queryLower) ||
      doc.title?.toLowerCase().includes(queryLower) ||
      doc.holderNameMasked?.toLowerCase().includes(queryLower) ||
      (doc.holderEmail && doc.holderEmail.toLowerCase().includes(queryLower))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "th" ? "ประวัติการออกเอกสาร" : "Document History"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "th" 
              ? "ดูประวัติ ค้นหาข้อมูล และดึงรูปภาพคิวอาร์โค้ดของเอกสารที่รับรองแล้วทั้งหมด" 
              : "View history, search records, and retrieve QR codes of all certified documents"}
          </p>
        </div>
      </div>

      {/* Search and Table Card */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-4">
          <CardTitle className="text-lg font-semibold text-foreground">
            {lang === "th" ? "รายการจดทะเบียนใบรับรองทั้งหมด" : "All Registered Certificates"}
          </CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "th" ? "ค้นหาด้วย รหัส, ชื่อ หรือผู้รับ..." : "Search by ID, title, holder..."}
              className="pl-9 border-border/40 bg-background/50"
            />
          </div>
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
              {filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="h-8 w-8 text-muted-foreground/60 animate-pulse" />
                      <p>{lang === "th" ? "ไม่พบข้อมูลที่ค้นหา" : "No documents found."}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocs.map((doc) => (
                  <TableRow key={doc.id} className="border-border/40">
                    <TableCell className="font-semibold text-foreground">{doc.documentId}</TableCell>
                    <TableCell className="text-foreground max-w-[200px] truncate">{doc.title}</TableCell>
                    <TableCell className="text-muted-foreground">{doc.holderNameMasked}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {doc.issueDate}
                      </span>
                    </TableCell>
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

      {/* Details View Dialog Modal */}
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
                    onClick={() => handleCopyHash(selectedDoc.hash)}
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
    </div>
  );
}
