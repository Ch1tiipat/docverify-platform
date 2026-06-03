"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ShieldCheck, Sparkles, Zap, Headphones, MessageSquare, PhoneCall, Globe, Code, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface PackagesPortalProps {
  lang: "en" | "th";
}

export function PackagesPortal({ lang }: PackagesPortalProps) {
  const isThai = lang === "th";
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleOpenQuote = (plan: string) => {
    setSelectedPlan(plan);
    setContactForm({ name: "", email: "", company: "", message: "" });
    setSubmitted(false);
    setShowQuoteModal(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowQuoteModal(false);
    }, 2000);
  };

  const packages = [
    {
      id: "gold",
      name: "Gold Package",
      badge: isThai ? "จ่ายตามจริง" : "Pay-Per-Use",
      price: isThai ? "300 บาท" : "300 THB",
      period: isThai ? "/ ครั้ง (ไม่มีรายเดือน)" : "/ transaction (no subscription)",
      color: "from-amber-500/20 to-yellow-600/10 border-amber-500/30 text-amber-400",
      btnVariant: "outline" as const,
      btnText: isThai ? "เริ่มใช้งาน Pay-Per-Use" : "Get Started (Pay-Per-Use)",
      features: [
        isThai ? "ตรวจสอบเอกสารขั้นพื้นฐาน" : "Basic document validation",
        isThai ? "รองรับการลากไฟล์ PDF และสแกน QR Code" : "PDF Upload & QR Code scanning",
        isThai ? "แสดงผลสรุปสถานะ: ถูกต้อง / ไม่ถูกต้อง" : "Status summary (Valid / Invalid)",
      ],
      support: {
        title: isThai ? "คู่มือการบริการตนเอง" : "Self-Service Support",
        desc: isThai ? "มีหน้าคู่มือแนะนำวิธีการใช้งานเบื้องต้นในเว็ปไซต์หลัก" : "Basic tutorials & setup guides available on website",
        icon: Globe
      }
    },
    {
      id: "platinum",
      name: "Platinum Package",
      badge: isThai ? "ยอดนิยม" : "Popular / Advanced",
      price: isThai ? "7,000 บาท" : "7,000 THB",
      period: isThai ? "/ เดือน (โควตาสแกนพิเศษ)" : "/ month (includes verify quota)",
      color: "from-blue-600/20 to-indigo-600/10 border-blue-500/40 text-blue-400 ring-2 ring-primary/30",
      btnVariant: "default" as const,
      btnText: isThai ? "สมัครสมาชิกพรีเมียม" : "Subscribe to Platinum",
      features: [
        isThai ? "ครอบคลุมฟังก์ชันของ Gold ทั้งหมด" : "Includes all Gold features",
        isThai ? "วิเคราะห์เช็คเอกสารคู่ขนาน + ชี้เป้าจุดดัดแปลงแก้ไขพิกเซล" : "Advanced file manipulation & pixel scanning",
        isThai ? "ระบบตรวจจับเอกสารสวมรอย (ไม่ใช่ไฟล์จริง)" : "Fake/Tampered file warning detection",
        isThai ? "เก็บบันทึกประวัติประเมินผลความปลอดภัยย้อนหลังได้ไม่จำกัด" : "Full audit logs & scan history reports",
      ],
      support: {
        title: isThai ? "ผู้ดูแลบัญชีส่วนบุคคล" : "Dedicated Account Manager",
        desc: isThai ? "มีเจ้าหน้าที่ดูแลเฉพาะบุคคลผ่านไลน์ส่วนตัวและโทรด่วน (Line OA / Call)" : "Personal support manager via priority Line OA & Phone Call",
        icon: PhoneCall
      }
    },
    {
      id: "diamond",
      name: "Diamond Package",
      badge: "Enterprise",
      price: isThai ? "ราคาตามข้อตกลง" : "Custom Quote",
      period: isThai ? "(สัญญาบริการรายปี)" : "(Annual service contract)",
      color: "from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-400",
      btnVariant: "outline" as const,
      btnText: isThai ? "ติดต่อทีมพัฒนา / ขอใบเสนอราคา" : "Contact Sales for Quote",
      features: [
        isThai ? "ออกเอกสารและฝังระบบ QR ลายเซ็นดิจิทัลไม่จำกัด (ฝั่งสถาบัน)" : "Unlimited document issuance & secure QR embedding",
        isThai ? "ระบบแสกนเชิงลึกและชี้เป้าจุดความเสี่ยงสูงอัตโนมัติ (ฝั่งองค์กร)" : "Advanced risk detection & instant compliance reports",
        isThai ? "เชื่อมต่อ API เข้ากับระบบจัดการ HR เดิมของบริษัทคุณโดยตรง" : "Direct API integration with legacy HR software",
        isThai ? "ปรับแต่ง UI สัญญาจัดวางแบบ White-label ได้" : "White-label custom styling support",
      ],
      support: {
        title: isThai ? "วิศวกรดูแลส่วนตัว 24/7" : "VIP SLA Engineering Support",
        desc: isThai ? "ทีมวิศวกรระบบดูแลหลังบ้านช่วยเหลือตลอด 24 ชั่วโมง การันตี Uptime (SLA)" : "24/7 engineering team standby with guaranteed SLA uptime",
        icon: Code
      }
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* Title Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          {isThai ? "แพ็กเกจบริการและการดูแลลูกค้า" : "Pricing & Customer Care Plans"}
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
          {isThai 
            ? "เลือกแพ็กเกจความปลอดภัยในการรับรองเอกสารที่ตอบโจทย์ความคุ้มค่าและขนาดขององค์กรคุณสูงสุด" 
            : "Select the most cost-effective credential authentication solution tailored to your institution size"}
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        {packages.map((pkg) => {
          const SupportIcon = pkg.support.icon;
          return (
            <Card 
              key={pkg.id} 
              className={`flex flex-col justify-between border-2 bg-gradient-to-b bg-card/60 backdrop-blur-md shadow-xl hover:scale-[1.02] transition-all duration-300 ${pkg.color}`}
            >
              <div>
                <CardHeader className="space-y-2 pb-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5">
                      {pkg.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground pt-1">{pkg.name}</CardTitle>
                  <div className="pt-2">
                    <span className="text-3xl font-extrabold text-foreground">{pkg.price}</span>
                    <span className="text-xs text-muted-foreground ml-1 font-medium">{pkg.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                      {isThai ? "ฟังก์ชันที่ได้รับ" : "Key Capabilities"}
                    </p>
                    <ul className="space-y-2 text-xs text-muted-foreground text-left">
                      {pkg.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Customer Care Box */}
                  <div className="border-t border-border/40 pt-4 space-y-2">
                    <p className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-1.5">
                      <Headphones className="h-4 w-4 text-primary" />
                      {isThai ? "การดูแลลูกค้า" : "Customer Support"}
                    </p>
                    <div className="flex items-start gap-2 bg-background/50 rounded-lg p-2.5 border border-border/20">
                      <SupportIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-foreground">{pkg.support.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{pkg.support.desc}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-4 border-t border-border/20">
                <Button 
                  onClick={() => handleOpenQuote(pkg.name)}
                  variant={pkg.btnVariant} 
                  className={`w-full gap-2 text-xs font-bold uppercase transition-all duration-300 ${
                    pkg.id === "platinum" 
                      ? "bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/20" 
                      : "border-border/60 hover:bg-background/80"
                  }`}
                >
                  {pkg.btnText}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Quote / Subscription Modal */}
      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
        <DialogContent className="sm:max-w-md bg-card/95 border-border/40 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {isThai ? `สนใจสมัคร / สอบถามข้อมูล ${selectedPlan}` : `Inquiry for ${selectedPlan}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isThai 
                ? "กรุณากรอกข้อมูลเพื่อทดสอบจำลองเชื่อมต่อบริการหรือติดต่อฝ่ายขาย" 
                : "Enter your contact details to request activation or sales support."}
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto animate-bounce">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-foreground">{isThai ? "ส่งข้อมูลสำเร็จ!" : "Request Sent!"}</h4>
                <p className="text-xs text-muted-foreground">
                  {isThai 
                    ? "เจ้าหน้าที่จะทำการติดต่อกลับคุณในช่องทางด่วนโดยเร็วที่สุด" 
                    : "Our sales engineer will reach out to you shortly."}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">{isThai ? "ชื่อผู้ติดต่อ" : "Your Name"}</label>
                <Input 
                  required 
                  value={contactForm.name} 
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} 
                  placeholder={isThai ? "สมชาย ใจดี" : "John Smith"}
                  className="bg-background/50 border-border/40 text-xs" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">{isThai ? "อีเมลติดต่อกลับ" : "Email Address"}</label>
                <Input 
                  type="email" 
                  required 
                  value={contactForm.email} 
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} 
                  placeholder="name@company.com" 
                  className="bg-background/50 border-border/40 text-xs" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">{isThai ? "ชื่อองค์กร / มหาวิทยาลัย" : "Organization"}</label>
                <Input 
                  required 
                  value={contactForm.company} 
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} 
                  placeholder={isThai ? "มหาวิทยาลัยระดับนำ" : "Leading University"} 
                  className="bg-background/50 border-border/40 text-xs" 
                />
              </div>
              <DialogFooter className="pt-4 gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowQuoteModal(false)}
                  className="border-border/40 hover:bg-background/50 text-xs"
                >
                  {isThai ? "ยกเลิก" : "Cancel"}
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
                  {isThai ? "ยืนยันและส่งคำขอ" : "Submit Request"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
