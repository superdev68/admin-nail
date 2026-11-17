import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, CalendarDays, MapPin, Scissors, Shapes, Users } from "lucide-react";
import toast from "react-hot-toast";
import { errorMessage } from "../api/client";
import { DashboardStats, metaApi } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const { username } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    metaApi.dashboard().then(setStats).catch((e) => toast.error(errorMessage(e)));
  }, []);

  const cards = [
    {
      to: "/appointments",
      label: "Lịch hẹn hôm nay",
      value: stats?.appointmentsToday ?? stats?.appointments,
      icon: CalendarCheck,
      hint: stats?.appointments !== undefined ? `${stats.appointments} tổng đơn` : "Đơn đặt chỗ",
    },
    { to: "/locations", label: "Chi nhánh", value: stats?.locations, icon: MapPin, hint: "Hà Nội & TP HCM" },
    { to: "/service-categories", label: "Nhóm dịch vụ", value: stats?.serviceCategories, icon: Shapes, hint: "Nail, Mi, Wax..." },
    { to: "/services", label: "Dịch vụ", value: stats?.services, icon: Scissors, hint: "Bảng giá & thời lượng" },
    {
      to: "/technicians",
      label: "Thợ / KTV",
      value: stats?.technicians,
      icon: Users,
      hint: stats ? `${stats.activeTechnicians} đang làm việc` : "",
    },
    { to: "/schedules", label: "Ca làm hôm nay", value: stats?.schedulesToday, icon: CalendarDays, hint: "Lịch làm việc thợ" },
  ];

  const hour = new Date().getHours();
  const greet = hour < 11 ? "Chào buổi sáng" : hour < 14 ? "Chào buổi trưa" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-deep p-8 text-white shadow-card">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/5" />
        <p className="text-sm text-white/70">{greet},</p>
        <h1 className="font-display text-3xl font-semibold">{username} 💅</h1>
        <p className="mt-2 max-w-lg text-sm text-white/80">
          Quản lý chi nhánh, dịch vụ, đội ngũ thợ và lịch làm việc của Nail Room – Mit’s House. Dữ liệu được dùng cho
          trang đặt lịch book.nailroom.vn.
        </p>
        <a
          href="https://book.nailroom.vn"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-deep hover:bg-brand-soft"
        >
          Xem trang đặt lịch <ArrowRight size={15} />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ to, label, value, icon: Icon, hint }) => (
          <Link key={to} to={to} className="card group p-5 transition hover:-translate-y-0.5 hover:border-brand-line">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon size={20} />
              </div>
              <ArrowRight size={16} className="text-muted opacity-0 transition group-hover:opacity-100" />
            </div>
            <div className="mt-4 font-display text-3xl font-semibold text-brand-deep">
              {value ?? <span className="inline-block h-8 w-12 animate-pulse rounded bg-brand-soft" />}
            </div>
            <div className="text-sm font-semibold text-ink">{label}</div>
            <div className="text-xs text-muted">{hint}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
