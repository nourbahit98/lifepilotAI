export const allowedFileTypes = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "image/png": "png",
  "image/jpeg": "jpg",
} as const;

export type AllowedMime = keyof typeof allowedFileTypes;

export function validateUpload(file: File, maxMb = 10) {
  if (!(file.type in allowedFileTypes)) {
    throw new Error("Bestandstype wordt niet ondersteund.");
  }
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error("Bestand is te groot.");
  }
  if (file.name.includes("..") || /[<>:"|?*]/.test(file.name)) {
    throw new Error("Bestandsnaam bevat onveilige tekens.");
  }
  return allowedFileTypes[file.type as AllowedMime];
}

export async function extractText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = validateUpload(file);

  if (extension === "txt" || extension === "csv") {
    return buffer.toString("utf8");
  }

  if (extension === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (extension === "xlsx") {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    return workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      return `Werkblad: ${sheetName}\n${XLSX.utils.sheet_to_csv(sheet)}`;
    }).join("\n\n");
  }

  if (extension === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      if (!result.text.trim()) {
        throw new Error("Document kon niet betrouwbaar worden uitgelezen.");
      }
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  throw new Error(
    "Afbeeldingen en scans worden via OCR verwerkt wanneer OPENAI_API_KEY is ingevuld.",
  );
}
