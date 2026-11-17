import { useMemo } from "react";
import { MapPin, Phone, Users } from "lucide-react";
import { Technician, techniciansApi } from "../api/endpoints";
import CrudPage, { ColumnDef, FieldDef } from "../components/CrudPage";
import { Avatar, Badge, TECH_STATUS } from "../components/UI";
import { useOptions } from "../hooks/useOptions";
import { formatDateTime } from "../utils/format";

const STATUS_OPTIONS = [
  { value: "active", label: "Đang làm việc" },
  { value: "busy", label: "Đang bận" },
  { value: "off", label: "Nghỉ việc / Nghỉ phép" },
];

export default function TechniciansPage() {
  const { options, reload } = useOptions();

  const locationOptions = useMemo(
    () => options.locations.map((l) => ({ value: l.id, label: `${l.name} (${l.extra || ""})` })),
    [options.locations]
  );

  const columns: ColumnDef<Technician>[] = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        sortKey: "id",
        className: "w-16",
        render: (r) => <span className="font-mono text-xs text-muted">#{r.id}</span>,
      },
      {
        key: "fullName",
        label: "Kỹ thuật viên",
        sortKey: "fullName",
        render: (r) => (
          <div className="flex items-center gap-3">
            <Avatar name={r.fullName} url={r.avatarUrl} size={38} />
            <div>
              <div className="font-semibold text-ink">{r.fullName}</div>
              {r.phone ? (
                <a
                  href={`tel:${r.phone}`}
                  className="flex items-center gap-1 font-mono text-xs text-brand hover:underline"
                >
                  <Phone size={11} />
                  <span>{r.phone}</span>
                </a>
              ) : (
                <span className="text-xs text-muted">Chưa có SĐT</span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "location",
        label: "Chi nhánh làm việc",
        className: "w-56",
        render: (r) => (
          <div className="flex items-center gap-1.5 text-xs text-ink font-medium">
            <MapPin size={13} className="text-brand shrink-0" />
            <span className="truncate">{r.locationName || "Chưa phân bổ"}</span>
          </div>
        ),
      },
      {
        key: "status",
        label: "Trạng thái",
        sortKey: "status",
        className: "w-36",
        render: (r) => {
          const s = TECH_STATUS[r.status] || { label: r.status, tone: "gray" };
          return <Badge tone={s.tone}>{s.label}</Badge>;
        },
      },
      {
        key: "modifiedAt",
        label: "Cập nhật",
        className: "w-36 text-xs text-muted hidden md:table-cell",
        render: (r) => formatDateTime(r.modifiedAt),
      },
    ],
    []
  );

  const fields: FieldDef[] = useMemo(
    () => [
      {
        name: "fullName",
        label: "Họ và tên thợ",
        placeholder: "VD: Nguyễn Thị Lan, Ánh Nail...",
        required: true,
      },
      {
        name: "locationId",
        label: "Cơ sở / Chi nhánh làm việc",
        type: "select",
        options: locationOptions,
        placeholder: "— Chọn chi nhánh —",
        required: true,
      },
      {
        name: "phone",
        label: "Số điện thoại liên hệ",
        type: "tel",
        placeholder: "0987...",
      },
      {
        name: "status",
        label: "Trạng thái làm việc",
        type: "select",
        options: STATUS_OPTIONS,
        required: true,
      },
      {
        name: "avatarUrl",
        label: "Link ảnh đại diện (URL)",
        type: "url",
        placeholder: "https://...jpg",
        full: true,
        help: "Dán link ảnh vuông hiển thị trên form đặt lịch khách hàng",
      },
    ],
    [locationOptions]
  );

  return (
    <CrudPage<Technician>
      title="Đội ngũ kỹ thuật viên"
      subtitle="Quản lý thông tin thợ, chi nhánh công tác và trạng thái sẵn sàng"
      icon={<Users size={22} />}
      entityName="thợ"
      api={techniciansApi}
      columns={columns}
      fields={fields}
      filters={[
        {
          name: "locationId",
          label: "Tất cả chi nhánh",
          options: locationOptions,
        },
        {
          name: "status",
          label: "Tất cả trạng thái",
          options: STATUS_OPTIONS,
        },
      ]}
      emptyForm={{
        locationId: locationOptions[0]?.value ?? "",
        fullName: "",
        phone: "",
        status: "active",
        avatarUrl: "",
      }}
      toForm={(r) => ({
        locationId: r.locationId ?? "",
        fullName: r.fullName,
        phone: r.phone ?? "",
        status: r.status,
        avatarUrl: r.avatarUrl ?? "",
      })}
      toPayload={(f) => ({
        ...f,
        locationId: Number(f.locationId),
        phone: f.phone ? String(f.phone).trim() : null,
        avatarUrl: f.avatarUrl ? String(f.avatarUrl).trim() : null,
      })}
      rowTitle={(r) => r.fullName}
      onChanged={reload}
      defaultSort="id,asc"
      searchPlaceholder="Tìm theo tên thợ, số điện thoại..."
    />
  );
}
