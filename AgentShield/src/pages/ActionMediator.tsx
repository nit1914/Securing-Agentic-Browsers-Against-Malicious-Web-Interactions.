import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, ShieldAlert, ShieldX, Play, Target, Brain, Loader2 } from "lucide-react";
import { generateMockActions } from "@/lib/mock-data";
import { SecurityShield3D } from "@/components/SecurityShield3D";
import { cn } from "@/lib/utils";

const statusConfig = {
  SUCCESS: { icon: ShieldCheck, color: "text-safe", bg: "bg-safe/10 border-safe/20", label: "Approved" },
  BLOCKED: { icon: ShieldX, color: "text-critical", bg: "bg-critical/10 border-critical/20", label: "Blocked" },
  FAILED: { icon: ShieldAlert, color: "text-amber", bg: "bg-amber/10 border-amber/20", label: "Failed" },
};

const ActionMediator = () => {
  const actions = useMemo(() => generateMockActions(), []);
  const [simGoal, setSimGoal] = useState("Search for flight tickets");
  const [simAction, setSimAction] = useState("click");
  const [simTarget, setSimTarget] = useState("#btn-delete-account");
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<null | {
    riskScore: number;
    status: string;
    explanation: string;
    isSensitive: boolean;
    threatsOnPage: boolean;
  }>(null);

  const sensitiveKeywords = ["payment", "password", "delete", "transfer", "admin", "auth"];

  const handleSimulate = async () => {
    setSimulating(true);
    setSimResult(null);
    await new Promise((r) => setTimeout(r, 1500));

    const isSensitive = sensitiveKeywords.some((k) => simTarget.toLowerCase().includes(k));
    const threatsOnPage = Math.random() > 0.5;

    let riskScore: number;
    let explanation: string;
    let status: string;

    if (threatsOnPage && isSensitive) {
      riskScore = 9.5;
      explanation = "High: Site contains hidden instructions while agent attempts sensitive action.";
      status = "BLOCKED";
    } else if (isSensitive && simTarget.toLowerCase().includes("delete")) {
      riskScore = 8.0;
      explanation = "Medium-High: Action 'delete' deviates from primary goal.";
      status = "BLOCKED";
    } else if (isSensitive) {
      riskScore = 6.0;
      explanation = "Medium: Sensitive keyword detected. Action needs review.";
      status = "BLOCKED";
    } else {
      riskScore = 2.0;
      explanation = "Low: Action aligns with goal and no major threats found.";
      status = "SUCCESS";
    }

    setSimResult({ riskScore, status, explanation, isSensitive, threatsOnPage });
    setSimulating(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Action Mediator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Layer B & C: Secure Action Mediation with LLM-Assisted Threat Reasoning
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Simulator - 2 cols */}
        <div className="col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-gradient border border-border rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Brain className="w-4 h-4 text-info" />
              <h2 className="text-base font-semibold text-foreground">Risk Simulator</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Agent Goal
                </label>
                <input
                  value={simGoal}
                  onChange={(e) => setSimGoal(e.target.value)}
                  className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Action Type
                  </label>
                  <select
                    value={simAction}
                    onChange={(e) => setSimAction(e.target.value)}
                    className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="click">Click</option>
                    <option value="navigate">Navigate</option>
                    <option value="type">Type</option>
                    <option value="scroll">Scroll</option>
                    <option value="extract">Extract</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Target / Selector
                  </label>
                  <input
                    value={simTarget}
                    onChange={(e) => setSimTarget(e.target.value)}
                    className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 glow-cyan"
              >
                {simulating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Simulate Action
                  </>
                )}
              </button>
            </div>

            {/* Simulation Result */}
            <AnimatePresence>
              {simResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className={cn(
                      "col-span-2 p-4 rounded-lg border",
                      simResult.status === "SUCCESS" ? "bg-safe/5 border-safe/20" : "bg-critical/5 border-critical/20"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {simResult.status === "SUCCESS" ? (
                          <ShieldCheck className="w-5 h-5 text-safe" />
                        ) : (
                          <ShieldX className="w-5 h-5 text-critical" />
                        )}
                        <span className="text-sm font-bold text-foreground">
                          {simResult.status === "SUCCESS" ? "ACTION APPROVED" : "ACTION BLOCKED"}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <p className="text-muted-foreground">
                          <span className="text-foreground font-medium">Risk Score:</span> {simResult.riskScore}/10
                        </p>
                        <p className="text-muted-foreground">
                          <span className="text-foreground font-medium">Sensitive Keywords:</span>{" "}
                          {simResult.isSensitive ? "Detected ⚠️" : "None ✓"}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="text-foreground font-medium">Page Threats:</span>{" "}
                          {simResult.threatsOnPage ? "Present ⚠️" : "None ✓"}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="text-foreground font-medium">Explanation:</span> {simResult.explanation}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <SecurityShield3D
                        riskLevel={simResult.riskScore * 10}
                        scanning={false}
                        className="w-full h-32"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right: 3D Viz + Policy */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-gradient border border-border rounded-xl p-6"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Security Status</h3>
            <SecurityShield3D riskLevel={20} scanning={simulating} className="h-40" />
            <div className="text-center mt-2">
              <p className="text-sm font-medium text-safe">System Active</p>
              <p className="text-[10px] text-muted-foreground">3-Layer Protection Enabled</p>
            </div>
          </motion.div>

          {/* Policy Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-gradient border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Security Policy</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-muted-foreground font-mono">
              <p>Risk Threshold: <span className="text-primary">6.5/10</span></p>
              <p>Allowed: <span className="text-foreground">click, type, navigate, scroll, extract</span></p>
              <p>Sensitive: <span className="text-amber">payment, password, delete, transfer, admin, auth</span></p>
              <p className="pt-1 border-t border-border/50 mt-2">
                Human-in-the-loop: <span className="text-primary">Enabled</span>
              </p>
              <p>LLM Reasoning: <span className="text-primary">Active</span></p>
            </div>
          </motion.div>
        </div>

        {/* Action History - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-3 card-gradient border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Action History</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {actions.map((action, i) => {
              const config = statusConfig[action.status as keyof typeof statusConfig];
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn("p-3 rounded-lg border", config.bg)}
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className={cn("w-4 h-4 flex-shrink-0", config.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-foreground">{action.actionType}</span>
                        <span className={cn("text-[10px] font-bold uppercase", config.color)}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        {JSON.stringify(action.params)}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">{action.explanation}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground">{action.riskScore}</p>
                      <p className="text-[10px] text-muted-foreground">/10</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ActionMediator;
