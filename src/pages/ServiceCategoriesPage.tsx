import { useMemo } from "react";
import { Scissors, Shapes } from "lucide-react";
import { categoriesApi, ServiceCategory } from "../api/endpoints";
import CrudPage, { ColumnDef, FieldDef } from "../components/CrudPage";
import { refreshOptions } from "../hooks/useOptions";
import { formatDateTime } from "../utils/format";

export default function ServiceCategoriesPage() {
  const columns: ColumnDef<ServiceCategory>[] = useMemo(
    () => [
      {
        key: "sortOrder",
        label: "Thứ tự",
        sortKey: "sortOrder",
        className: "w-20 text-center",
        render: (r) => (
          <span className="inline-block rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand">
            {r.sortOrder}
          </span>
        ),
      },
      {
        key: "name",
        label: "Tên nhóm dịch vụ",
        sortKey: "name",
        render: (r) => (
          <div>
            <div className="font-semibold text-ink">{r.name}</div>
            <span className="font-mono text-xs text-muted">ID: #{r.id}</span>
          </div>
        ),
      },
      {
        key: "serviceCount",
        label: "Dịch vụ trực thuộc",
        className: "w-36 text-center",
        render: (r) => (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
            <Scissors size={13} className="text-muted" /> {r.serviceCount} dịch vụ
          </span>
        ),
      },
      {
        key: "modifiedAt",
        label: "Cập nhật lần cuối",
        className: "w-44 text-xs text-muted hidden sm:table-cell",
        render: (r) => formatDateTime(r.modifiedAt),
      },
    ],
    []
  );

  const fields: FieldDef[] = useMemo(
    () => [
      {
        name: "name",
        label: "Tên nhóm dịch vụ",
        placeholder: "VD: Nail Services, Eyelashes, Wax...",
        required: true,
        full: true,
      },
      {
        name: "sortOrder",
        label: "Thứ tự hiển thị (nhỏ đứng trước)",
        type: "number",
        placeholder: "0",
        min: 0,
        required: true,
      },
    ],
    []
  );

  return (
    <CrudPage<ServiceCategory>
      title="Nhóm dịch vụ"
      subtitle="Phân loại dịch vụ chính (Nail, Mi, Wax...)"
      icon={<Shapes size={22} />}
      entityName="nhóm dịch vụ"
      api={categoriesApi}
      columns={columns}
      fields={fields}
      emptyForm={{
        name: "",
        sortOrder: 0,
      }}
      toForm={(r) => ({
        name: r.name,
        sortOrder: r.sortOrder ?? 0,
      })}
      rowTitle={(r) => r.name}
      onChanged={refreshOptions}
      defaultSort="sortOrder,asc"
      searchPlaceholder="Tìm theo tên nhóm..."
    />
  );
}
