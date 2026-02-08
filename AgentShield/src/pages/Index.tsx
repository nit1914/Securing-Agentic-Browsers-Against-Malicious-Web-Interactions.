import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, AlertTriangle, AlertOctagon, TrendingUp, Clock, ExternalLink, Zap, FileWarning, Code, Globe } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RiskBadge } from "@/components/RiskBadge";
import { SecurityShield3D } from "@/components/SecurityShield3D";
import { NetworkVisualization3D } from "@/components/NetworkVisualization3D";
import { generateMockScans } from "@/lib/mock-data";
import { useMemo } from "react";

const Dashboard = () => {
  const scans = useMemo(() => generateMockScans(), []);

  const totalScans = scans.length;
  const threatsDetected = scans.reduce((sum, s) => sum + s.threatsFound, 0);
  const criticalAlerts = scans.filter((s) => s.riskLevel === "high" || s.riskLevel === "critical").length;
  const avgRisk = Math.round(scans.reduce((sum, s) => sum + s.riskScore, 0) / scans.length);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Security Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time threat monitoring for your agentic browser</p>
      </div>

      {/* Hero Banner with 3D */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-gradient border border-primary/20 rounded-xl p-6 mb-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 cyber-gradient" />
        <div className="relative flex items-center gap-6">
          <NetworkVisualization3D threatCount={criticalAlerts} className="w-48 h-32 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground mb-1">Secure Agentic Browser Active</h2>
            <p className="text-xs text-muted-foreground mb-3">
              3-layer security engine: Malicious Content Detection → Secure Action Mediation → LLM-Assisted Reasoning
            </p>
            <Link
              to="/browser"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors glow-cyan"
            >
              <Globe className="w-4 h-4" /> Launch Secure Browser
            </Link>
          </div>
          <SecurityShield3D riskLevel={avgRisk} className="w-36 h-36 flex-shrink-0" />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={Search} value={totalScans} label="Total Scans" iconColor="text-primary" delay={0} />
        <StatCard icon={AlertTriangle} value={threatsDetected} label="Threats Detected" iconColor="text-amber" delay={0.1} />
        <StatCard icon={AlertOctagon} value={criticalAlerts} label="Critical Alerts" iconColor="text-critical" delay={0.2} />
        <StatCard icon={TrendingUp} value={avgRisk} label="Avg Risk Score" iconColor="text-info" delay={0.3} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Scans - 2 columns */}
        <div className="col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-gradient border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground">Recent Scans</h2>
              </div>
              <Link
                to="/scanner"
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                New Scan <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {scans.slice(0, 8).map((scan, i) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-mono text-sm font-bold text-foreground">
                    {scan.riskScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-foreground truncate font-mono">{scan.url}</p>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {scan.timestamp.toLocaleString()} • {scan.threatsFound} threat{scan.threatsFound !== 1 ? "s" : ""} found
                    </p>
                  </div>
                  <RiskBadge level={scan.riskLevel} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* 3D Risk Shield */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-gradient border border-border rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary animate-pulse-glow" />
              <h2 className="text-base font-semibold text-foreground">Overall Risk</h2>
            </div>
            <SecurityShield3D riskLevel={avgRisk} className="h-40" />
            <div className="text-center mt-2">
              <p className="text-2xl font-bold text-foreground">{avgRisk}</p>
              <p className="text-xs text-muted-foreground">Average risk across {totalScans} scans</p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card-gradient border border-border rounded-xl p-6"
          >
            <h2 className="text-base font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/browser"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors text-sm text-primary font-medium"
              >
                <Globe className="w-4 h-4" /> Secure Browser
              </Link>
              <Link
                to="/scanner"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors text-sm text-foreground"
              >
                <Search className="w-4 h-4 text-primary" /> Scan a URL
              </Link>
              <Link
                to="/threats"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors text-sm text-foreground"
              >
                <FileWarning className="w-4 h-4 text-amber" /> View Threat Log
              </Link>
              <Link
                to="/mediator"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors text-sm text-foreground"
              >
                <Zap className="w-4 h-4 text-info" /> Action Mediator
              </Link>
              <Link
                to="/dom-analyzer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors text-sm text-foreground"
              >
                <Code className="w-4 h-4 text-safe" /> DOM Analyzer
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
