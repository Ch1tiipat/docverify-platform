"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Loader2 } from "lucide-react";

// ลิงก์ลับสำหรับเข้าสู่หน้าหลังบ้าน HR: yoursite.com/?auth=docverify_hr_secret_2026
const SECRET_AUTH_KEY = "docverify_hr_secret_2026";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlAuth = searchParams.get("auth");
      const storedAuth = localStorage.getItem("dv_auth_token");

      if (urlAuth === SECRET_AUTH_KEY) {
        // หากเข้าผ่านลิงก์ลับสำเร็จ บันทึก Token ลงเครื่องพนักงาน
        localStorage.setItem("dv_auth_token", SECRET_AUTH_KEY);
        setIsAuthorized(true);
        // ซ่อนรหัส Token ออกจากช่อง Address Bar เพื่อความปลอดภัยของลิงก์
        router.replace("/");
      } else if (storedAuth === SECRET_AUTH_KEY) {
        // หากตัวเครื่องเบราว์เซอร์นี้เคยล็อกอินผ่านลิงก์ลับมาก่อนหน้า
        setIsAuthorized(true);
      } else {
        // ไม่มีสิทธิ์เข้าถึง ดีดไปที่หน้าตรวจสอบเอกสาร (Public Verify)
        setIsAuthorized(false);
        router.replace("/verify");
      }
    }
  }, [searchParams, router]);

  if (isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground text-center">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // อยู่ระหว่างการ Redirect
  }

  return <DashboardLayout />;
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
