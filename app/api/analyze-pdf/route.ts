import { NextResponse } from "next/server";
const PDFParser = require("pdf2json");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve) => {
      try {
        const pdfParser = new PDFParser(null, 1);
        
        pdfParser.on("pdfParser_dataError", (errData: any) => {
          resolve(NextResponse.json({ success: false, error: errData.parserError }, { status: 500 }));
        });
        
        pdfParser.on("pdfParser_dataReady", () => {
          const text = pdfParser.getRawTextContent();
          resolve(NextResponse.json({ 
            success: true,
            text: text
          }));
        });
        
        pdfParser.parseBuffer(buffer);
      } catch (err: any) {
        console.error("Synchronous PDFParser error:", err);
        resolve(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
      }
    });
  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to parse PDF" }, { status: 500 });
  }
}
