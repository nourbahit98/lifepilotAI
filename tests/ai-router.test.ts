import { describe, expect, it } from "vitest";

import { routeWithRules } from "@/lib/openai/router";

describe("LifePilot AI router", () => {
  it("routes planning prompts", () => {
    const result = routeWithRules("Plan mijn werkweek van maandag tot vrijdag");
    expect(result.intent).toBe("planning");
  });

  it("routes budget spreadsheets to finance with xlsx output", () => {
    const result = routeWithRules("Maak een maandbudget in Excel");
    expect(result.intent).toBe("spreadsheet");
    expect(result.secondary_intents).toContain("finance");
    expect(result.output_type).toBe("xlsx");
  });

  it("marks legal/financial documents as high risk", () => {
    const result = routeWithRules("Vergelijk deze verzekering juridisch");
    expect(result.risk_level).toBe("high");
    expect(result.requires_files).toBe(true);
  });
});
