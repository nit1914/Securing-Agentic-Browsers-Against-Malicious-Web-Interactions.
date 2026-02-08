import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  iconColor?: string;
  delay?: number;
}

export function StatCard({ icon: Icon, value, label, iconColor = "text-primary", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card-gradient border border-border rounded-xl p-5 relative overflow-hidden"
    >
      <div className="absolute inset-0 cyber-gradient opacity-50" />
      <div className="relative flex items-start gap-4">
        <div className={cn("mt-0.5", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
