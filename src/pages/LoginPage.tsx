import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { errorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const LOGO = "https://salonhero-wasabi.becdn.net/Others/559/559-80fa0j3n05s0-300x300.png";

export default function LoginPage() {
  const { username, login } = useAuth();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (username) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(u, p);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-brand-soft p-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-tan/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-brand/20 blur-3xl" />
      <div className="card relative w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={LOGO} alt="Nail Room" className="mb-3 h-20 w-20 rounded-full border-4 border-brand-soft object-cover" />
          <h1 className="font-display text-2xl font-semibold text-brand-deep">Nail Room Admin</h1>
          <p className="text-sm text-muted">Đăng nhập để quản lý hệ thống đặt lịch</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-9" placeholder="Tài khoản" value={u} onChange={(e) => setU(e.target.value)} autoFocus />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9"
              type="password"
              placeholder="Mật khẩu"
              value={p}
              onChange={(e) => setP(e.target.value)}
            />
          </div>
          {err && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
          <button className="btn-primary w-full py-2.5" disabled={loading || !u || !p}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
