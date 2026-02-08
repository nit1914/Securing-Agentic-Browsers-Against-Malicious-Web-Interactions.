import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number;
  size?: number;
  label?: string;
  sublabel?: string;
}

export function RiskGauge({ score, size = 160, label, sublabel }: RiskGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const getColor = (s: number) => {
    if (s <= 20) return "hsl(145, 65%, 45%)";
    if (s <= 50) return "hsl(38, 92%, 55%)";
    return "hsl(0, 72%, 55%)";
  };

  const getLabel = (s: number) => {
    if (s <= 20) return "Low Risk";
    if (s <= 50) return "Medium Risk";
    return "High Risk";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(220, 15%, 18%)"
            strokeWidth={8}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      {(label || sublabel) && (
        <div className="text-center mt-3">
          <p className="text-sm font-medium" style={{ color: getColor(score) }}>
            {label || getLabel(score)}
          </p>
          {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}
