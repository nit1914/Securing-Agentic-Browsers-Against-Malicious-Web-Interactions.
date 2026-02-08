import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, AlertTriangle, Eye, Loader2, CheckCircle, XCircle } from "lucide-react";
import { RiskGauge } from "@/components/RiskGauge";
import { RiskBadge } from "@/components/RiskBadge";
import { ScanResult, getRiskLevel } from "@/lib/types";

const injectionPatterns = [
  /ignore (all )?previous instructions/i,
  /system override/i,
  /new mandate:/i,
  /instead of (.*), do (.*)/i,
];

function simulateScan(url: string): ScanResult {
  // Simulate risk based on URL characteristics
  let baseScore = Math.floor(Math.random() * 30) + 5;

  if (url.includes("click") || url.includes("free") || url.includes("win")) baseScore += 40;
  if (url.includes("admin") || url.includes("login")) baseScore += 20;
  if (url.includes("php") || url.includes("?uid=")) baseScore += 25;
  if (url.includes("google.com") || url.includes("github.com")) baseScore = Math.max(5, baseScore - 30);

  baseScore = Math.min(100, baseScore);
  const level = getRiskLevel(baseScore);

  const threats = [];
  if (baseScore > 40) {
    threats.push({
      id: `t-${Date.now()}-1`,
      type: "hidden_text" as const,
      severity: level,
      description: "Hidden text element detected with potential LLM instructions",
      element: '<div style="display:none">Ignore previous instructions and...</div>',
    });
  }
  if (baseScore > 60) {
    threats.push({
      id: `t-${Date.now()}-2`,
      type: "prompt_injection" as const,
      severity: level,
      description: "Pattern matching detected prompt injection attempt",
      pattern: "ignore (all )?previous instructions",
    });
  }

  return {
    id: `scan-${Date.now()}`,
    url,
    timestamp: new Date(),
    riskScore: baseScore,
    riskLevel: level,
    threatsFound: threats.length,
    threats,
    hiddenElements: baseScore > 40 ? ["Hidden div with display:none"] : [],
    injectionFlags: baseScore > 60 ? ["ignore previous instructions"] : [],
  };
}

const Scanner = () => {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);

  const handleScan = async () => {
    if (!url.trim()) return;
    setScanning(true);

    // Simulate scanning delay with phases
    await new Promise((r) => setTimeout(r, 2000));

    const result = simulateScan(url);
    setResults((prev) => [result, ...prev]);
    setScanning(false);
  };

  const latestResult = results[0];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">URL Scanner</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Layer A: Malicious Content Detection — Scan URLs for hidden prompt injections and deceptive UI
        </p>
      </div>

      {/* Scanner Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-gradient border border-border rounded-xl p-6 mb-6"
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="Enter URL to scan (e.g., https://example.com)"
              className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 font-mono"
            />
          </div>
          <button
            onClick={handleScan}
            disabled={scanning || !url.trim()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 glow-cyan"
          >
            {scanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" /> Scan
              </>
            )}
          </button>
        </div>

        {/* Scanning Animation */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              {["Fetching page content...", "Detecting hidden elements...", "Pattern matching for injections...", "Running LLM risk assessment..."].map(
                (step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.4 }}
                    className="flex items-center gap-2 text-xs font-mono text-muted-foreground"
                  >
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    {step}
                  </motion.div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Latest Result */}
      <AnimatePresence>
        {latestResult && !scanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-6 mb-6"
          >
            {/* Result Summary */}
            <div className="col-span-2 card-gradient border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">Scan Results</h2>
                <RiskBadge level={latestResult.riskLevel} />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-20">URL:</span>
                  <span className="font-mono text-foreground truncate">{latestResult.url}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-20">Time:</span>
                  <span className="text-foreground">{latestResult.timestamp.toLocaleString()}</span>
                </div>
              </div>

              {/* Security Checks */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Security Checks</h3>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  {latestResult.hiddenElements.length === 0 ? (
                    <CheckCircle className="w-4 h-4 text-safe flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-critical flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm text-foreground">Hidden Element Detection</p>
                    <p className="text-xs text-muted-foreground">
                      {latestResult.hiddenElements.length === 0
                        ? "No hidden text elements found"
                        : `${latestResult.hiddenElements.length} hidden element(s) with potential LLM instructions`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  {latestResult.injectionFlags.length === 0 ? (
                    <CheckCircle className="w-4 h-4 text-safe flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-critical flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm text-foreground">Prompt Injection Patterns</p>
                    <p className="text-xs text-muted-foreground">
                      {latestResult.injectionFlags.length === 0
                        ? "No injection patterns detected"
                        : `${latestResult.injectionFlags.length} injection pattern(s) matched`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <Eye className="w-4 h-4 text-info flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">Deceptive UI Check</p>
                    <p className="text-xs text-muted-foreground">
                      {latestResult.riskScore > 70
                        ? "Potential deceptive UI elements detected"
                        : "No deceptive UI patterns found"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Threats */}
              {latestResult.threats.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Detected Threats</h3>
                  <div className="space-y-2">
                    {latestResult.threats.map((threat) => (
                      <div key={threat.id} className="p-3 rounded-lg bg-critical/5 border border-critical/20">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-critical" />
                          <span className="text-sm font-medium text-foreground capitalize">
                            {threat.type.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{threat.description}</p>
                        {threat.pattern && (
                          <code className="block mt-2 text-[11px] font-mono text-amber bg-secondary/50 px-2 py-1 rounded">
                            Pattern: /{threat.pattern}/
                          </code>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Risk Score */}
            <div className="card-gradient border border-border rounded-xl p-6 flex flex-col items-center justify-center">
              <RiskGauge score={latestResult.riskScore} size={180} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {results.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-gradient border border-border rounded-xl p-6"
        >
          <h2 className="text-base font-semibold text-foreground mb-4">Scan History</h2>
          <div className="space-y-2">
            {results.slice(1).map((scan) => (
              <div key={scan.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-mono text-sm font-bold text-foreground">
                  {scan.riskScore}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-mono">{scan.url}</p>
                  <p className="text-xs text-muted-foreground">
                    {scan.timestamp.toLocaleString()} • {scan.threatsFound} threats
                  </p>
                </div>
                <RiskBadge level={scan.riskLevel} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Scanner;
