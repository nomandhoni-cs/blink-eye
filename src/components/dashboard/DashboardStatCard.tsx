import { cn } from "@/lib/utils";
import { dashboardBlockClassName } from "./dashboardBlock";

export function DashboardStatCard({
  icon,
  label,
  value,
  detail,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  detail?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col px-4 py-4",
        dashboardBlockClassName,
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-heading font-semibold tracking-tight">
        {value}
      </div>
      {detail ? (
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}
