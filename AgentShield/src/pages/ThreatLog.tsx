import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Filter, Eye, Code, Link2, Database, FileWarning } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { generateMockScans } from "@/lib/mock-data";
import { ThreatDetail } from "@/lib/types";

const typeIcons: Record<string, typeof AlertTriangle> = {
  hidden_text: Eye,
  prompt_injection: Code,
  deceptive_ui: FileWarning,
  suspicious_link: Link2,
  data_exfil: Database,
};

const ThreatLog = () => {
  const [filter, setFilter] = useState<string>("all");

  const allThreats = useMemo(() => {
    const scans = generateMockScans();
    const threats: (ThreatDetail & { url: string; timestamp: Date })[] = [];
    scans.forEach((scan) => {
      scan.threats.forEach((threat) => {
        threats.push({ ...threat, url: scan.url, timestamp: scan.timestamp });
      });
    });
    return threats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, []);

  const filteredThreats = filter === "all" ? allThreats : allThreats.filter((t) => t.type === filter);

  const threatCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allThreats.forEach((t) => {
      counts[t.type] = (counts[t.type] || 0) + 1;
    });
    return counts;
  }, [allThreats]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Threat Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete history of detected threats across all scanned URLs
        </p>
      </div>

      {/* Threat Type Summary */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { key: "all", label: "All Threats", count: allThreats.length, icon: AlertTriangle },
          { key: "hidden_text", label: "Hidden Text", count: threatCounts.hidden_text || 0, icon: Eye },
          { key: "prompt_injection", label: "Injection", count: threatCounts.prompt_injection || 0, icon: Code },
          { key: "deceptive_ui", label: "Deceptive UI", count: threatCounts.deceptive_ui || 0, icon: FileWarning },
          { key: "suspicious_link", label: "Suspicious Links", count: threatCounts.suspicious_link || 0, icon: Link2 },
        ].map((item) => (
          <motion.button
            key={item.key}
            onClick={() => setFilter(item.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`card-gradient border rounded-xl p-4 text-left transition-all ${
              filter === item.key
                ? "border-primary/50 glow-cyan"
                : "border-border hover:border-border/80"
            }`}
          >
            <item.icon className={`w-4 h-4 mb-2 ${filter === item.key ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-lg font-bold text-foreground">{item.count}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Threat List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-gradient border border-border rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">
              {filter === "all" ? "All Threats" : `Filtered: ${filter.replace("_", " ")}`}
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">{filteredThreats.length} results</span>
        </div>

        <div className="space-y-3">
          {filteredThreats.map((threat, i) => {
            const Icon = typeIcons[threat.type] || AlertTriangle;
            return (
              <motion.div
                key={`${threat.id}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-secondary">
                    <Icon className="w-4 h-4 text-amber" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground capitalize">
                        {threat.type.replace(/_/g, " ")}
                      </span>
                      <RiskBadge level={threat.severity} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{threat.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
                      <span>URL: {threat.url}</span>
                      <span>{threat.timestamp.toLocaleString()}</span>
                    </div>
                    {threat.pattern && (
                      <code className="block mt-2 text-[11px] font-mono text-amber bg-secondary/70 px-2 py-1 rounded">
                        Regex: /{threat.pattern}/
                      </code>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default ThreatLog;
