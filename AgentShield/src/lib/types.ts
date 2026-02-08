export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical";

export interface ScanResult {
  id: string;
  url: string;
  timestamp: Date;
  riskScore: number;
  riskLevel: RiskLevel;
  threatsFound: number;
  threats: ThreatDetail[];
  hiddenElements: string[];
  injectionFlags: string[];
}

export interface ThreatDetail {
  id: string;
  type: "hidden_text" | "prompt_injection" | "deceptive_ui" | "suspicious_link" | "data_exfil";
  severity: RiskLevel;
  description: string;
  element?: string;
  pattern?: string;
}

export interface ActionLog {
  id: string;
  timestamp: Date;
  actionType: string;
  params: Record<string, string>;
  riskScore: number;
  status: "SUCCESS" | "BLOCKED" | "FAILED";
  explanation: string;
  goal: string;
}

export interface DOMAnalysis {
  id: string;
  url: string;
  timestamp: Date;
  totalElements: number;
  hiddenElements: number;
  scripts: number;
  iframes: number;
  forms: number;
  suspiciousPatterns: string[];
  riskScore: number;
}

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 10) return "safe";
  if (score <= 30) return "low";
  if (score <= 55) return "medium";
  if (score <= 75) return "high";
  return "critical";
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "safe": return "text-safe";
    case "low": return "text-safe";
    case "medium": return "text-amber";
    case "high": return "text-critical";
    case "critical": return "text-critical";
  }
}

export function getRiskBgColor(level: RiskLevel): string {
  switch (level) {
    case "safe": return "bg-safe/15 text-safe border-safe/30";
    case "low": return "bg-safe/15 text-safe border-safe/30";
    case "medium": return "bg-amber/15 text-amber border-amber/30";
    case "high": return "bg-critical/15 text-critical border-critical/30";
    case "critical": return "bg-critical/15 text-critical border-critical/30";
  }
}
