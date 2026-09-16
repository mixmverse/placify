// src/components/ui/Badge.tsx
export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "danger" | "info" }) {
  const colors = {
    default: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
}
