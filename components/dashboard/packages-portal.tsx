"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ShieldCheck, Sparkles, Zap, Headphones, PhoneCall, Globe, Code, ArrowRight, Star, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface PackagesPortalProps {
  lang: "en" | "th";
}

export function PackagesPortal({ lang }: PackagesPortalProps) {
  const isThai = lang === "th";
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleOpenQuote = (plan: string) => {
    setSelectedPlan(plan);
    setContactForm({ name: "", email: "", company: "", message: "" });
    setSubmitted(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const planKey = selectedPlan.toLowerCase();
      if (planKey.includes("gold")) {
        localStorage.setItem("dv_user_plan", "gold");
      } else if (planKey.includes("platinum")) {
        localStorage.setItem("dv_user_plan", "platinum");
      } else if (planKey.includes("diamond")) {
        localStorage.setItem("dv_user_plan", "diamond");
      }
    }
    setSubmitted(true);
    setTimeout(() => {
      setShowQuoteModal(false);
    }, 2000);
  };

  const isYearly = billingCycle === "yearly";

  const packages = [
    {
      id: "gold",
      name: "Gold Plan",
      badge: isThai ? "จ่ายตามจริง" : "Pay-Per-Use",
      price: isThai ? "300 ฿" : "300 THB",
      period: isThai ? "/ ครั้ง" : "/ scan",
      description: isThai ? "สำหรับความต้องการตรวจสอบทั่วไปโดยไม่มีค่าบริการรายเดือนผูกมัด" : "For occasional verification needs with zero fixed monthly overhead.",
      glowColor: "rgba(245, 158, 11, 0.15)",
      borderColor: "border-amber-500/20 hover:border-amber-500/50",
      accentColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      btnVariant: "outline" as const,
      btnText: isThai ? "เริ่มใช้งานฟรี" : "Start Pay-Per-Use",
      features: [
        isThai ? "ตรวจสอบเอกสารพื้นฐาน (PDF/QR)" : "Basic validation (PDF/QR)",
        isThai ? "สรุปสถานะ ถูกต้อง / ไม่ถูกต้อง" : "Status summary (Valid/Invalid)",
      ],
      support: {
        title: isThai ? "คู่มือการบริการตนเองบนเว็บ" : "Web Self-Service Support",
        icon: Globe
      }
    },
    {
      id: "platinum",
      name: "Platinum Plan",
      badge: isThai ? "แนะนำ / AI ตรวจละเอียด" : "Popular / AI Audit",
      price: isYearly 
        ? (isThai ? "5,950 ฿" : "5,950 THB")
        : (isThai ? "7,000 ฿" : "7,000 THB"),
      period: isThai ? "/ เดือน (จ่ายรายปี)" : "/ month (billed yearly)",
      originalPrice: isYearly ? (isThai ? "7,000 ฿" : "7,000 THB") : null,
      description: isThai ? "ระบบการวิเคราะห์และตรวจสอบความปลอดภัยเอกสารด้วยความสามารถของ AI" : "Advanced document integrity analysis backed by neural network models.",
      glowColor: "rgba(139, 92, 246, 0.25)",
      borderColor: "border-purple-500/30 hover:border-purple-500/60 ring-2 ring-purple-500/20",
      accentColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      btnVariant: "default" as const,
      btnText: isThai ? "สมัครสมาชิกพรีเมียม" : "Subscribe to Premium",
      isPopular: true,
      features: [
        isThai ? "ตรวจชี้เป้าพิกเซลที่ดัดแปลงด้วย AI" : "AI Pixel Tampering Detection",
        isThai ? "ระบบแจ้งเตือนเอกสารสวมรอย / ปลอมแปลง" : "Fake document warning alert",
        isThai ? "เก็บบันทึกประวัติสแกนย้อนหลัง & Audit log" : "Keep scan history & audit logs",
        isThai ? "โควตาตรวจไฟล์ขั้นสูงเพิ่มขึ้น 2 เท่า" : "2x allocation for advanced files",
      ],
      support: {
        title: isThai ? "ผู้ดูแลเฉพาะบุคคล Fast-track" : "Account Manager (Fast-track)",
        icon: PhoneCall
      }
    },
    {
      id: "diamond",
      name: "Diamond Plan",
      badge: "Enterprise AI",
      price: isThai ? "ติดต่อทีมงาน" : "Custom Quote",
      period: isThai ? "สัญญาบริการรายปี" : "Annual Contract",
      description: isThai ? "ขีดความสามารถเต็มพิกัดและความปลอดภัยระดับสูงสุดสำหรับองค์กรใหญ่" : "Full scale custom capabilities, SLAs, and dedicated compute instances.",
      glowColor: "rgba(16, 185, 129, 0.15)",
      borderColor: "border-emerald-500/20 hover:border-emerald-500/50",
      accentColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      btnVariant: "outline" as const,
      btnText: isThai ? "ติดต่อวิศวกรระบบ" : "Contact Engineers",
      features: [
        isThai ? "ออกเอกสารดิจิทัลและฝัง QR ไม่จำกัด" : "Unlimited issuance & QR code",
        isThai ? "เชื่อมโยง API ตรงกับระบบ HR เดิม" : "Direct API with legacy HR tools",
        isThai ? "ระบบตรวจสอบจุดเสี่ยงขั้นสูงและการเรียนรู้เฉพาะ" : "Custom risk models & gatekeep",
      ],
      support: {
        title: isThai ? "ทีมวิศวกร VIP SLA 24/7" : "VIP Engineering SLA 24/7",
        icon: Code
      }
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto text-left select-none animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header and Toggle */}
      <div className="flex flex-col items-center text-center space-y-4 mb-6 relative">
        {/* Glow behind header */}
        <div className="absolute -top-10 w-72 h-20 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          {isThai ? "ปลดล็อกความสามารถ AI ขั้นสูง" : "Unlock Advanced AI Features"}
        </div>
        
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-muted-foreground">
            {isThai ? "แผนการดูแลและความปลอดภัยของข้อมูล" : "Upgrade to Pro Experience"}
          </h2>
          <p className="text-muted-foreground text-xs max-w-lg mx-auto">
            {isThai 
              ? "เลือกแผนบริการที่เหมาะสมกับองค์กรของคุณเพื่อยกระดับการตรวจจับและวิเคราะห์เอกสารอย่างมืออาชีพ" 
              : "Choose a plan tailored to your validation volume and get advanced security audit logs."}
          </p>
        </div>

        {/* Billing Cycle Switcher */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-full border border-border/40 backdrop-blur-xs">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              billingCycle === "monthly"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isThai ? "รายเดือน" : "Monthly"}
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              billingCycle === "yearly"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isThai ? "รายปี" : "Yearly"}
            <span className="text-[9px] bg-emerald-500/25 text-emerald-400 font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/30">
              {isThai ? "ประหยัด 15%" : "-15%"}
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-5 md:grid-cols-3 relative">
        {packages.map((pkg) => {
          const SupportIcon = pkg.support.icon;
          return (
            <div 
              key={pkg.id} 
              className="relative group rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                boxShadow: pkg.isPopular ? `0 10px 30px -10px ${pkg.glowColor}` : "none"
              }}
            >
              {/* Outer glow aura for Popular Plan */}
              {pkg.isPopular && (
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-500 pointer-events-none" />
              )}

              <Card 
                className={`relative flex flex-col justify-between h-full border-2 bg-gradient-to-b from-card/90 via-card/75 to-card/60 backdrop-blur-xl transition-all duration-300 rounded-2xl p-1.5 overflow-hidden ${pkg.borderColor}`}
              >
                {/* Visual badge top overlay */}
                {pkg.isPopular && (
                  <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />
                )}

                <div>
                  <CardHeader className="space-y-2 p-5 pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${pkg.accentColor}`}>
                        {pkg.badge}
                      </Badge>
                      {pkg.isPopular && (
                        <div className="flex items-center gap-1 text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">
                          <Crown className="h-3 w-3 fill-purple-400" />
                          <span>AI Power</span>
                        </div>
                      )}
                    </div>
                    
                    <CardTitle className="text-xl font-bold text-foreground pt-1 flex items-center gap-1.5">
                      {pkg.name}
                    </CardTitle>

                    <p className="text-[11px] text-muted-foreground leading-normal min-h-[32px]">
                      {pkg.description}
                    </p>

                    <div className="pt-2 flex flex-col justify-end min-h-[52px]">
                      {pkg.originalPrice && (
                        <span className="text-xs text-muted-foreground/60 line-through font-medium">
                          {pkg.originalPrice}
                        </span>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                          {pkg.price}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {pkg.period}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 p-5 pt-2">
                    {/* Features List */}
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">
                        {isThai ? "ฟังก์ชันการตรวจเช็ค" : "Verification Stack"}
                      </p>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 text-primary`}>
                              <Check className="h-3 w-3" />
                            </span>
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Customer Care Box */}
                    <div className="border-t border-border/25 pt-4 space-y-2">
                      <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1">
                        <Headphones className="h-3 w-3 text-primary" />
                        {isThai ? "ความช่วยเหลือและซัพพอร์ต" : "Support Tier"}
                      </p>
                      <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2 border border-border/10">
                        <SupportIcon className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-[11px] font-medium text-foreground truncate">{pkg.support.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-5 pt-3">
                  <Button 
                    onClick={() => handleOpenQuote(pkg.name)}
                    variant={pkg.btnVariant} 
                    className={`w-full h-9 gap-2 text-xs font-bold uppercase transition-all duration-300 rounded-xl ${
                      pkg.isPopular 
                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white hover:opacity-95 shadow-md shadow-purple-950/20 border-0" 
                        : "border-border/60 hover:bg-background/80"
                    }`}
                  >
                    {pkg.btnText}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Quote / Subscription Modal */}
      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
        <DialogContent className="sm:max-w-md bg-card/95 border-border/40 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              {isThai ? `สนใจสมัคร / สอบถามข้อมูล ${selectedPlan}` : `Inquiry for ${selectedPlan}`}
            </DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground">
              {isThai 
                ? "กรุณากรอกข้อมูลเพื่อทดสอบจำลองเชื่อมต่อบริการหรือติดต่อฝ่ายขาย" 
                : "Enter your contact details to request activation or sales support."}
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto animate-bounce">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground">{isThai ? "ส่งข้อมูลสำเร็จ!" : "Request Sent!"}</h4>
                <p className="text-[10px] text-muted-foreground">
                  {isThai 
                    ? "เจ้าหน้าที่จะทำการติดต่อกลับคุณในช่องทางด่วนโดยเร็วที่สุด" 
                    : "Our sales engineer will reach out to you shortly."}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-3 py-1">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-foreground">{isThai ? "ชื่อผู้ติดต่อ" : "Your Name"}</label>
                <Input 
                  required 
                  value={contactForm.name} 
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} 
                  placeholder={isThai ? "สมชาย ใจดี" : "John Smith"}
                  className="bg-background/50 border-border/40 text-xs h-8" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-foreground">{isThai ? "อีเมลติดต่อกลับ" : "Email Address"}</label>
                <Input 
                  type="email" 
                  required 
                  value={contactForm.email} 
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} 
                  placeholder="name@company.com" 
                  className="bg-background/50 border-border/40 text-xs h-8" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-foreground">{isThai ? "ชื่อองค์กร / มหาวิทยาลัย" : "Organization"}</label>
                <Input 
                  required 
                  value={contactForm.company} 
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} 
                  placeholder={isThai ? "มหาวิทยาลัยระดับนำ" : "Leading University"} 
                  className="bg-background/50 border-border/40 text-xs h-8" 
                />
              </div>
              <DialogFooter className="pt-3 gap-1.5 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowQuoteModal(false)}
                  className="border-border/40 hover:bg-background/50 text-xs h-8"
                >
                  {isThai ? "ยกเลิก" : "Cancel"}
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8">
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
