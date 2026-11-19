import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { errorMessage, fieldErrors, PageResponse } from "../api/client";
import { useDebounce } from "../hooks/useDebounce";
import ConfirmDialog from "./ConfirmDialog";
import { Field, Select, SelectOption, Switch } from "./Form";
import Modal from "./Modal";
import Pagination from "./Pagination";
import { PageHeader } from "./UI";

export type FormValues = Record<string, any>;

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "money" | "select" | "switch" | "tel" | "url" | "date" | "time";
  required?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  help?: string;
  full?: boolean; // chiếm 2 cột
  min?: number;
  step?: number;
  hidden?: (form: FormValues) => boolean;
}

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortKey?: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface FilterDef {
  name: string;
  label: string;
  type?: "select" | "date";
  options?: SelectOption[];
}

interface Api<T> {
  list: (params: Record<string, unknown>) => Promise<PageResponse<T>>;
  create: (body: any) => Promise<T>;
  update: (id: number, body: any) => Promise<T>;
  remove: (id: number) => Promise<unknown>;
}

export interface CrudPageProps<T extends { id: number }> {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  entityName: string; // "chi nhánh"
  api: Api<T>;
  columns: ColumnDef<T>[];
  fields: FieldDef[];
  filters?: FilterDef[];
  initialFilters?: Record<string, string>;
  emptyForm: FormValues;
  toForm: (row: T) => FormValues;
  toPayload?: (form: FormValues) => any;
  defaultSort?: string; // "id,desc"
  searchPlaceholder?: string;
  rowTitle: (row: T) => string;
  onChanged?: () => void;
  headerExtra?: ReactNode;
  modalWidth?: "sm" | "md" | "lg" | "xl";
}

