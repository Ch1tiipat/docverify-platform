 DocVerify Platform

แพลตฟอร์มตรวจสอบเอกสารดิจิทัลระดับองค์กร (Enterprise Digital Document Verification) พัฒนาขึ้นสำหรับการแข่งขัน Hackathon โดยเน้นความปลอดภัยของข้อมูล (PDPA Compliant) และการตรวจสอบความถูกต้องด้วยเทคโนโลยี SHA-256 Hashing

 Key Features (ฟีเจอร์หลัก)

- Issuer Portal (ระบบผู้ออกเอกสาร): สร้างเอกสารดิจิทัล, เข้ารหัสไฟล์ด้วย SHA-256, สร้าง QR Code อัตโนมัติ พร้อมระบบ Data Masking เซ็นเซอร์ข้อมูลส่วนบุคคลก่อนบันทึกลงฐานข้อมูล
- Verifier Portal (ระบบผู้ตรวจสอบ): ตรวจสอบความถูกต้องของเอกสารได้ 2 ทาง คือ อัปโหลดไฟล์ต้นฉบับ หรือ เปิดกล้องสแกน QR Code
- Real-time Dashboard: แสดงสถิติการออกเอกสารและดึงประวัติการสแกน (Audit Trail) จาก Firebase มาแสดงผลแบบ Real-time

 Tech Stack (เทคโนโลยีที่ใช้)

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui
- Database & Storage:Firebase (Firestore, Firebase Storage)
- Security: Web Crypto API (SHA-256)
- Libraries: `html5-qrcode` (สแกนกล้อง), `qrcode.react` (สร้างคิวอาร์โค้ด), `lucide-react` (ไอคอน)

Testing Guide
1.ไปที่เมนู Issuer Portal -> ลองกรอกข้อมูลและอัปโหลดไฟล์ PDF/รูปภาพ ระบบจะเด้ง QR Code และ Document ID ขึ้นมา
2.สลับไปเมนู Verifier Portal -> ลองอัปโหลดไฟล์ "ที่ถูกต้อง" (จะต้องขึ้นสีเขียว) และลองอัปโหลด "ไฟล์อื่น" (จะต้องขึ้นสีแดง)
3.สำหรับมือถือ (ถ้าอยู่ในวง LAN เดียวกัน) -> ให้เข้า IP ของเครื่องที่รันเซิร์ฟเวอร์ เช่น http://192.168.1.XX:3000 แล้วลองใช้กล้องสแกน QR Code จากหน้าจอคอม
4.สลับกลับมาเมนู Overview (Dashboard) -> ตรวจสอบในตาราง Recent Activity ว่าประวัติการสแกนเมื่อกี้เด้งขึ้นมาแบบ Real-time หรือไม่
