import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">{icon}</div>
        )}
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-deep sm:text-3xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const tones = {
  green: "bg-emerald-50 text-emerald-700",
  gray: "bg-gray-100 text-gray-600",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  brand: "bg-brand-soft text-brand",
};

export function Badge({ tone = "gray", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return active ? <Badge tone="green">● Hoạt động</Badge> : <Badge tone="gray">○ Tạm ngưng</Badge>;
}

export const TECH_STATUS: Record<string, { label: string; tone: keyof typeof tones }> = {
  active: { label: "Đang làm", tone: "green" },
  busy: { label: "Bận", tone: "amber" },
  off: { label: "Nghỉ", tone: "gray" },
};

export function Avatar({ name, url, size = 36 }: { name: string; url?: string | null; size?: number }) {
  const ini = name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  if (url)
    return (
      <img
        src={url}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-2 ring-white"
      />
    );
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-tan to-brand font-semibold text-white"
    >
      {ini}
    </div>
  );
}
