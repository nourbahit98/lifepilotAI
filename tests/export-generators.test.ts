import { describe, expect, it } from "vitest";

import { generateExportFile } from "@/lib/export/generators";

describe("export generators", () => {
  it("creates a real CSV buffer", async () => {
    const file = await generateExportFile({
      content: "Regel een\nRegel twee",
      title: "Test",
      type: "csv",
    });
    expect(file.contentType).toContain("text/csv");
    expect(file.buffer.toString("utf8")).toContain("Regel een");
  });

  it("creates a PDF buffer", async () => {
    const file = await generateExportFile({
      content: "Een PDF resultaat",
      title: "PDF Test",
      type: "pdf",
    });
    expect(file.extension).toBe("pdf");
    expect(file.buffer.subarray(0, 4).toString()).toBe("%PDF");
  });
});
