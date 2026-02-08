import { Link, useLocation } from "react-router-dom";
import { Shield, LayoutDashboard, Search, AlertTriangle, Zap, Code, Sun, Moon, Globe } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/browser", icon: Globe, label: "Secure Browser" },
  { path: "/scanner", icon: Search, label: "URL Scanner" },
  { path: "/threats", icon: AlertTriangle, label: "Threat Log" },
  { path: "/mediator", icon: Zap, label: "Action Mediator" },
  { path: "/dom-analyzer", icon: Code, label: "DOM Analyzer" },
];

export function AppSidebar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center glow-cyan">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-wide">AgentShield</h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Secure Browser</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground glow-cyan"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          {isDark ? "Light Mode" : "Dark Mode"}
        </button>
        <p className="text-[10px] font-mono text-muted-foreground/50 mt-3">v2.0.0 • HACK IITK 2026</p>
      </div>
    </aside>
  );
}
