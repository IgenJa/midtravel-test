import { cn } from "@/lib/utils";

interface GoldRuleProps {
  className?: string;
  light?: boolean;
}

export function GoldRule({ className, light = false }: GoldRuleProps) {
  return (
    <div
      className={cn("gold-rule", light && "gold-rule-light", className)}
      aria-hidden
    >
      <span className="gold-rule-line" />
      <span className="gold-rule-gem" />
      <span className="gold-rule-line" />
    </div>
  );
}
