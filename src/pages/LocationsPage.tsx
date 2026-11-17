import { useMemo } from "react";
import { MapPin, Phone, Users } from "lucide-react";
import { Location, locationsApi } from "../api/endpoints";
import CrudPage, { ColumnDef, FieldDef } from "../components/CrudPage";
import { ActiveBadge } from "../components/UI";
import { refreshOptions } from "../hooks/useOptions";
import { formatDateTime } from "../utils/format";

const CITIES = [
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "TP Hồ Chí Minh", label: "TP Hồ Chí Minh" },
];

export default function LocationsPage() {
  const columns: ColumnDef<Location>[] = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        sortKey: "id",
        className: "w-16",
        render: (r) => <span className="font-mono text-xs text-muted">#{r.id}</span>,
      },
      {
        key: "name",
        label: "Chi nhánh",
        sortKey: "name",
        render: (r) => (
          <div>
            <div className="font-semibold text-ink">{r.name}</div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <MapPin size={12} />
              <span>{r.address}</span>
            </div>
          </div>
        ),
      },
      {
        key: "city",
        label: "Khu vực",
        sortKey: "city",
        className: "w-36",
        render: (r) => (
          <span className="inline-block rounded-md bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
            {r.city}
          </span>
        ),
      },
      {
        key: "phone",
        label: "Hotline",
        className: "w-36",
        render: (r) => (
          <a
            href={`tel:${r.phone}`}
            className="flex items-center gap-1 font-mono text-xs text-brand hover:underline"
          >
            <Phone size={12} />
            <span>{r.phone}</span>
          </a>
        ),
      },
      {
        key: "technicians",
        label: "Số thợ",
        className: "w-24 text-center",
        render: (r) => (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink">
            <Users size={12} className="text-muted" /> {r.technicianCount}
          </span>
        ),
      },
      {
        key: "isActive",
        label: "Trạng thái",
        sortKey: "isActive",
        className: "w-32",
        render: (r) => <ActiveBadge active={r.isActive} />,
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
        name: "name",
        label: "Tên chi nhánh",
        placeholder: "VD: Nailroom Quang Trung - Hà Nội",
        required: true,
        full: true,
      },
      {
        name: "city",
        label: "Thành phố / Khu vực",
        type: "select",
        options: CITIES,
        placeholder: "— Chọn thành phố —",
        required: true,
      },
      {
        name: "phone",
        label: "Số điện thoại hotline",
        placeholder: "VD: 0965695 055",
        type: "tel",
        required: true,
      },
      {
        name: "address",
        label: "Địa chỉ chi tiết",
        placeholder: "Số nhà, tên đường, phường/quận...",
        type: "textarea",
        required: true,
        full: true,
      },
      {
        name: "isActive",
        label: "Trạng thái",
        type: "switch",
        placeholder: "Đang mở cửa hoạt động",
      },
    ],
    []
  );

  return (
    <CrudPage<Location>
      title="Quản lý chi nhánh"
      subtitle="Hệ thống salon tại Hà Nội và TP Hồ Chí Minh"
      icon={<MapPin size={22} />}
      entityName="chi nhánh"
      api={locationsApi}
      columns={columns}
      fields={fields}
      filters={[
        {
          name: "city",
          label: "Tất cả khu vực",
          options: CITIES,
        },
        {
          name: "isActive",
          label: "Tất cả trạng thái",
          options: [
            { value: "true", label: "Đang hoạt động" },
            { value: "false", label: "Tạm ngưng" },
          ],
        },
      ]}
      emptyForm={{
        name: "",
        city: "Hà Nội",
        address: "",
        phone: "",
        isActive: true,
      }}
      toForm={(r) => ({
        name: r.name,
        city: r.city,
        address: r.address,
        phone: r.phone,
        isActive: r.isActive,
      })}
      rowTitle={(r) => r.name}
      onChanged={refreshOptions}
      defaultSort="id,desc"
      searchPlaceholder="Tìm theo tên chi nhánh, địa chỉ, hotline..."
    />
  );
}
