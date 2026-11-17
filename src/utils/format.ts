export const formatVnd = (v: number | string | null | undefined) =>
  v === null || v === undefined || v === "" ? "—" : Number(v).toLocaleString("vi-VN") + " ₫";

export const formatDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const normalized = iso.includes(" ") && !iso.includes("T") ? iso.replace(" ", "T") : iso;
  const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized);
  const d = new Date(hasTz ? normalized : `${normalized}+07:00`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDuration = (m: number) => {
  if (!m) return "—";
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h ? `${h}h${mm ? ` ${mm}p` : ""}` : `${mm} phút`;
};

/** yyyy-MM-dd theo giờ Việt Nam (Asia/Ho_Chi_Minh) */
export const toIsoDate = (d: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? d.getFullYear();
  const m = parts.find((p) => p.type === "month")?.value ?? String(d.getMonth() + 1).padStart(2, "0");
  const day = parts.find((p) => p.type === "day")?.value ?? String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const parseIsoDate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

/** Thứ 2 đầu tuần */
export const startOfWeek = (d: Date) => {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (c.getDay() + 6) % 7; // 0 = Thứ 2
  return addDays(c, -dow);
};

export const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]; // index 0 -> ISO 1

export const formatDayMonth = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

export const formatViDate = (s: string) => {
  const d = parseIsoDate(s);
  return `${WEEKDAY_LABELS[(d.getDay() + 6) % 7]}, ${formatDayMonth(d)}/${d.getFullYear()}`;
};

export const initials = (name: string) =>
  name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
