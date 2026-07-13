import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export type ExportType = "pdf" | "docx" | "xlsx" | "csv";

export async function generateExportFile({
  content,
  title,
  type,
}: {
  content: string;
  title: string;
  type: ExportType;
}) {
  if (type === "pdf") {
    const pdf = new jsPDF({ unit: "mm" });
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(title, 18, 22);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Gegenereerd op ${new Date().toLocaleDateString("nl-NL")}`, 18, 30);
    const lines = pdf.splitTextToSize(content, 174);
    let y = 42;
    lines.forEach((line: string, index: number) => {
      if (y > 280) {
        pdf.text(String(pdf.getNumberOfPages()), 190, 288);
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, 18, y);
      y += 6;
      if (index === lines.length - 1) {
        pdf.text(String(pdf.getNumberOfPages()), 190, 288);
      }
    });
    return {
      buffer: Buffer.from(pdf.output("arraybuffer")),
      contentType: "application/pdf",
      extension: "pdf",
    };
  }

  if (type === "docx") {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ bold: true, size: 32, text: title })],
            }),
            new Paragraph(`Gegenereerd op ${new Date().toLocaleDateString("nl-NL")}`),
            ...content.split("\n").map((line) => new Paragraph(line)),
          ],
        },
      ],
    });
    return {
      buffer: Buffer.from(await Packer.toBuffer(doc)),
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      extension: "docx",
    };
  }

  const rows = content
    .split("\n")
    .filter(Boolean)
    .map((line, index) => ({ Regel: index + 1, Inhoud: line }));

  if (type === "csv") {
    const sheet = XLSX.utils.json_to_sheet(rows);
    return {
      buffer: Buffer.from(XLSX.utils.sheet_to_csv(sheet), "utf8"),
      contentType: "text/csv;charset=utf-8",
      extension: "csv",
    };
  }

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, "LifePilot");
  return {
    buffer: Buffer.from(XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })),
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: "xlsx",
  };
}
