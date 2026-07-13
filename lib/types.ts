export type LifePilotIntent =
  | "planning"
  | "document_analysis"
  | "writing"
  | "comparison"
  | "spreadsheet"
  | "finance"
  | "shopping"
  | "general";

export type OutputType = "chat" | "pdf" | "docx" | "xlsx" | "csv" | "calendar";
export type RiskLevel = "low" | "medium" | "high";

export type AIRouterResult = {
  intent: LifePilotIntent;
  secondary_intents: LifePilotIntent[];
  requires_files: boolean;
  requires_clarification: boolean;
  clarification_question: string;
  output_type: OutputType;
  risk_level: RiskLevel;
  detected_deadlines: string[];
  suggested_actions: string[];
};

export type AssistantResult = {
  title: string;
  summary: string;
  important_information: string[];
  recommended_actions: string[];
  full_result: string;
  warning?: string;
  generated_files?: Array<{ title: string; file_type: string }>;
};
