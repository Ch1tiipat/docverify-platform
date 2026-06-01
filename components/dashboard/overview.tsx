"use client";

import { useState, useEffect } from "react";
import { translations, type Language } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Clock 
} from "lucide-react";

// --- Firebase Imports ---
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

interface OverviewProps {
  lang: Language;
}


export function Overview({ lang }: OverviewProps) {
  const t = translations[lang];
  
  // State สำหรับจัดการข้อมูลจริงจาก Firebase
  const [realActivities, setRealActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State สำหรับเก็บข้อมูลสถิติจริงจาก Firebase
  const [docCount, setDocCount] = useState<number>(0);
  const [scanCount, setScanCount] = useState<number>(0);
  const [successRate, setSuccessRate] = useState<number>(100);

  // ดึงข้อมูลสถิติแบบ Real-time
  useEffect(() => {
    // 1. นับจำนวนเอกสารที่ออกทั้งหมด
    const unsubDocs = onSnapshot(collection(db, "issuedDocuments"), (snapshot) => {
      setDocCount(snapshot.size);
    });

    // 2. นับจำนวนการสแกนและคำนวณอัตราความสำเร็จ
    const unsubScans = onSnapshot(collection(db, "scanLogs"), (snapshot) => {
      const total = snapshot.size;
      setScanCount(total);
      if (total > 0) {
        const validCount = snapshot.docs.filter(doc => doc.data().status === "valid").length;
        setSuccessRate(Math.round((validCount / total) * 1000) / 10);
      } else {
        setSuccessRate(100);
      }
    });

    return () => {
      unsubDocs();
      unsubScans();
    };
  }, []);

  // ดึงข้อมูล Real-time จาก Firebase (ตาราง scanLogs)
  useEffect(() => {
    const q = query(collection(db, "scanLogs"), orderBy("timestamp", "desc"), limit(6));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          documentId: data.documentId || "Unknown",
          // จัดการเวลาให้อ่านง่าย
          dateTime: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : "Just now",
          action: "verified" as const, 
          hash: data.scannedHash ? data.scannedHash.substring(0, 16) : "N/A",
          valid: data.status === "valid"
        };
      });
      setRealActivities(fetchedLogs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ย้ายสถิติเข้ามาด้านในเพื่อให้สามารถดึงสเตตัสที่เป็น Real-time มาใช้งานได้
  const stats = [
    {
      labelKey: "documentsIssued" as const,
      value: docCount.toLocaleString(),
      change: "+12.5%",
      positive: true,
      icon: FileText,
    },
    {
      labelKey: "verifications" as const,
      value: scanCount.toLocaleString(),
      change: "+8.2%",
      positive: true,
      icon: ShieldCheck,
    },
    {
      labelKey: "successRate" as const,
      value: `${successRate}%`,
      change: successRate >= 95 ? "+0.3%" : "-1.2%",
      positive: successRate >= 95,
      icon: TrendingUp,
    },
    {
      labelKey: "avgResponse" as const,
      value: "0.5s",
      change: "-20%",
      positive: true,
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header (ลบกระดิ่งอันใหม่ออกแล้ว เพื่อใช้ของเดิมใน Layout) */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.labelKey} className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t[stat.labelKey]}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  {stat.positive ? (
                    <TrendingUp className="h-3 w-3 text-primary" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={stat.positive ? "text-primary" : "text-destructive"}>
                    {stat.change}
                  </span>{" "}
                  {t.fromLastMonth}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Table (Real Data from Firebase) */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            {t.recentActivity} <span className="text-xs font-normal text-muted-foreground ml-2">(Live Updates)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-muted-foreground">{t.documentId}</TableHead>
                <TableHead className="text-muted-foreground">{t.dateTime}</TableHead>
                <TableHead className="text-muted-foreground">{t.action}</TableHead>
                <TableHead className="text-muted-foreground">{t.hash}</TableHead>
                <TableHead className="text-muted-foreground">{t.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading live activity...
                  </TableCell>
                </TableRow>
              ) : realActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No recent verification activity found. Try scanning a document!
                  </TableCell>
                </TableRow>
              ) : (
                realActivities.map((activity) => (
                  <TableRow key={activity.id} className="border-border/40">
                    <TableCell className="font-medium text-foreground">
                      {activity.documentId || "Unknown"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{activity.dateTime}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">
                      {t[activity.action as keyof typeof t] || "Verified"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {activity.hash}...
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          activity.valid
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }
                      >
                        {activity.valid ? t.valid || "Valid" : t.invalid || "Invalid"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}