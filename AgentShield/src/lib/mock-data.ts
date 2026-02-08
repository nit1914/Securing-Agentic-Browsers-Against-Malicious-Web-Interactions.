import { ScanResult, ActionLog, DOMAnalysis, getRiskLevel } from "./types";

// Generate mock scan data matching the existing app
const mockUrls = [
  "http://www.juventudelirica.com.br/index.html",
  "https://docs.google.com/spreadsheet/viewform?formkey=dGg2Z1lCUHlSdjllTVNRUW50TFIzSkE6MQ",
  "http://www.824555.com/app/member/SportOption.php?uid=guest&langx=gb",
  "http://hollywoodlife.com/2014/05/01/rihanna-iheartradio-music-awards-dress-2014-pics/",
  "https://happymod.click/",
  "http://www.pashminaonline.com/pure-pashminas",
];

const threatTypes = [
  { type: "hidden_text" as const, desc: "Hidden text element detected with potential instructions" },
  { type: "prompt_injection" as const, desc: "Pattern matching: 'ignore previous instructions' detected" },
  { type: "deceptive_ui" as const, desc: "Deceptive UI element mimicking browser chrome" },
  { type: "suspicious_link" as const, desc: "Redirect chain detected to unknown domain" },
  { type: "data_exfil" as const, desc: "Form data being sent to third-party endpoint" },
];

export function generateMockScans(): ScanResult[] {
  const scans: ScanResult[] = [];
  const riskScores = [25, 45, 55, 2, 85, 5, 75, 5, 15, 5, 35, 62, 8, 90, 42, 18];

  for (let i = 0; i < 16; i++) {
    const score = riskScores[i % riskScores.length];
    const url = mockUrls[i % mockUrls.length];
    const level = getRiskLevel(score);
    const numThreats = score > 50 ? 2 : score > 20 ? 1 : 0;

    const threats = [];
    for (let t = 0; t < numThreats; t++) {
      const threat = threatTypes[(i + t) % threatTypes.length];
      threats.push({
        id: `threat-${i}-${t}`,
        type: threat.type,
        severity: level,
        description: threat.desc,
        pattern: threat.type === "prompt_injection" ? "ignore (all )?previous instructions" : undefined,
      });
    }

    scans.push({
      id: `scan-${i}`,
      url,
      timestamp: new Date(Date.now() - i * 120000),
      riskScore: score,
      riskLevel: level,
      threatsFound: numThreats,
      threats,
      hiddenElements: score > 40 ? ["Hidden div with display:none containing instructions"] : [],
      injectionFlags: score > 60 ? ["ignore (all )?previous instructions"] : [],
    });
  }

  return scans;
}

export function generateMockActions(): ActionLog[] {
  return [
    {
      id: "act-1",
      timestamp: new Date(Date.now() - 60000),
      actionType: "navigate",
      params: { url: "https://example.com/flights" },
      riskScore: 2,
      status: "SUCCESS",
      explanation: "Low: Action aligns with goal and no major threats found.",
      goal: "Search for flight tickets",
    },
    {
      id: "act-2",
      timestamp: new Date(Date.now() - 45000),
      actionType: "click",
      params: { selector: "#search-btn" },
      riskScore: 1.5,
      status: "SUCCESS",
      explanation: "Low: Standard UI interaction within expected flow.",
      goal: "Search for flight tickets",
    },
    {
      id: "act-3",
      timestamp: new Date(Date.now() - 30000),
      actionType: "type",
      params: { selector: "#destination", text: "New York" },
      riskScore: 1,
      status: "SUCCESS",
      explanation: "Low: Text input aligns with search goal.",
      goal: "Search for flight tickets",
    },
    {
      id: "act-4",
      timestamp: new Date(Date.now() - 15000),
      actionType: "click",
      params: { selector: "#btn-delete-account" },
      riskScore: 8.0,
      status: "BLOCKED",
      explanation: "Medium-High: Action 'delete' deviates from primary goal.",
      goal: "Search for flight tickets",
    },
    {
      id: "act-5",
      timestamp: new Date(Date.now() - 10000),
      actionType: "click",
      params: { selector: "#payment-submit" },
      riskScore: 9.5,
      status: "BLOCKED",
      explanation: "High: Site contains hidden instructions while agent attempts sensitive action.",
      goal: "Search for flight tickets",
    },
    {
      id: "act-6",
      timestamp: new Date(Date.now() - 5000),
      actionType: "navigate",
      params: { url: "https://malicious-redirect.com/admin" },
      riskScore: 9.0,
      status: "BLOCKED",
      explanation: "High: Navigation to unknown admin URL deviates from goal.",
      goal: "Search for flight tickets",
    },
  ];
}

export function generateMockDOMAnalysis(): DOMAnalysis[] {
  return [
    {
      id: "dom-1",
      url: "https://happymod.click/",
      timestamp: new Date(Date.now() - 60000),
      totalElements: 1247,
      hiddenElements: 23,
      scripts: 18,
      iframes: 3,
      forms: 2,
      suspiciousPatterns: ["Hidden text with font-size:0", "iframe pointing to external domain", "Form action to third-party URL"],
      riskScore: 85,
    },
    {
      id: "dom-2",
      url: "http://www.824555.com/app/member/SportOption.php",
      timestamp: new Date(Date.now() - 120000),
      totalElements: 892,
      hiddenElements: 8,
      scripts: 12,
      iframes: 1,
      forms: 4,
      suspiciousPatterns: ["Obfuscated JavaScript detected", "Hidden form fields with sensitive names"],
      riskScore: 55,
    },
    {
      id: "dom-3",
      url: "http://hollywoodlife.com/2014/05/01/rihanna",
      timestamp: new Date(Date.now() - 180000),
      totalElements: 2103,
      hiddenElements: 2,
      scripts: 24,
      iframes: 0,
      forms: 1,
      suspiciousPatterns: [],
      riskScore: 5,
    },
  ];
}
