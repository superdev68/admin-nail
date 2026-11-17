import { useMemo } from "react";
import { Clock, Scissors, Tag } from "lucide-react";
import { NailService, servicesApi } from "../api/endpoints";
import CrudPage, { ColumnDef, FieldDef } from "../components/CrudPage";
import { ActiveBadge } from "../components/UI";
import { useOptions } from "../hooks/useOptions";
import { formatDuration, formatVnd } from "../utils/format";

export default function ServicesPage() {
  const { options } = useOptions();

  const categoryOptions = useMemo(
    () => options.categories.map((c) => ({ value: c.id, label: c.name })),
    [options.categories]
  );

  const columns: ColumnDef<NailService>[] = useMemo(
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
        label: "Dịch vụ",
        sortKey: "name",
        render: (r) => (
          <div>
            <div className="font-semibold text-ink">{r.name}</div>
            {r.description && (
              <p className="line-clamp-1 max-w-md text-xs text-muted">{r.description}</p>
            )}
          </div>
        ),
      },
      {
        key: "category",
        label: "Nhóm dịch vụ",
        className: "w-40",
        render: (r) => (
          <span className="inline-flex items-center gap-1 rounded-md bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
            <Tag size={11} /> {r.categoryName || "—"}
          </span>
        ),
      },
      {
        key: "durationMinutes",
        label: "Thời gian",
        sortKey: "durationMinutes",
        className: "w-28",
        render: (r) => (
          <span className="inline-flex items-center gap-1 text-xs text-ink font-medium">
            <Clock size={12} className="text-muted" /> {formatDuration(r.durationMinutes)}
          </span>
        ),
      },
      {
        key: "price",
        label: "Giá khởi điểm",
        sortKey: "price",
        className: "w-36 text-right",
        render: (r) => (
          <span className="font-mono text-sm font-bold text-brand">
            {formatVnd(r.price)}
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
    ],
    []
  );

  const fields: FieldDef[] = useMemo(
    () => [
      {
        name: "categoryId",
        label: "Thuộc nhóm dịch vụ",
        type: "select",
        options: categoryOptions,
        placeholder: "— Chọn nhóm —",
        required: true,
      },
      {
        name: "name",
        label: "Tên dịch vụ",
        placeholder: "VD: Chăm sóc móng (Nail care), Nối mi...",
        required: true,
      },
      {
        name: "price",
        label: "Giá dịch vụ (VND)",
        type: "money",
        placeholder: "0",
        required: true,
      },
      {
        name: "durationMinutes",
        label: "Thời gian thực hiện (phút)",
        type: "number",
        placeholder: "60",
        min: 1,
        required: true,
      },
      {
        name: "description",
        label: "Mô tả / Lưu ý cho khách",
        type: "textarea",
        placeholder: "Chi tiết dịch vụ, quy trình, loại thuốc/sơn sử dụng...",
        full: true,
      },
      {
        name: "isActive",
        label: "Trạng thái",
        type: "switch",
        placeholder: "Đang mở phục vụ khách",
      },
    ],
    [categoryOptions]
  );

  return (
    <CrudPage<NailService>
      title="Dịch vụ & Bảng giá"
      subtitle="Quản lý chi tiết các gói làm móng, mi, wax và thời lượng phục vụ"
      icon={<Scissors size={22} />}
      entityName="dịch vụ"
      api={servicesApi}
      columns={columns}
      fields={fields}
      filters={[
        {
          name: "categoryId",
          label: "Tất cả nhóm dịch vụ",
          options: categoryOptions,
        },
        {
          name: "isActive",
          label: "Tất cả trạng thái",
          options: [
            { value: "true", label: "Đang phục vụ" },
            { value: "false", label: "Tạm ngưng" },
          ],
        },
      ]}
      emptyForm={{
        categoryId: categoryOptions[0]?.value ?? "",
        name: "",
        durationMinutes: 60,
        price: 0,
        description: "",
        isActive: true,
      }}
      toForm={(r) => ({
        categoryId: r.categoryId ?? "",
        name: r.name,
        durationMinutes: r.durationMinutes,
        price: r.price,
        description: r.description ?? "",
        isActive: r.isActive,
      })}
      toPayload={(f) => ({
        ...f,
        categoryId: Number(f.categoryId),
        price: Number(f.price),
        durationMinutes: Number(f.durationMinutes),
      })}
      rowTitle={(r) => r.name}
      defaultSort="id,desc"
      searchPlaceholder="Tìm dịch vụ theo tên, mô tả..."
    />
  );
}
