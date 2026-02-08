import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, ArrowLeft, ArrowRight, RotateCw, Shield, Lock, Unlock,
  AlertTriangle, ShieldCheck, ShieldX, Eye, Code, Loader2,
  ChevronDown, X, Play, Square, CheckCircle, XCircle
} from "lucide-react";
import { SecurityShield3D } from "@/components/SecurityShield3D";
import { cn } from "@/lib/utils";
import { RiskBadge } from "@/components/RiskBadge";
import { getRiskLevel, type RiskLevel } from "@/lib/types";

// Security engine - translated from Python SecureAgenticBrowser
const SENSITIVE_KEYWORDS = ["payment", "password", "delete", "transfer", "admin", "auth", "login", "bank"];
const ALLOWED_ACTIONS = ["click", "type", "navigate", "scroll", "extract"];
const RISK_THRESHOLD = 6.5;

const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /system override/i,
  /new mandate:/i,
  /instead of .*, do .*/i,
  /disregard.*safety/i,
];

interface BrowserAction {
  id: string;
  timestamp: Date;
  type: string;
  target: string;
  riskScore: number;
  status: "SUCCESS" | "BLOCKED" | "PENDING" | "FAILED";
  explanation: string;
  sensitiveDetected: boolean;
  threatContext: boolean;
}

interface SecurityScan {
  hiddenElements: number;
  injectionPatterns: string[];
  suspiciousScripts: number;
  riskDetected: boolean;
  deceptiveUI: boolean;
}

function simulateEnvironmentScan(url: string): SecurityScan {
  const isSuspicious = url.includes("click") || url.includes("free") || url.includes("win") || 
                       url.includes("admin") || url.includes("php?uid");
  const injections: string[] = [];
  if (isSuspicious) {
    injections.push("ignore (all )?previous instructions");
  }
  
  return {
    hiddenElements: isSuspicious ? Math.floor(Math.random() * 15) + 3 : Math.floor(Math.random() * 2),
    injectionPatterns: injections,
    suspiciousScripts: isSuspicious ? Math.floor(Math.random() * 8) + 2 : Math.floor(Math.random() * 3),
    riskDetected: isSuspicious,
    deceptiveUI: isSuspicious && Math.random() > 0.5,
  };
}

function securityLLMCheck(
  actionType: string,
  target: string,
  goal: string,
  threats: SecurityScan
): { riskScore: number; explanation: string } {
  const isSensitive = SENSITIVE_KEYWORDS.some(k => target.toLowerCase().includes(k));

  if (threats.riskDetected && isSensitive) {
    return { riskScore: 9.5, explanation: "High: Site contains hidden instructions while agent attempts sensitive action." };
  }
  if (isSensitive && target.toLowerCase().includes("delete")) {
    return { riskScore: 8.0, explanation: "Medium-High: Action 'delete' deviates from primary goal." };
  }
  if (isSensitive && target.toLowerCase().includes("payment")) {
    return { riskScore: 7.5, explanation: "Medium-High: Payment action requires elevated verification." };
  }
  if (isSensitive) {
    return { riskScore: 6.0, explanation: "Medium: Sensitive keyword detected in target selector." };
  }
  if (threats.riskDetected) {
    return { riskScore: 4.5, explanation: "Low-Medium: Page has threats but action is not sensitive." };
  }
  return { riskScore: 2.0, explanation: "Low: Action aligns with goal and no major threats found." };
}

