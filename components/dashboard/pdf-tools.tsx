"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  PenTool, 
  Layers, 
  FileDown, 
  FileCheck2, 
  Sparkles, 
  Lock, 
  RotateCw, 
  Scissors, 
  ArrowLeft,
  Upload,
  Signature,
  FileSignature,
  Download,
  AlertCircle
} from "lucide-react";

interface PdfToolsProps {
  lang: "en" | "th";
}

interface PdfToolItem {
  id: string;
  nameEn: string;
  nameTh: string;
  descEn: string;
  descTh: string;
  icon: React.ComponentType<any>;
}

export function PdfTools({ lang }: PdfToolsProps) {
  const isThai = lang === "th";
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  // Signature pad states
  const [isSigning, setIsSigning] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [signFile, setSignFile] = useState<File | null>(null);
  const [signComplete, setSignComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // List of PDF tools mirroring standard utility tools
  const tools: PdfToolItem[] = [
    {
      id: "sign",
      nameEn: "Sign PDF",
      nameTh: "เซ็นเอกสาร PDF",
      descEn: "Draw or upload your signature and place it on documents.",
      descTh: "เขียนหรืออัปโหลดลายเซ็นดิจิทัลแล้วนำไปประทับตราบนเอกสาร",
      icon: FileSignature
    },
    {
      id: "merge",
      nameEn: "Merge Documents",
      nameTh: "รวมไฟล์ PDF",
      descEn: "Combine multiple PDF files into one clean document.",
      descTh: "รวมเอกสาร PDF หลายฉบับเข้าเป็นไฟล์เดียวกรรมวิธีเสถียร",
      icon: Layers
    },
    {
      id: "compress",
      nameEn: "Compress PDF",
      nameTh: "บีบอัดขนาด PDF",
      descEn: "Reduce the file size of your PDF while keeping quality.",
      descTh: "ย่อขนาดไฟล์ PDF เพื่อให้จัดส่งสะดวกโดยยังคงความคมชัด",
      icon: FileDown
    },
    {
      id: "watermark",
      nameEn: "Add Watermark",
      nameTh: "ใส่ลายน้ำเอกสาร",
      descEn: "Stamps text, logos, or institutional marks onto pages.",
      descTh: "ประทับตราอักษร สัญลักษณ์ หรือโลโก้ของคณะ/องค์กรลงบนตัวเล่ม",
      icon: PenTool
    },
    {
      id: "protect",
      nameEn: "Password Protect",
      nameTh: "ตั้งรหัสล็อกเอกสาร",
      descEn: "Secure your document by adding strong password encryption.",
      descTh: "เพิ่มความปลอดภัยสูงสุดด้วยการเข้ารหัสล็อกไฟล์ด้วยรหัสผ่าน",
      icon: Lock
    },
    {
      id: "ocr",
      nameEn: "Recognize Text (OCR)",
      nameTh: "แปลงภาพเป็นตัวอักษร",
      descEn: "Extract editable text from scanned pages automatically.",
      descTh: "ดึงข้อความภาษาไทย/อังกฤษจากหน้ากระดาษสแกนอัตโนมัติด้วย AI",
      icon: Sparkles
    }
  ];

  // Canvas Drawing logic for Sign PDF
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "currentColor";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsSigning(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSigning) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsSigning(false);
  };

  const clearCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Mock processing simulator
  const handleProcessSim = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSignComplete(true);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            {isThai ? "ชุดเครื่องมือจัดการไฟล์ PDF" : "PDF Tools Suite"}
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
              Mockup
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {isThai 
              ? "รวมเครื่องมือปรับปรุงเอกสาร แก้ไข รวมไฟล์ เซ็นชื่อดิจิทัล และเพิ่มความปลอดภัยก่อนออกเอกสาร" 
              : "Advanced helper utilities for signing, merging, watermarking, and compressing HR files"}
          </p>
        </div>

        {activeTool && (
          <Button 
            variant="outline" 
            onClick={() => {
              setActiveTool(null);
              setSignComplete(false);
              setSignFile(null);
              setHasSignature(false);
            }}
            className="border-border/40 hover:bg-background/50 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {isThai ? "ย้อนกลับเครื่องมือทั้งหมด" : "Back to Tools"}
          </Button>
        )}
      </div>

      {!activeTool ? (
        /* Grid Tool Selection Mockup */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={tool.id} 
                onClick={() => setActiveTool(tool.id)}
                className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {isThai ? tool.nameTh : tool.nameEn}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 px-2 leading-relaxed">
                      {isThai ? tool.descTh : tool.descEn}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : activeTool === "sign" ? (
        /* 1. SIGN PDF INTERACTIVE COMPONENT */
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left panel: Upload File & Draw Signature */}
          <div className="space-y-6">
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {isThai ? "1. อัปโหลดเอกสาร PDF" : "1. Upload PDF Document"}
                </CardTitle>
                <CardDescription>
                  {isThai ? "เลือกไฟล์เอกสารสัญญาหรือหนังสือรับรองที่ต้องการประทับตราเซ็น" : "Select document template you want to apply signature on"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!signFile ? (
                  <div className="border-dashed border-2 border-border/60 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 bg-background/20 hover:bg-background/40 transition-colors relative cursor-pointer">
                    <input 
                      type="file" 
                      id="pdf-sign-file" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSignFile(file);
                      }}
                      accept=".pdf"
                    />
                    <label htmlFor="pdf-sign-file" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{isThai ? "เลือกเอกสารที่จะเซ็น" : "Choose PDF File"}</p>
                        <p className="text-xs text-muted-foreground">PDF file size limit 10MB</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border border-border/40 p-4 rounded-xl bg-background/60">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm font-semibold truncate max-w-[200px]">{signFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(signFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSignFile(null)} className="text-destructive hover:bg-destructive/10">
                      {isThai ? "ลบไฟล์" : "Remove"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {isThai ? "2. เขียนลายเซ็นดิจิทัล" : "2. Draw Digital Signature"}
                </CardTitle>
                <CardDescription>
                  {isThai ? "ใช้เมาส์หรือปากกาวาดลายมือชื่อลงบนช่องด้านล่างเพื่อเซ็นจริง" : "Use mouse/trackpad to sign on the interactive pad below"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-border/40 bg-background/80 rounded-xl relative overflow-hidden h-40">
                  <canvas
                    ref={sigCanvasRef}
                    width={400}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full cursor-crosshair text-primary"
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-xs font-medium">
                      {isThai ? "เซ็นชื่อของคุณที่นี่" : "Sign your name here"}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={clearCanvas} className="border-border/40 hover:bg-background/50 text-xs">
                    {isThai ? "ล้างลายเซ็น" : "Clear Pad"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right panel: Preview & Generation */}
          <div>
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm h-full flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {isThai ? "3. ตรวจทานและดาวน์โหลด" : "3. Review & Output"}
                </CardTitle>
                <CardDescription>
                  {isThai ? "ระบบจะทำการประมวลผลเซ็นเอกสารและลงลายมือชื่ออัติโนมัติ" : "Review output signature integration and trigger processing"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center items-center py-10 min-h-[300px] text-center">
                {isProcessing ? (
                  <div className="space-y-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="text-sm font-semibold text-foreground">
                      {isThai ? "ระบบกำลังผสานลายเซ็นลงบน PDF..." : "Integrating signature onto PDF template..."}
                    </p>
                  </div>
                ) : signComplete ? (
                  <div className="space-y-6">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                      <FileCheck2 className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg text-foreground">
                        {isThai ? "เซ็นเอกสารสำเร็จแล้ว!" : "Document Signed successfully!"}
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {isThai 
                          ? "ลายเซ็นดิจิทัลถูกประทับลงบนเอกสารเรียบร้อย คุณสามารถกดดาวน์โหลดหรือนำไปรับรองผ่าน DocVerify ต่อได้ทันที" 
                          : "Your signature is now fused with the PDF files. You can download it locally or directly proceed to register hash in DocVerify."}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button variant="outline" className="border-border/40 hover:bg-background/50 flex items-center gap-1.5 text-xs">
                        <Download className="h-4 w-4" />
                        {isThai ? "ดาวน์โหลดไฟล์ PDF" : "Download PDF"}
                      </Button>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 text-xs">
                        <Sparkles className="h-4 w-4" />
                        {isThai ? "รับรองด้วย DocVerify" : "Certify with DocVerify"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Signature className="h-16 w-16 text-muted-foreground/60 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {isThai ? "รอความพร้อมการประมวลผล" : "Awaiting files & signatures"}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        {isThai 
                          ? "กรุณาทำการเลือกอัปโหลดเอกสาร PDF และวาดลายมือชื่อด้านซ้ายให้เรียบร้อยก่อนกดยืนยัน" 
                          : "Please select document file and draw signature first to trigger processing."}
                      </p>
                    </div>
                    <Button 
                      disabled={!signFile || !hasSignature}
                      onClick={handleProcessSim}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                    >
                      {isThai ? "ประมวลผลเซ็นเอกสาร" : "Fuse & Sign PDF"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* OTHER TOOLS GENERIC MOCKUP CONTAINER */
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center gap-4 min-h-[360px]">
            <AlertCircle className="h-12 w-12 text-primary animate-bounce" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">
                {isThai ? "ระบบประมวลผลแบบเบราว์เซอร์ภายในคอมคุณ" : "Browser-based Client Vetting Suite"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {isThai 
                  ? `โมดูล ${tools.find(t => t.id === activeTool)?.nameTh} กำลังอยู่ระหว่างเตรียมความพร้อมเพื่อเชื่อมต่อกับโปรเจกต์ Next.js ขององค์กรคุณ` 
                  : `Module ${tools.find(t => t.id === activeTool)?.nameEn} sandbox mockup environment. The component processing happens locally inside client computers.`}
              </p>
            </div>
            
            <div className="border-dashed border-2 border-border/60 rounded-xl p-8 w-full max-w-md bg-background/20 hover:bg-background/40 transition-colors cursor-pointer mt-4">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">
                  {isThai ? "ลากไฟล์ที่ต้องการประมวลผลมาวางที่นี่" : "Drag files here to simulate tool operation"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
