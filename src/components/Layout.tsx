import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { CalendarDays, LayoutDashboard, LogOut, MapPin, Menu, Scissors, Shapes, Users, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export const NAV = [
  { to: "/", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/locations", label: "Chi nhánh", icon: MapPin },
  { to: "/service-categories", label: "Nhóm dịch vụ", icon: Shapes },
  { to: "/services", label: "Dịch vụ", icon: Scissors },
  { to: "/technicians", label: "Thợ (KTV)", icon: Users },
  { to: "/schedules", label: "Lịch làm việc", icon: CalendarDays },
];

const LOGO = "https://salonhero-wasabi.becdn.net/Others/559/559-80fa0j3n05s0-300x300.png";

export default function Layout() {
  const { username, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const current = NAV.find((n) => (n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)));

  const sidebar = (
    <div className="flex h-full flex-col bg-gradient-to-b from-brand-deep to-[#3d2109] text-white">
      <div className="flex items-center gap-3 px-5 py-6">
        <img src={LOGO} alt="Nail Room" className="h-11 w-11 rounded-full bg-white object-cover p-0.5" />
        <div>
          <div className="font-display text-lg font-semibold leading-tight">Nail Room</div>
          <div className="text-xs text-white/60">Mit’s House · Admin</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-white text-brand-deep shadow" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-white/10 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tan font-semibold uppercase">
            {username?.[0] || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{username}</div>
            <div className="text-xs text-white/60">Quản trị viên</div>
          </div>
          <button onClick={logout} title="Đăng xuất" className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">{sidebar}</div>
          <button className="absolute left-[268px] top-4 rounded-full bg-white p-2" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex min-h-full flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
          <button className="btn-icon" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="font-display text-lg font-semibold text-brand-deep">{current?.label || "Nail Room"}</span>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
