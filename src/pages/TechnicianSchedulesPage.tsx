import { FormEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Clock, Coffee, Sparkles } from "lucide-react";
import { errorMessage, fieldErrors } from "../api/client";
import { BulkScheduleRequest, schedulesApi, TechnicianSchedule } from "../api/endpoints";
import CrudPage, { ColumnDef, FieldDef } from "../components/CrudPage";
import { Field, Switch } from "../components/Form";
import Modal from "../components/Modal";
import { Badge } from "../components/UI";
import { useOptions } from "../hooks/useOptions";
import { formatViDate, toIsoDate, WEEKDAY_LABELS } from "../utils/format";

export default function TechnicianSchedulesPage() {
  const { options } = useOptions();
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkErrors, setBulkErrors] = useState<Record<string, string>>({});
  const [scheduleVersion, setScheduleVersion] = useState(0);

  const locationOptions = useMemo(
    () => options.locations.map((l) => ({ value: l.id, label: l.name })),
    [options.locations]
  );

  const technicianOptions = useMemo(
    () =>
      options.technicians.map((t) => ({
        value: t.id,
        label: t.name + (t.extra === "off" ? " (Nghỉ)" : ""),
      })),
    [options.technicians]
  );

  const todayIso = toIsoDate(new Date());

  const [bulkForm, setBulkForm] = useState<BulkScheduleRequest>({
    technicianIds: [],
    fromDate: todayIso,
    toDate: toIsoDate(new Date(Date.now() + 6 * 86400000)),
    weekdays: [1, 2, 3, 4, 5, 6, 7],
    startTime: "09:00",
    endTime: "19:30",
    isOff: false,
    overwrite: true,
  });

  const columns: ColumnDef<TechnicianSchedule>[] = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        sortKey: "id",
        className: "w-16 text-center text-muted font-mono text-xs",
        render: (r) => `#${r.id}`,
      },
      {
        key: "workDate",
        label: "Ngày làm việc",
        sortKey: "workDate",
        className: "w-44",
        render: (r) => (
          <div className="font-semibold text-ink">
            {formatViDate(r.workDate)}
          </div>
        ),
      },
      {
        key: "technician",
        label: "Thợ",
        render: (r) => (
          <div>
            <div className="font-semibold text-ink">{r.technicianName}</div>
            <div className="text-xs text-muted">{r.locationName || "Chưa có chi nhánh"}</div>
          </div>
        ),
      },
      {
        key: "shift",
        label: "Ca làm việc / Giờ",
        className: "w-48",
        render: (r) =>
          r.isOff ? (
            <Badge tone="gray">
              <Coffee size={12} className="inline mr-1" /> Nghỉ ca
            </Badge>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-soft px-2.5 py-1 font-mono text-xs font-semibold text-brand">
              <Clock size={12} /> {r.startTime} – {r.endTime}
            </span>
          ),
      },
      {
        key: "isOff",
        label: "Trạng thái",
        className: "w-32",
        render: (r) =>
          r.isOff ? (
            <Badge tone="red">Nghỉ phép</Badge>
          ) : (
            <Badge tone="green">Đi làm</Badge>
          ),
      },
    ],
    []
  );

  const fields: FieldDef[] = useMemo(
    () => [
      {
        name: "technicianId",
        label: "Kỹ thuật viên",
        type: "select",
        options: technicianOptions,
        placeholder: "— Chọn thợ —",
        required: true,
      },
      {
        name: "workDate",
        label: "Ngày làm",
        type: "date",
        required: true,
      },
      {
        name: "startTime",
        label: "Giờ bắt đầu ca",
        type: "time",
        required: true,
        hidden: (f) => !!f.isOff,
      },
      {
        name: "endTime",
        label: "Giờ kết thúc ca",
        type: "time",
        required: true,
        hidden: (f) => !!f.isOff,
      },
      {
        name: "isOff",
        label: "Đăng ký nghỉ phép",
        type: "switch",
        placeholder: "Đánh dấu ngày này thợ nghỉ (is_off = true)",
        full: true,
      },
    ],
    [technicianOptions]
  );

  const handleBulkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!bulkForm.technicianIds.length) {
      setBulkErrors({ technicianIds: "Vui lòng chọn ít nhất 1 thợ" });
      return;
    }
    setBulkSaving(true);
    setBulkErrors({});
    try {
      const res = await schedulesApi.bulk(bulkForm);
      toast.success(
        `Đã xếp lịch: ${res.created} ca mới, ${res.replaced} ca ghi đè, ${res.skipped} bỏ qua`
      );
      setBulkOpen(false);
      setScheduleVersion((v) => v + 1);
    } catch (err) {
      setBulkErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setBulkSaving(false);
    }
  };

  const toggleBulkWeekday = (isoDay: number) => {
    setBulkForm((f) => {
      const cur = f.weekdays || [];
      const next = cur.includes(isoDay)
        ? cur.filter((d) => d !== isoDay)
        : [...cur, isoDay].sort();
      return { ...f, weekdays: next };
    });
  };

  const toggleAllTechs = () => {
    setBulkForm((f) => {
      const all = options.technicians.map((t) => t.id);
      return {
        ...f,
        technicianIds: f.technicianIds.length === all.length ? [] : all,
      };
    });
  };

  return (
    <>
      <CrudPage<TechnicianSchedule>
        key={scheduleVersion}
        title="Lịch làm việc thợ"
        subtitle="Quản lý ca trực, giờ check-in/out và ngày nghỉ của từng kỹ thuật viên"
        icon={<CalendarDays size={22} />}
        entityName="lịch làm việc"
        api={schedulesApi}
        columns={columns}
        fields={fields}
        headerExtra={
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setBulkOpen(true)}
          >
            <Sparkles size={16} className="text-brand" /> Xếp lịch hàng loạt
          </button>
        }
        filters={[
          {
            name: "locationId",
            label: "Tất cả chi nhánh",
            options: locationOptions,
          },
          {
            name: "technicianId",
            label: "Tất cả thợ",
            options: technicianOptions,
          },
          {
            name: "fromDate",
            label: "Từ ngày",
            type: "date",
          },
          {
            name: "toDate",
            label: "Đến ngày",
            type: "date",
          },
          {
            name: "isOff",
            label: "Tất cả ca",
            options: [
              { value: "false", label: "Chỉ ca đi làm" },
              { value: "true", label: "Chỉ ngày nghỉ" },
            ],
          },
        ]}
        emptyForm={{
          technicianId: technicianOptions[0]?.value ?? "",
          workDate: todayIso,
          startTime: "09:00",
          endTime: "19:30",
          isOff: false,
        }}
        toForm={(r) => ({
          technicianId: r.technicianId,
          workDate: r.workDate,
          startTime: r.startTime,
          endTime: r.endTime,
          isOff: r.isOff,
        })}
        toPayload={(f) => ({
          ...f,
          technicianId: Number(f.technicianId),
          startTime: f.isOff ? "00:00" : f.startTime,
          endTime: f.isOff ? "00:00" : f.endTime,
        })}
        rowTitle={(r) => `${r.technicianName} (${r.workDate})`}
        defaultSort="workDate,desc"
        searchPlaceholder="Tìm kiếm theo tên thợ..."
      />

      {/* Modal Xếp lịch hàng loạt */}
      <Modal
        open={bulkOpen}
        width="lg"
        title="Xếp lịch làm việc hàng loạt"
        subtitle="Tạo hoặc ghi đè lịch làm việc cho nhiều thợ trong một khoảng thời gian"
        onClose={() => setBulkOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setBulkOpen(false)}
            >
              Hủy
            </button>
            <button
              type="submit"
              form="bulk-schedule-form"
              className="btn-primary"
              disabled={bulkSaving}
            >
              {bulkSaving ? "Đang xử lý..." : "Áp dụng lịch"}
            </button>
          </>
        }
      >
        <form
          id="bulk-schedule-form"
          onSubmit={handleBulkSubmit}
          className="space-y-5"
        >
          {/* Chọn thợ */}
          <Field
            label="Chọn kỹ thuật viên"
            required
            error={bulkErrors.technicianIds}
            help="Có thể chọn một hoặc nhiều thợ cùng lúc"
          >
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted">
                Đã chọn: <b>{bulkForm.technicianIds.length}</b> / {options.technicians.length} thợ
              </span>
              <button
                type="button"
                onClick={toggleAllTechs}
                className="font-semibold text-brand hover:underline"
              >
                {bulkForm.technicianIds.length === options.technicians.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </button>
            </div>
            <div className="scrollbar-thin grid max-h-44 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-line p-2 sm:grid-cols-3">
              {options.technicians.map((t) => {
                const checked = bulkForm.technicianIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs transition ${
                      checked ? "bg-brand-soft text-brand font-semibold" : "hover:bg-gray-50 text-ink"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const cur = bulkForm.technicianIds;
                        const next = checked
                          ? cur.filter((id) => id !== t.id)
                          : [...cur, t.id];
                        setBulkForm((f) => ({ ...f, technicianIds: next }));
                      }}
                      className="rounded text-brand focus:ring-brand"
                    />
                    <span className="truncate">{t.name}</span>
                  </label>
                );
              })}
            </div>
          </Field>

          {/* Khoảng thời gian */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Từ ngày" required error={bulkErrors.fromDate}>
              <input
                type="date"
                className="input"
                value={bulkForm.fromDate}
                onChange={(e) =>
                  setBulkForm((f) => ({ ...f, fromDate: e.target.value }))
                }
              />
            </Field>
            <Field label="Đến ngày" required error={bulkErrors.toDate}>
              <input
                type="date"
                className="input"
                value={bulkForm.toDate}
                onChange={(e) =>
                  setBulkForm((f) => ({ ...f, toDate: e.target.value }))
                }
              />
            </Field>
          </div>

          {/* Các thứ trong tuần */}
          <Field label="Áp dụng vào các thứ trong tuần">
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((w, idx) => {
                const iso = idx + 1;
                const active = bulkForm.weekdays.includes(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => toggleBulkWeekday(iso)}
                    className={`h-9 w-12 rounded-xl text-xs font-semibold transition ${
                      active
                        ? "bg-brand text-white shadow-sm"
                        : "border border-line bg-white text-muted hover:bg-gray-50"
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Giờ ca */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Giờ bắt đầu ca" required>
              <input
                type="time"
                className="input"
                value={bulkForm.startTime}
                onChange={(e) =>
                  setBulkForm((f) => ({ ...f, startTime: e.target.value }))
                }
              />
            </Field>
            <Field label="Giờ kết thúc ca" required>
              <input
                type="time"
                className="input"
                value={bulkForm.endTime}
                onChange={(e) =>
                  setBulkForm((f) => ({ ...f, endTime: e.target.value }))
                }
              />
            </Field>
          </div>

          {/* Tuỳ chọn */}
          <div className="space-y-3 rounded-xl border border-line bg-[#faf8f6] p-4 text-xs">
            <Switch
              checked={bulkForm.overwrite}
              onChange={(v) => setBulkForm((f) => ({ ...f, overwrite: v }))}
              label="Ghi đè ca cũ nếu ngày đó thợ đã có lịch"
            />
            <Switch
              checked={bulkForm.isOff}
              onChange={(v) => setBulkForm((f) => ({ ...f, isOff: v }))}
              label="Đặt đây là ngày nghỉ (không tính ca làm việc)"
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
