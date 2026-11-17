import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number; // 0-based
  totalPages: number;
  totalItems: number;
  size: number;
  onPage: (p: number) => void;
  onSize: (s: number) => void;
}

export default function Pagination({ page, totalPages, totalItems, size, onPage, onSize }: Props) {
  const from = totalItems === 0 ? 0 : page * size + 1;
  const to = Math.min(totalItems, (page + 1) * size);

  const pages: (number | "…")[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-muted sm:flex-row">
      <div className="flex items-center gap-2">
        <span>
          Hiển thị <b className="text-ink">{from}</b>–<b className="text-ink">{to}</b> / {totalItems}
        </span>
        <select
          className="rounded-lg border border-line bg-white px-2 py-1 text-sm"
          value={size}
          onChange={(e) => onSize(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((s) => (
            <option key={s} value={s}>
              {s} / trang
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button className="btn-icon" disabled={page <= 0} onClick={() => onPage(page - 1)}>
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={"e" + i} className="px-1">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`h-8 min-w-8 rounded-full px-2 text-sm font-semibold transition ${
                p === page ? "bg-brand text-white" : "text-ink hover:bg-brand-soft"
              }`}
            >
              {p + 1}
            </button>
          )
        )}
        <button className="btn-icon" disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
