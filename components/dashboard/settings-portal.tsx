"use client";

import { useState, useEffect, useCallback } from "react";
import { translations, type Language } from "@/lib/translations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { 
  Building2, 
  Mail, 
  Key, 
  Bell, 
  ShieldCheck, 
  Camera, 
  FileCheck, 
  Check, 
  Save, 
  RotateCcw,
  Sparkles,
  Sun,
  Moon
} from "lucide-react";

interface SettingsPortalProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export function SettingsPortal({ lang, setLang }: SettingsPortalProps) {
  const isThai = lang === "th";
  const { setTheme, resolvedTheme } = useTheme();
  
  // State for settings values
  const [orgName, setOrgName] = useState("DocVerify Enterprise");
  const [orgEmail, setOrgEmail] = useState("admin@docverify.org");
  const [department, setDepartment] = useState("Registrar Office");
  
  const [emailServiceId, setEmailServiceId] = useState("");
  const [emailTemplateId, setEmailTemplateId] = useState("");
  const [emailPublicKey, setEmailPublicKey] = useState("");
  
  const [logScans, setLogScans] = useState(true);
  const [requireConsent, setRequireConsent] = useState(true);
  const [scanSound, setScanSound] = useState(false);
  const [autoFocusCamera, setAutoFocusCamera] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOrgName = localStorage.getItem("dv_settings_orgName");
      const savedOrgEmail = localStorage.getItem("dv_settings_orgEmail");
      const savedDept = localStorage.getItem("dv_settings_dept");
      
      const savedServiceId = localStorage.getItem("dv_settings_emailServiceId");
      const savedTemplateId = localStorage.getItem("dv_settings_emailTemplateId");
      const savedPublicKey = localStorage.getItem("dv_settings_emailPublicKey");
      
      const savedLogScans = localStorage.getItem("dv_settings_logScans");
      const savedRequireConsent = localStorage.getItem("dv_settings_requireConsent");
      const savedScanSound = localStorage.getItem("dv_settings_scanSound");
      const savedAutoFocus = localStorage.getItem("dv_settings_autoFocus");

      if (savedOrgName !== null) setOrgName(savedOrgName);
      if (savedOrgEmail !== null) setOrgEmail(savedOrgEmail);
      if (savedDept !== null) setDepartment(savedDept);
      
      if (savedServiceId !== null) setEmailServiceId(savedServiceId);
      if (savedTemplateId !== null) setEmailTemplateId(savedTemplateId);
      if (savedPublicKey !== null) setEmailPublicKey(savedPublicKey);
      
