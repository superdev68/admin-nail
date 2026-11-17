import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Scissors,
  Trash2,
  User,
  Users,
  XCircle,
  X,
  FileText,
} from "lucide-react";
import { errorMessage, PageResponse } from "../api/client";
import {
  Appointment,
  appointmentsApi,
  AppointmentStatus,
} from "../api/endpoints";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import { AppointmentStatusBadge, Avatar, PageHeader } from "../components/UI";
import { useDebounce } from "../hooks/useDebounce";
import { useOptions } from "../hooks/useOptions";
import {
  addDays,
  formatDateTime,
  formatViDate,
  formatVnd,
  toIsoDate,
} from "../utils/format";

const STATUS_TABS: { label: string; value: string; countColor?: string }[] = [
  { label: "Tất cả", value: "" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đã xác nhận", value: "confirmed" },
  { label: "Hoàn thành", value: "completed" },
  { label: "Đã hủy", value: "cancelled" },
];

export default function AppointmentsPage() {
  const { options } = useOptions();

  const [data, setData] = useState<PageResponse<Appointment> | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 300);
  const [status, setStatus] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");
  const [technicianId, setTechnicianId] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Pagination & Sorting
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("id,desc");

  // Selection / Modal state
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [deletingApt, setDeletingApt] = useState<Appointment | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const locationOptions = useMemo(
    () => options.locations.map((l) => ({ value: String(l.id), label: l.name })),
    [options.locations]
  );

  const technicianOptions = useMemo(
    () => options.technicians.map((t) => ({ value: String(t.id), label: t.name })),
    [options.technicians]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentsApi.list({
        q: dq || undefined,
        status: status || undefined,
        locationId: locationId ? Number(locationId) : undefined,
        technicianId: technicianId ? Number(technicianId) : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        size,
        sort,
      });
      setData(res);
      if (res.totalPages > 0 && page >= res.totalPages) {
        setPage(res.totalPages - 1);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dq, status, locationId, technicianId, fromDate, toDate, page, size, sort]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [dq, status, locationId, technicianId, fromDate, toDate]);

  const handleUpdateStatus = async (id: number, nextStatus: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      const updated = await appointmentsApi.updateStatus(id, nextStatus);
      toast.success(
        `Đã chuyển trạng thái sang "${
          nextStatus === "confirmed"
            ? "Đã xác nhận"
            : nextStatus === "completed"
            ? "Hoàn thành"
            : nextStatus === "cancelled"
            ? "Đã hủy"
            : "Chờ xác nhận"
        }"`
      );
      // Update in local data
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) => (item.id === id ? updated : item)),
            }
          : prev
      );
      if (selectedApt?.id === id) {
        setSelectedApt(updated);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingApt) return;
    try {
      await appointmentsApi.remove(deletingApt.id);
      toast.success(`Đã xóa lịch hẹn #${deletingApt.bookingCode}`);
      setDeletingApt(null);
      if (selectedApt?.id === deletingApt.id) setSelectedApt(null);
      loadData();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  // Quick date pickers
  const setQuickDate = (type: "today" | "tomorrow" | "next7" | "all") => {
    const today = new Date();
    if (type === "today") {
      const iso = toIsoDate(today);
      setFromDate(iso);
      setToDate(iso);
    } else if (type === "tomorrow") {
      const iso = toIsoDate(addDays(today, 1));
      setFromDate(iso);
      setToDate(iso);
    } else if (type === "next7") {
      setFromDate(toIsoDate(today));
      setToDate(toIsoDate(addDays(today, 7)));
    } else {
      setFromDate("");
      setToDate("");
    }
  };

  const hasActiveFilters = Boolean(
    q || status || locationId || technicianId || fromDate || toDate
  );

  const resetFilters = () => {
    setQ("");
    setStatus("");
    setLocationId("");
    setTechnicianId("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div>
      <PageHeader
        title="Lịch hẹn"
        subtitle="Quản lý và tiếp nhận các yêu cầu đặt lịch hẹn của khách hàng"
        icon={<CalendarCheck size={22} />}
        actions={
          <button
            onClick={() => loadData()}
            className="btn-ghost flex items-center gap-1.5"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Làm mới</span>
          </button>
        }
      />

      {/* Status Tabs */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-line pb-3">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-brand text-white shadow"
                  : "bg-white text-muted hover:bg-brand-soft hover:text-brand"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Card */}
      <div className="card mb-6 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Tìm theo mã đặt lịch, tên khách, số ĐT..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border border-line bg-white py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Location filter */}
          <div>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            >
              <option value="">Tất cả chi nhánh</option>
              {locationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Technician filter */}
          <div>
            <select
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            >
              <option value="">Tất cả thợ (KTV)</option>
              {technicianOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort filter */}
          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
            >
              <option value="id,desc">ID (Mới nhất)</option>
              <option value="id,asc">ID (Cũ nhất)</option>
              <option value="appointmentDate,desc">Ngày hẹn (Mới nhất)</option>
              <option value="appointmentDate,asc">Ngày hẹn (Cũ nhất)</option>
              <option value="createdAt,desc">Thời gian đặt (Mới nhất)</option>
              <option value="createdAt,asc">Thời gian đặt (Cũ nhất)</option>
            </select>
          </div>

          {/* Quick date presets */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setQuickDate("today")}
              className="rounded-lg border border-line bg-white px-2.5 py-2 text-xs font-medium text-ink hover:bg-brand-soft hover:text-brand"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setQuickDate("tomorrow")}
              className="rounded-lg border border-line bg-white px-2.5 py-2 text-xs font-medium text-ink hover:bg-brand-soft hover:text-brand"
            >
              Ngày mai
            </button>
            <button
              onClick={() => setQuickDate("next7")}
              className="rounded-lg border border-line bg-white px-2.5 py-2 text-xs font-medium text-ink hover:bg-brand-soft hover:text-brand"
            >
              7 ngày tới
            </button>
          </div>
        </div>

        {/* Date range row & PageSize */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3 text-xs text-muted">
          <div className="flex flex-wrap items-center gap-2">
            <span>Khoảng ngày:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-line bg-white px-2 py-1 text-xs text-ink focus:border-brand focus:outline-none"
            />
            <span>đến</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-line bg-white px-2 py-1 text-xs text-ink focus:border-brand focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Hiển thị:</span>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                className="rounded-lg border border-line bg-white px-2 py-1 text-xs text-ink focus:border-brand focus:outline-none"
              >
                {[10, 20, 50, 100].map((s) => (
                  <option key={s} value={s}>
                    {s} / trang
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 font-medium text-brand hover:underline"
              >
                <X size={13} /> Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-canvas/60 text-xs font-semibold text-muted">
              <tr>
                <th className="w-16 py-3.5 pl-6 pr-2">ID</th>
                <th className="px-3 py-3.5">Mã đặt lịch</th>
                <th className="px-3 py-3.5">Khách hàng</th>
                <th className="px-3 py-3.5">Chi nhánh & Dịch vụ</th>
                <th className="px-3 py-3.5">Kỹ thuật viên</th>
                <th className="px-3 py-3.5">Thời gian hẹn</th>
                <th className="px-3 py-3.5">Trạng thái</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading && (!data || data.items.length === 0) ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                      <span>Đang tải danh sách lịch hẹn...</span>
                    </div>
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarCheck size={32} className="text-muted/50" />
                      <span className="font-medium">Không tìm thấy lịch hẹn nào</span>
                      {hasActiveFilters && (
                        <button
                          onClick={resetFilters}
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          Xóa bộ lọc để xem tất cả
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((row) => {
                  const isUpdating = updatingId === row.id;
                  return (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-brand-soft/20"
                    >
                      {/* ID */}
                      <td className="w-16 py-3 pl-6 pr-2">
                        <span className="font-mono text-xs font-semibold text-muted">
                          #{row.id}
                        </span>
                      </td>

                      {/* Booking Code */}
                      <td className="px-3 py-3 font-medium">
                        <button
                          onClick={() => setSelectedApt(row)}
                          className="group inline-flex items-center gap-1 font-mono text-xs font-semibold text-brand hover:underline"
                        >
                          <span>#{row.bookingCode}</span>
                        </button>
                        <div className="text-[11px] text-muted">
                          {formatDateTime(row.createdAt)}
                        </div>
                      </td>

                      {/* Customer info */}
                      <td className="px-3 py-3">
                        <div className="font-semibold text-ink">
                          {row.customerName || "Khách vãng lai"}
                        </div>
                        {row.customerPhone && (
                          <a
                            href={`tel:${row.customerPhone}`}
                            className="flex items-center gap-1 font-mono text-xs text-brand hover:underline"
                          >
                            <Phone size={11} /> {row.customerPhone}
                          </a>
                        )}
                        {row.guestCount > 1 && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                            <Users size={11} /> {row.guestCount} khách
                          </span>
                        )}
                      </td>

                      {/* Location & Service */}
                      <td className="max-w-[220px] px-3 py-3">
                        <div className="flex items-center gap-1 text-xs text-ink">
                          <MapPin size={12} className="shrink-0 text-muted" />
                          <span className="truncate">
                            {row.locationName || "Chưa xác định"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted">
                          <Scissors size={12} className="shrink-0 text-brand" />
                          <span className="truncate font-medium text-brand">
                            {row.serviceNames || row.serviceName || "Dịch vụ"}
                          </span>
                        </div>
                        {row.price !== null && row.price > 0 && (
                          <div className="text-xs font-semibold text-ink">
                            {formatVnd(row.price)}
                          </div>
                        )}
                      </td>

                      {/* Technician */}
                      <td className="px-3 py-3">
                        {row.technicianName ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={row.technicianName} size={28} />
                            <span className="font-medium text-ink">
                              {row.technicianName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs italic text-muted">
                            Chưa gán thợ
                          </span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="px-3 py-3">
                        <div className="font-semibold text-ink">
                          {row.appointmentDate
                            ? formatViDate(row.appointmentDate)
                            : "—"}
                        </div>
                        <div className="flex items-center gap-1 font-mono text-xs text-brand-deep">
                          <Clock size={11} />
                          <span>
                            {row.startTime} – {row.endTime}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <AppointmentStatusBadge status={row.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 pl-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Confirm */}
                          {row.status === "pending" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(row.id, "confirmed")
                              }
                              disabled={isUpdating}
                              title="Xác nhận lịch hẹn"
                              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}

                          {/* Quick Complete */}
                          {row.status === "confirmed" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(row.id, "completed")
                              }
                              disabled={isUpdating}
                              title="Hoàn thành lịch hẹn"
                              className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}

                          {/* Quick Cancel */}
                          {row.status !== "cancelled" &&
                            row.status !== "completed" && (
                              <button
                                onClick={() =>
                                  handleUpdateStatus(row.id, "cancelled")
                                }
                                disabled={isUpdating}
                                title="Hủy lịch hẹn"
                                className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50"
                              >
                                <XCircle size={16} />
                              </button>
                            )}

                          {/* View Detail */}
                          <button
                            onClick={() => setSelectedApt(row)}
                            title="Xem chi tiết"
                            className="btn-icon"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingApt(row)}
                            title="Xóa lịch hẹn"
                            className="btn-icon text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalItems > 0 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalItems={data.totalItems}
            size={size}
            onPage={setPage}
            onSize={(s) => {
              setSize(s);
              setPage(0);
            }}
          />
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedApt && (
        <Modal
          open={Boolean(selectedApt)}
          title={
            <div className="flex items-center gap-2">
              <span>Chi tiết lịch hẹn</span>
              <span className="font-mono text-sm text-muted">
                #{selectedApt.id}
              </span>
              <span className="rounded-md bg-brand-soft px-2 py-0.5 font-mono text-xs font-semibold text-brand">
                {selectedApt.bookingCode}
              </span>
            </div>
          }
          subtitle={`Đặt vào ${formatDateTime(selectedApt.createdAt)}`}
          onClose={() => setSelectedApt(null)}
          width="lg"
          footer={
            <div className="flex w-full items-center justify-between">
              <button
                className="btn-danger flex items-center gap-1.5 text-xs"
                onClick={() => {
                  setDeletingApt(selectedApt);
                }}
              >
                <Trash2 size={14} /> Xóa lịch
              </button>
              <div className="flex gap-2">
                <button
                  className="btn-ghost"
                  onClick={() => setSelectedApt(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas p-4">
              <div>
                <span className="text-xs text-muted">Trạng thái hiện tại:</span>
                <div className="mt-1">
                  <AppointmentStatusBadge status={selectedApt.status} />
                </div>
              </div>

              {/* Status transition buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted">Chuyển trạng thái:</span>
                {selectedApt.status !== "pending" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedApt.id, "pending")
                    }
                    className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                  >
                    Chờ xác nhận
                  </button>
                )}
                {selectedApt.status !== "confirmed" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedApt.id, "confirmed")
                    }
                    className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand-soft"
                  >
                    Xác nhận
                  </button>
                )}
                {selectedApt.status !== "completed" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedApt.id, "completed")
                    }
                    className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    Hoàn thành
                  </button>
                )}
                {selectedApt.status !== "cancelled" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedApt.id, "cancelled")
                    }
                    className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Hủy lịch
                  </button>
                )}
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Customer Box */}
              <div className="rounded-2xl border border-line p-4">
                <div className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-brand-deep">
                  <User size={16} /> Thông tin khách hàng
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-muted">Họ và tên:</span>
                    <div className="font-semibold text-ink">
                      {selectedApt.customerName || "Khách vãng lai"}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Số điện thoại:</span>
                    <div>
                      {selectedApt.customerPhone ? (
                        <a
                          href={`tel:${selectedApt.customerPhone}`}
                          className="flex items-center gap-1 font-mono font-medium text-brand hover:underline"
                        >
                          <Phone size={13} /> {selectedApt.customerPhone}
                        </a>
                      ) : (
                        <span className="text-muted">Chưa cung cấp</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Email:</span>
                    <div className="flex items-center gap-1 text-ink">
                      <Mail size={13} className="text-muted" />
                      <span>{selectedApt.customerEmail || "—"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Số lượng khách:</span>
                    <div className="font-medium text-ink">
                      {selectedApt.guestCount || 1} khách
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Schedule Box */}
              <div className="rounded-2xl border border-line p-4">
                <div className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-brand-deep">
                  <Clock size={16} /> Thời gian & Kỹ thuật viên
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-muted">Ngày hẹn:</span>
                    <div className="font-semibold text-ink">
                      {selectedApt.appointmentDate
                        ? formatViDate(selectedApt.appointmentDate)
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Khung giờ:</span>
                    <div className="font-mono font-semibold text-brand">
                      {selectedApt.startTime} – {selectedApt.endTime}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Chi nhánh:</span>
                    <div className="flex items-center gap-1 font-medium text-ink">
                      <MapPin size={13} className="text-muted" />
                      <span>{selectedApt.locationName || "—"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Thợ (KTV) phục vụ:</span>
                    <div className="flex items-center gap-2">
                      {selectedApt.technicianName ? (
                        <>
                          <Avatar name={selectedApt.technicianName} size={24} />
                          <span className="font-semibold text-ink">
                            {selectedApt.technicianName}
                          </span>
                        </>
                      ) : (
                        <span className="italic text-muted">Chưa chỉ định thợ</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service & Price Box */}
            <div className="rounded-2xl border border-line p-4">
              <div className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-brand-deep">
                <Scissors size={16} /> Dịch vụ yêu cầu
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-ink">
                    {selectedApt.serviceNames || selectedApt.serviceName || "Dịch vụ"}
                  </div>
                  <div className="text-xs text-muted">
                    ID dịch vụ: {selectedApt.serviceId ?? "Tùy chọn nhiều dịch vụ"}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted">Tổng tiền tạm tính:</span>
                  <div className="font-display text-lg font-bold text-brand">
                    {formatVnd(selectedApt.price)}
                  </div>
                </div>
              </div>
            </div>

            {/* Note Box */}
            <div className="rounded-2xl border border-line p-4">
              <div className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-brand-deep">
                <FileText size={16} /> Ghi chú từ khách hàng
              </div>
              <p className="whitespace-pre-wrap rounded-xl bg-canvas p-3 text-sm text-ink">
                {selectedApt.note?.trim() || "Không có ghi chú nào"}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Dialog */}
      {deletingApt && (
        <ConfirmDialog
          open={Boolean(deletingApt)}
          title="Xóa lịch hẹn"
          message={
            <span>
              Bạn có chắc chắn muốn xóa lịch hẹn{" "}
              <b>#{deletingApt.bookingCode}</b> của khách hàng{" "}
              <b>{deletingApt.customerName || "vãng lai"}</b>? Thao tác này không
              thể hoàn tác.
            </span>
          }
          onConfirm={handleDelete}
          onClose={() => setDeletingApt(null)}
        />
      )}
    </div>
  );
}