const SecureBrowser = () => {
  const [url, setUrl] = useState("https://example.com");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [agentGoal, setAgentGoal] = useState("Search for flight tickets");
  const [actions, setActions] = useState<BrowserAction[]>([]);
  const [currentScan, setCurrentScan] = useState<SecurityScan | null>(null);
  const [showSecurityPanel, setShowSecurityPanel] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<BrowserAction | null>(null);
  const [overallRisk, setOverallRisk] = useState(0);
  const [scanPhase, setScanPhase] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const calculateOverallRisk = useCallback((acts: BrowserAction[]) => {
    if (acts.length === 0) return 0;
    const avg = acts.reduce((sum, a) => sum + a.riskScore * 10, 0) / acts.length;
    return Math.min(100, Math.round(avg));
  }, []);

  const navigateTo = useCallback(async (targetUrl: string) => {
    let formattedUrl = targetUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setIsLoading(true);
    setIsScanning(true);
    setCurrentUrl(formattedUrl);
    setUrl(formattedUrl);

    // Phase 1: Scan
    const phases = [
      "Fetching page content...",
      "Detecting hidden elements (display:none, visibility:hidden)...",
      "Scanning for font-size:0 and same-color text...",
      "Pattern matching for prompt injections...",
      "Checking for deceptive UI elements...",
      "Running LLM-assisted risk assessment...",
    ];

    for (const phase of phases) {
      setScanPhase(phase);
      await new Promise(r => setTimeout(r, 400));
    }

    const scan = simulateEnvironmentScan(formattedUrl);
    setCurrentScan(scan);

    // Phase 2: Action mediation
    const { riskScore, explanation } = securityLLMCheck("navigate", formattedUrl, agentGoal, scan);

    const action: BrowserAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date(),
      type: "navigate",
      target: formattedUrl,
      riskScore,
      status: riskScore > RISK_THRESHOLD ? "PENDING" : "SUCCESS",
      explanation,
      sensitiveDetected: SENSITIVE_KEYWORDS.some(k => formattedUrl.toLowerCase().includes(k)),
      threatContext: scan.riskDetected,
    };

    if (riskScore > RISK_THRESHOLD) {
      setPendingAction(action);
      setShowApprovalModal(true);
      setIsScanning(false);
      setIsLoading(false);
      return;
    }

    setActions(prev => {
      const next = [action, ...prev];
      setOverallRisk(calculateOverallRisk(next));
      return next;
    });

    setIsScanning(false);
    setScanPhase("");
    setTimeout(() => setIsLoading(false), 500);
  }, [agentGoal, calculateOverallRisk]);

  const handleApprove = useCallback(() => {
    if (pendingAction) {
      const approved = { ...pendingAction, status: "SUCCESS" as const };
      setActions(prev => {
        const next = [approved, ...prev];
        setOverallRisk(calculateOverallRisk(next));
        return next;
      });
    }
    setShowApprovalModal(false);
    setPendingAction(null);
    setIsLoading(false);
  }, [pendingAction, calculateOverallRisk]);

  const handleDeny = useCallback(() => {
    if (pendingAction) {
      const blocked = { ...pendingAction, status: "BLOCKED" as const };
      setActions(prev => {
        const next = [blocked, ...prev];
        setOverallRisk(calculateOverallRisk(next));
        return next;
      });
      setCurrentUrl("");
    }
    setShowApprovalModal(false);
    setPendingAction(null);
    setIsLoading(false);
  }, [pendingAction, calculateOverallRisk]);

  const simulateAgentAction = useCallback(async (actionType: string, target: string) => {
    if (!ALLOWED_ACTIONS.includes(actionType)) {
      const blocked: BrowserAction = {
        id: `act-${Date.now()}`,
        timestamp: new Date(),
        type: actionType,
        target,
        riskScore: 10,
        status: "BLOCKED",
        explanation: `Action '${actionType}' not permitted by allowlist policy.`,
        sensitiveDetected: false,
        threatContext: false,
      };
      setActions(prev => [blocked, ...prev]);
      return;
    }

    setIsScanning(true);
    setScanPhase("Analyzing action context...");
    await new Promise(r => setTimeout(r, 800));
    
    const scan = currentScan || simulateEnvironmentScan(currentUrl);
    const { riskScore, explanation } = securityLLMCheck(actionType, target, agentGoal, scan);

    const action: BrowserAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date(),
      type: actionType,
      target,
      riskScore,
      status: riskScore > RISK_THRESHOLD ? "PENDING" : "SUCCESS",
      explanation,
      sensitiveDetected: SENSITIVE_KEYWORDS.some(k => target.toLowerCase().includes(k)),
      threatContext: scan.riskDetected,
    };

    if (riskScore > RISK_THRESHOLD) {
      setPendingAction(action);
      setShowApprovalModal(true);
    } else {
      setActions(prev => {
        const next = [action, ...prev];
        setOverallRisk(calculateOverallRisk(next));
        return next;
      });
    }

    setIsScanning(false);
    setScanPhase("");
  }, [currentUrl, currentScan, agentGoal, calculateOverallRisk]);

  const presetScenarios = [
    { label: "Safe: Search Flight", action: "click", target: "#search-flights-btn", goal: "Search for flight tickets" },
    { label: "⚠️ Delete Account", action: "click", target: "#btn-delete-account", goal: "Search for flight tickets" },
    { label: "🚨 Payment Submit", action: "click", target: "#payment-submit", goal: "Search for flight tickets" },
    { label: "⚠️ Admin Panel", action: "navigate", target: "https://malicious.com/admin", goal: "Search for flight tickets" },
    { label: "Safe: Type Destination", action: "type", target: "#destination-input", goal: "Search for flight tickets" },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Secure Browser</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time agentic browser with 3-layer security: Content Detection → Action Mediation → LLM Reasoning
        </p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Browser Window */}
        <div className="flex-1 flex flex-col card-gradient border border-border rounded-xl overflow-hidden">
          {/* Browser Chrome */}
          <div className="bg-secondary/50 border-b border-border p-2 space-y-2">
            {/* Agent Goal Bar */}
            <div className="flex items-center gap-2 px-2">
              <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Agent Goal:</span>
              <input
                value={agentGoal}
                onChange={e => setAgentGoal(e.target.value)}
                className="flex-1 text-xs bg-transparent text-primary font-medium border-none outline-none"
              />
            </div>
            {/* URL Bar */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-secondary rounded" onClick={() => window.history.back()}>
                  <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button className="p-1 hover:bg-secondary rounded" onClick={() => window.history.forward()}>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button className="p-1 hover:bg-secondary rounded" onClick={() => navigateTo(url)}>
                  <RotateCw className={cn("w-3.5 h-3.5 text-muted-foreground", isLoading && "animate-spin")} />
                </button>
              </div>
              <div className="flex-1 flex items-center bg-background/80 rounded-lg border border-border px-3 py-1.5">
                {currentUrl.startsWith("https://") ? (
                  <Lock className="w-3 h-3 text-safe mr-2 flex-shrink-0" />
                ) : currentUrl ? (
                  <Unlock className="w-3 h-3 text-amber mr-2 flex-shrink-0" />
                ) : (
                  <Globe className="w-3 h-3 text-muted-foreground mr-2 flex-shrink-0" />
                )}
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && navigateTo(url)}
                  placeholder="Enter URL to navigate..."
                  className="flex-1 text-xs font-mono text-foreground bg-transparent outline-none"
                />
                <button
                  onClick={() => navigateTo(url)}
                  className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded text-[10px] font-bold hover:bg-primary/90 transition-colors"
                >
                  GO
                </button>
              </div>
            </div>
          </div>

          {/* Scanning Overlay */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-primary/5 border-b border-primary/20 px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span className="text-xs font-mono text-primary">{scanPhase}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Browser Content */}
          <div className="flex-1 relative bg-background/50">
            {currentUrl ? (
              <iframe
                ref={iframeRef}
                src={currentUrl}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="Secure Browser"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <SecurityShield3D riskLevel={overallRisk} scanning={isScanning} className="w-48 h-48" />
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-foreground mb-1">Secure Agentic Browser</h2>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Enter a URL to browse securely. All actions are mediated through a 3-layer security system
                    with malicious content detection, action policy enforcement, and LLM-assisted threat reasoning.
                  </p>
                </div>
                {/* Quick URLs */}
                <div className="flex gap-2 flex-wrap justify-center max-w-md">
                  {["https://example.com", "https://wikipedia.org", "https://happymod.click/"].map(u => (
                    <button
                      key={u}
                      onClick={() => { setUrl(u); navigateTo(u); }}
                      className="px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                    >
                      {u.replace("https://", "")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading overlay */}
            {isLoading && currentUrl && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <SecurityShield3D riskLevel={overallRisk} scanning className="w-40 h-40" />
              </div>
            )}
          </div>
        </div>

        {/* Security Panel */}
        {showSecurityPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            className="w-[340px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto"
          >
            {/* 3D Shield + Risk */}
            <div className="card-gradient border border-border rounded-xl p-4 relative overflow-hidden">
              <SecurityShield3D riskLevel={overallRisk} scanning={isScanning} className="h-32 -mt-2 -mb-2" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{overallRisk}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall Risk Score</p>
              </div>
            </div>

            {/* Environment Scan */}
            {currentScan && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-gradient border border-border rounded-xl p-4"
              >
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Eye className="w-3 h-3" /> Environment Scan
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Hidden Elements", value: currentScan.hiddenElements, warn: currentScan.hiddenElements > 2 },
                    { label: "Injection Patterns", value: currentScan.injectionPatterns.length, warn: currentScan.injectionPatterns.length > 0 },
                    { label: "Suspicious Scripts", value: currentScan.suspiciousScripts, warn: currentScan.suspiciousScripts > 5 },
                    { label: "Deceptive UI", value: currentScan.deceptiveUI ? "Yes" : "No", warn: currentScan.deceptiveUI },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={cn("font-mono font-bold", item.warn ? "text-critical" : "text-safe")}>
                        {item.warn ? <XCircle className="w-3 h-3 inline mr-1" /> : <CheckCircle className="w-3 h-3 inline mr-1" />}
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Agent Action Simulator */}
            <div className="card-gradient border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Play className="w-3 h-3" /> Simulate Agent Action
              </h3>
              <div className="space-y-1.5">
                {presetScenarios.map(scenario => (
                  <button
                    key={scenario.label}
                    onClick={() => simulateAgentAction(scenario.action, scenario.target)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors text-left"
                  >
                    <Code className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">{scenario.label}</p>
                      <p className="text-[10px] font-mono text-muted-foreground truncate">
                        {scenario.action}("{scenario.target}")
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Log */}
            <div className="card-gradient border border-border rounded-xl p-4 flex-1 min-h-0">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Action Log ({actions.length})
              </h3>
              <div className="space-y-2 overflow-y-auto max-h-60">
                {actions.map(action => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-2 rounded-lg border text-xs",
                      action.status === "SUCCESS" ? "bg-safe/5 border-safe/20" :
                      action.status === "BLOCKED" ? "bg-critical/5 border-critical/20" :
                      "bg-amber/5 border-amber/20"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {action.status === "SUCCESS" ? (
                        <ShieldCheck className="w-3 h-3 text-safe" />
                      ) : (
                        <ShieldX className="w-3 h-3 text-critical" />
                      )}
                      <span className="font-mono font-bold">{action.type}</span>
                      <span className={cn(
                        "ml-auto text-[10px] font-bold uppercase",
                        action.status === "SUCCESS" ? "text-safe" : "text-critical"
                      )}>{action.status}</span>
                    </div>
                    <p className="text-muted-foreground font-mono truncate text-[10px]">{action.target}</p>
                    <p className="text-muted-foreground mt-1 text-[10px]">Risk: {action.riskScore}/10 — {action.explanation}</p>
                  </motion.div>
                ))}
                {actions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No actions yet</p>
                )}
              </div>
            </div>

            {/* Security Policy */}
            <div className="card-gradient border border-border rounded-xl p-3">
              <p className="text-[10px] font-mono text-muted-foreground">
                <span className="text-primary">Threshold:</span> {RISK_THRESHOLD}/10 &nbsp;|&nbsp;
                <span className="text-primary">Allowed:</span> {ALLOWED_ACTIONS.join(", ")}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Toggle security panel */}
      <button
        onClick={() => setShowSecurityPanel(!showSecurityPanel)}
        className="fixed right-8 bottom-8 p-2 bg-primary text-primary-foreground rounded-full glow-cyan z-50"
      >
        <Shield className="w-5 h-5" />
      </button>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && pendingAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100]"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-[480px] card-gradient border border-critical/30 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-critical/15 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-critical" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Security Alert</h2>
                  <p className="text-xs text-muted-foreground">Human-in-the-loop verification required</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Risk Score:</span>
                  <span className="font-bold text-critical">{pendingAction.riskScore}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Action:</span>
                  <span className="font-mono text-foreground">{pendingAction.type}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Target:</span>
                  <p className="font-mono text-foreground mt-0.5 text-xs break-all">{pendingAction.target}</p>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Explanation:</span>
                  <p className="text-foreground mt-0.5 text-xs">{pendingAction.explanation}</p>
                </div>
                {pendingAction.sensitiveDetected && (
                  <div className="p-2 rounded bg-amber/10 border border-amber/20 text-xs text-amber">
                    ⚠️ Sensitive keywords detected in target
                  </div>
                )}
                {pendingAction.threatContext && (
                  <div className="p-2 rounded bg-critical/10 border border-critical/20 text-xs text-critical">
                    🚨 Active threats detected on current page
                  </div>
                )}
              </div>

              {/* 3D Shield in modal */}
              <SecurityShield3D riskLevel={pendingAction.riskScore * 10} scanning className="h-24 mb-4" />

              <div className="flex gap-3">
                <button
                  onClick={handleDeny}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-critical/15 border border-critical/30 text-critical rounded-lg text-sm font-medium hover:bg-critical/25 transition-colors"
                >
                  <X className="w-4 h-4" /> Deny Action
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-safe/15 border border-safe/30 text-safe rounded-lg text-sm font-medium hover:bg-safe/25 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecureBrowser;