export default function CrudPage<T extends { id: number }>(props: CrudPageProps<T>) {
  const {
    title, subtitle, icon, entityName, api, columns, fields, filters = [], initialFilters = {},
    emptyForm, toForm, toPayload = (f) => f, defaultSort = "id,desc", searchPlaceholder, rowTitle,
    onChanged, headerExtra, modalWidth = "md",
  } = props;

  const [data, setData] = useState<PageResponse<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const [filterValues, setFilterValues] = useState<Record<string, string>>(initialFilters);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState(defaultSort);
  const [reloadKey, setReloadKey] = useState(0);

  const [editing, setEditing] = useState<T | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<T | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.list({ q: dq, page, size, sort, ...filterValues });
      setData(res);
      if (res.totalPages > 0 && page >= res.totalPages) setPage(res.totalPages - 1);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq, page, size, sort, filterValues, reloadKey]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => setPage(0), [dq, filterValues, size]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (row: T) => {
    setEditing(row);
    setForm(toForm(row));
    setErrors({});
    setFormOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const clientErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.hidden?.(form)) return;
      const v = form[f.name];
      if (f.required && (v === undefined || v === null || String(v).trim() === "")) {
        clientErrors[f.name] = `Vui lòng nhập ${f.label.toLowerCase()}`;
      }
    });
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editing) {
        await api.update(editing.id, payload);
        toast.success(`Đã cập nhật ${entityName}`);
      } else {
        await api.create(payload);
        toast.success(`Đã thêm ${entityName}`);
      }
      setFormOpen(false);
      setReloadKey((k) => k + 1);
      onChanged?.();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await api.remove(deleting.id);
      toast.success(`Đã xóa ${entityName}`);
      setDeleting(null);
      setReloadKey((k) => k + 1);
      onChanged?.();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const toggleSort = (key: string) => {
    const [cur, dir] = sort.split(",");
    if (cur !== key) setSort(`${key},desc`);
    else setSort(`${key},${dir === "desc" ? "asc" : "desc"}`);
  };

  const hasFilter = useMemo(() => q || Object.values(filterValues).some(Boolean), [q, filterValues]);
  const [sortKey, sortDir] = sort.split(",");

  const set = (name: string, v: any) => {
    setForm((f) => ({ ...f, [name]: v }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        actions={
          <>
            {headerExtra}
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Thêm {entityName}
            </button>
          </>
        }
      />

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative w-full sm:w-72 lg:w-80 shrink-0">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9 pr-8"
              placeholder={searchPlaceholder || `Tìm ${entityName}...`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-muted hover:bg-canvas hover:text-ink"
                title="Xóa tìm kiếm"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) =>
              f.type === "date" ? (
                <input
                  key={f.name}
                  type="date"
                  title={f.label}
                  className="input w-auto text-xs py-2"
                  value={filterValues[f.name] || ""}
                  onChange={(e) => setFilterValues((s) => ({ ...s, [f.name]: e.target.value }))}
                />
              ) : (
                <Select
                  key={f.name}
                  className="w-auto min-w-[150px]"
                  value={filterValues[f.name]}
                  placeholder={f.label}
                  options={f.options || []}
                  onChange={(v) => setFilterValues((s) => ({ ...s, [f.name]: v }))}
                />
              )
            )}
            {hasFilter && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setQ("");
                  setFilterValues({});
                }}
              >
                <X size={14} /> Xóa lọc
              </button>
            )}
            <button type="button" className="btn-ghost px-3" title="Tải lại" onClick={() => setReloadKey((k) => k + 1)}>
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="scrollbar-thin overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-[#faf8f6]">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className={`th ${c.className || ""}`}>
                    {c.sortKey ? (
                      <button
                        className="inline-flex items-center gap-1 uppercase hover:text-brand"
                        onClick={() => toggleSort(c.sortKey!)}
                      >
                        {c.label}
                        {sortKey === c.sortKey ? (
                          sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        ) : (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </button>
                    ) : (
                      c.label
                    )}
                  </th>
                ))}
                <th className="th w-24 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading && !data
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {columns.map((c) => (
                        <td key={c.key} className="td">
                          <div className="h-4 w-3/4 animate-pulse rounded bg-brand-soft" />
                        </td>
                      ))}
                      <td className="td" />
                    </tr>
                  ))
                : data?.items.map((row) => (
                    <tr key={row.id} className={`transition hover:bg-[#fcfaf8] ${loading ? "opacity-60" : ""}`}>
                      {columns.map((c) => (
                        <td key={c.key} className={`td ${c.className || ""}`}>
                          {c.render ? c.render(row) : String((row as any)[c.key] ?? "—")}
                        </td>
                      ))}
                      <td className="td text-right">
                        <div className="inline-flex gap-1">
                          <button className="btn-icon" title="Sửa" onClick={() => openEdit(row)}>
                            <Pencil size={15} />
                          </button>
                          <button
                            className="btn-icon hover:!bg-red-50 hover:!text-red-700"
                            title="Xóa"
                            onClick={() => setDeleting(row)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {data && data.items.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted">
              <div className="text-4xl">💅</div>
              <p className="font-medium text-ink">Chưa có {entityName} nào</p>
              <p className="text-sm">{hasFilter ? "Thử thay đổi bộ lọc" : `Bấm "Thêm ${entityName}" để bắt đầu`}</p>
            </div>
          )}
        </div>

        {data && data.totalItems > 0 && (
          <Pagination
            page={data.page}
            size={size}
            totalItems={data.totalItems}
            totalPages={data.totalPages}
            onPage={setPage}
            onSize={setSize}
          />
        )}
      </div>

      {/* Form modal */}
      <Modal
        open={formOpen}
        width={modalWidth}
        title={editing ? `Sửa ${entityName}` : `Thêm ${entityName}`}
        subtitle={editing ? rowTitle(editing) : undefined}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button className="btn-ghost" type="button" onClick={() => setFormOpen(false)}>
              Hủy
            </button>
            <button className="btn-primary" type="submit" form="crud-form" disabled={saving}>
              {saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </>
        }
      >
        <form id="crud-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields
            .filter((f) => !f.hidden?.(form))
            .map((f) => (
              <Field
                key={f.name}
                label={f.label}
                required={f.required}
                error={errors[f.name]}
                help={f.help}
                className={f.full || f.type === "textarea" ? "sm:col-span-2" : ""}
              >
                <FieldInput def={f} value={form[f.name]} error={!!errors[f.name]} onChange={(v) => set(f.name, v)} />
              </Field>
            ))}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        message={
          <>
            Bạn chắc chắn muốn xóa {entityName} <b>{deleting ? rowTitle(deleting) : ""}</b>? Hành động này không thể
            hoàn tác.
          </>
        }
      />
    </div>
  );
}

function FieldInput({
  def,
  value,
  onChange,
  error,
}: {
  def: FieldDef;
  value: any;
  onChange: (v: any) => void;
  error: boolean;
}) {
  const cls = `input ${error ? "input-error" : ""}`;
  switch (def.type) {
    case "textarea":
      return (
        <textarea
          className={cls + " min-h-[96px]"}
          value={value ?? ""}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "select":
      return (
        <Select
          value={value}
          error={error}
          options={def.options || []}
          placeholder={def.placeholder ?? "— Chọn —"}
          onChange={onChange}
        />
      );
    case "switch":
      return (
        <div className="pt-1">
          <Switch checked={!!value} onChange={onChange} label={def.placeholder} />
        </div>
      );
    case "money":
      return (
        <div className="relative">
          <input
            className={cls + " pr-10"}
            inputMode="numeric"
            value={value === "" || value === null || value === undefined ? "" : Number(value).toLocaleString("vi-VN")}
            placeholder={def.placeholder || "0"}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, "");
              onChange(digits === "" ? "" : Number(digits));
            }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">₫</span>
        </div>
      );
    case "number":
      return (
        <input
          type="number"
          className={cls}
          value={value ?? ""}
          min={def.min}
          step={def.step}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );
    default:
      return (
        <input
          type={def.type || "text"}
          className={cls}
          value={value ?? ""}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