      if (savedLogScans !== null) setLogScans(savedLogScans === "true");
      if (savedRequireConsent !== null) setRequireConsent(savedRequireConsent === "true");
      if (savedScanSound !== null) setScanSound(savedScanSound === "true");
      if (savedAutoFocus !== null) setAutoFocusCamera(savedAutoFocus === "true");
    }
  }, []);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    
    // Simulate save to local storage
    setTimeout(() => {
      localStorage.setItem("dv_settings_orgName", orgName);
      localStorage.setItem("dv_settings_orgEmail", orgEmail);
      localStorage.setItem("dv_settings_dept", department);
      
      localStorage.setItem("dv_settings_emailServiceId", emailServiceId);
      localStorage.setItem("dv_settings_emailTemplateId", emailTemplateId);
      localStorage.setItem("dv_settings_emailPublicKey", emailPublicKey);
      
      localStorage.setItem("dv_settings_logScans", String(logScans));
      localStorage.setItem("dv_settings_requireConsent", String(requireConsent));
      localStorage.setItem("dv_settings_scanSound", String(scanSound));
      localStorage.setItem("dv_settings_autoFocus", String(autoFocusCamera));
      
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  }, [orgName, orgEmail, department, emailServiceId, emailTemplateId, emailPublicKey, logScans, requireConsent, scanSound, autoFocusCamera]);

  const handleReset = useCallback(() => {
    if (window.confirm(isThai ? "คุณต้องการรีเซ็ตการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?" : "Are you sure you want to reset all settings to defaults?")) {
      setOrgName("DocVerify Enterprise");
      setOrgEmail("admin@docverify.org");
      setDepartment("Registrar Office");
      setEmailServiceId("");
      setEmailTemplateId("");
      setEmailPublicKey("");
      setLogScans(true);
      setRequireConsent(true);
      setScanSound(false);
      setAutoFocusCamera(true);
      
      localStorage.clear();
      
      // Reset theme and language dynamically
      setTheme("system");
      if (typeof navigator !== "undefined") {
        const browserLang = navigator.language || (navigator as any).userLanguage || "";
        if (browserLang.toLowerCase().startsWith("th")) {
          setLang("th");
        } else {
          setLang("en");
        }
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  }, [isThai, setTheme, setLang]);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {isThai ? "ตั้งค่าระบบ" : "System Settings"}
            <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary/20">
              <Sparkles className="h-3 w-3" /> Live Config
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {isThai 
              ? "จัดการการตั้งค่าองค์กร บริการจัดส่งอีเมล และพฤติกรรมการตรวจสอบเอกสาร" 
              : "Manage organization details, email delivery services, and document verification preferences"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Org & Email JS */}
        <div className="space-y-6">
          {/* Org Settings Card */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                {isThai ? "ข้อมูลองค์กร" : "Organization Details"}
              </CardTitle>
              <CardDescription>
                {isThai ? "ข้อมูลที่จะไปปรากฏในใบรับรองและการแจ้งเตือน" : "This information appears on certs and notifications"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{isThai ? "ชื่อองค์กร" : "Organization Name"}</label>
                <Input 
                  value={orgName} 
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. DocVerify University"
                  className="border-border/40 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{isThai ? "แผนก / คณะ / ฝ่าย" : "Department / Office"}</label>
                <Input 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Registrar Office"
                  className="border-border/40 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{isThai ? "อีเมลผู้ดูแลระบบ" : "Admin Email"}</label>
                <Input 
                  type="email"
                  value={orgEmail} 
                  onChange={(e) => setOrgEmail(e.target.value)}
                  placeholder="admin@institution.edu"
                  className="border-border/40 bg-background/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Service Configuration */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Mail className="h-5 w-5 text-primary" />
                {isThai ? "ระบบส่งอีเมล (EmailJS)" : "Email delivery configuration"}
              </CardTitle>
              <CardDescription>
                {isThai 
                  ? "ระบุเพื่อใช้ระบบแจ้งเตือนแบบเรียลไทม์ผ่านอีเมลไปยังผู้รับ" 
                  : "Setup credentials for real-time secure email updates using EmailJS"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">EmailJS Service ID</label>
                <Input 
                  value={emailServiceId} 
                  onChange={(e) => setEmailServiceId(e.target.value)}
                  placeholder="service_xxxxxxxx"
                  className="border-border/40 bg-background/50 font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">EmailJS Template ID</label>
                <Input 
                  value={emailTemplateId} 
                  onChange={(e) => setEmailTemplateId(e.target.value)}
                  placeholder="template_xxxxxxxx"
                  className="border-border/40 bg-background/50 font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">EmailJS Public Key</label>
                <Input 
                  value={emailPublicKey} 
                  onChange={(e) => setEmailPublicKey(e.target.value)}
                  placeholder="user_xxxxxxxx"
                  type="password"
                  className="border-border/40 bg-background/50 font-mono text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                {isThai 
                  ? "💡 ระบบจะพยายามดึงข้อมูลเหล่านี้จาก Environment Variables ของเซิร์ฟเวอร์ก่อน หากกรอกในฟอร์มนี้ระบบจะเซฟเพื่อเรียกใช้งานผ่านเบราว์เซอร์ของคุณแทน" 
                  : "💡 Local values saved here will take precedence over standard system environment variables for testing in this browser."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - System Controls */}
        <div className="space-y-6">
          {/* Appearance & Language Card */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-primary" />
                {isThai ? "การแสดงผลและภาษา" : "Appearance & Language"}
              </CardTitle>
              <CardDescription>
                {isThai ? "ตั้งค่าภาษาของระบบและธีมการแสดงผล" : "Set system language and visual theme preference"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {isThai ? "ภาษาของระบบ (Language)" : "System Language"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isThai ? "สลับการแสดงผลภาษาไทย / ภาษาอังกฤษ" : "Toggle display between English and Thai"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setLang(lang === "en" ? "th" : "en")}
                  className="h-10 gap-2 border-border/40 hover:bg-background/50"
                >
                  <span className="flex h-6 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {lang.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium">
                    {lang === "en" ? "English" : "ไทย"}
                  </span>
                </Button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {isThai ? "ธีมการแสดงผล (Theme)" : "System Theme"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isThai ? "สลับการแสดงผลโหมดสว่าง / โหมดมืด" : "Toggle interface between light and dark mode"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="h-10 gap-2 border-border/40 hover:bg-background/50"
                >
                  {resolvedTheme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{isThai ? "โหมดสว่าง" : "Light Mode"}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{isThai ? "โหมดมืด" : "Dark Mode"}</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security & Verification Card */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {isThai ? "ความปลอดภัยและการบันทึกข้อมูล" : "Security & Logs"}
              </CardTitle>
              <CardDescription>
                {isThai ? "ปรับตั้งค่านโยบายความปลอดภัยและสถิติ" : "Adjust log parameters and data handling rules"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {isThai ? "บันทึกข้อมูลการสแกน" : "Log Scans on Firestore"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isThai ? "จัดเก็บประวัติการตรวจสอบเพื่อแสดงข้อมูลบนหน้าบอร์ดควบคุม" : "Store check timestamps in Firebase for statistics updates"}
                  </p>
                </div>
                <Switch 
                  checked={logScans}
                  onCheckedChange={setLogScans}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {isThai ? "การยินยอมข้อมูลส่วนบุคคล" : "Mandatory PDPA Consent Check"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isThai ? "กำหนดให้ผู้ใช้งานยอมรับเงื่อนไขทุกครั้งก่อนจะอัปโหลดหรือเปิดสแกนกล้อง" : "Forced consent validation before verifiers can search or activate cameras"}
                  </p>
                </div>
                <Switch 
                  checked={requireConsent}
                  onCheckedChange={setRequireConsent}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border/40">
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="border-border/40 hover:bg-background/50 flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {isThai ? "รีเซ็ตค่าเริ่มต้น" : "Reset to Defaults"}
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px] flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              {isThai ? "กำลังบันทึก..." : "Saving..."}
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4" />
              {isThai ? "บันทึกสำเร็จ!" : "Saved Successfully!"}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isThai ? "บันทึกการตั้งค่า" : "Save Changes"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
