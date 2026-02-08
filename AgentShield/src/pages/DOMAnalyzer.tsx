import { useMemo } from "react";
import { motion } from "framer-motion";
import { Code, FileCode, Globe, AlertTriangle, Box, FileText, Frame, FormInput } from "lucide-react";
import { generateMockDOMAnalysis } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";
import { RiskGauge } from "@/components/RiskGauge";
import { getRiskLevel } from "@/lib/types";

const DOMAnalyzer = () => {
  const analyses = useMemo(() => generateMockDOMAnalysis(), []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">DOM Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Deep structural analysis of page DOM for hidden elements, scripts, and suspicious patterns
        </p>
      </div>

      <div className="space-y-6">
        {analyses.map((analysis, idx) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            className="card-gradient border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground font-mono">{analysis.url}</p>
                  <p className="text-xs text-muted-foreground">{analysis.timestamp.toLocaleString()}</p>
                </div>
              </div>
              <RiskBadge level={getRiskLevel(analysis.riskScore)} />
            </div>

            <div className="grid grid-cols-6 gap-4 mb-5">
              {[
                { icon: Box, value: analysis.totalElements, label: "Elements" },
                { icon: Code, value: analysis.hiddenElements, label: "Hidden", warn: analysis.hiddenElements > 5 },
                { icon: FileCode, value: analysis.scripts, label: "Scripts", warn: analysis.scripts > 15 },
                { icon: Frame, value: analysis.iframes, label: "iFrames", warn: analysis.iframes > 0 },
                { icon: FormInput, value: analysis.forms, label: "Forms" },
                { icon: AlertTriangle, value: analysis.suspiciousPatterns.length, label: "Suspicious", warn: analysis.suspiciousPatterns.length > 0 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`p-3 rounded-lg text-center ${
                    stat.warn ? "bg-critical/5 border border-critical/20" : "bg-secondary/30"
                  }`}
                >
                  <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.warn ? "text-critical" : "text-muted-foreground"}`} />
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Suspicious Patterns */}
            {analysis.suspiciousPatterns.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Suspicious Patterns
                </h3>
                <div className="space-y-1.5">
                  {analysis.suspiciousPatterns.map((pattern, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-amber/5 border border-amber/15">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber flex-shrink-0" />
                      <span className="text-xs text-foreground font-mono">{pattern}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.suspiciousPatterns.length === 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-safe/5 border border-safe/20">
                <FileText className="w-4 h-4 text-safe" />
                <span className="text-sm text-safe">No suspicious patterns detected in DOM structure</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Architecture Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-gradient border border-border rounded-xl p-6 mt-6"
      >
        <h2 className="text-base font-semibold text-foreground mb-4">Detection Architecture</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="text-sm font-semibold text-primary mb-2">Layer A: Content Detection</h3>
            <p className="text-xs text-muted-foreground">
              Scans for hidden text (display:none, visibility:hidden, font-size:0), invisible same-color text,
              and matches regex patterns for prompt injection attempts.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-info/5 border border-info/20">
            <h3 className="text-sm font-semibold text-info mb-2">Layer B: Action Mediation</h3>
            <p className="text-xs text-muted-foreground">
              Gatekeeper module with allowlist policy, risk threshold (6.5), sensitive keyword detection,
              and human-in-the-loop verification for high-risk actions.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-amber/5 border border-amber/20">
            <h3 className="text-sm font-semibold text-amber mb-2">Layer C: LLM Reasoning</h3>
            <p className="text-xs text-muted-foreground">
              Secondary LLM compares proposed action against agent goal, evaluates site threat context,
              and assigns composite risk score with detailed explanation.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DOMAnalyzer;
