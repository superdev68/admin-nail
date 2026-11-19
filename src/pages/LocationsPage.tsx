import { useMemo, useState } from "react";
import { ExternalLink, MapPin, Phone, RefreshCw, Search, Users } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Location, locationsApi, Technician, techniciansApi } from "../api/endpoints";
import CrudPage, { ColumnDef, FieldDef } from "../components/CrudPage";
import Modal from "../components/Modal";
import { ActiveBadge, Avatar, Badge, TECH_STATUS } from "../components/UI";
import { refreshOptions } from "../hooks/useOptions";
import { formatDateTime } from "../utils/format";

const CITIES = [
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "TP Hồ Chí Minh", label: "TP Hồ Chí Minh" },
];

export default function LocationsPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [searchTech, setSearchTech] = useState("");

  const handleOpenTechnicians = (loc: Location) => {
    setSelectedLocation(loc);
    setSearchTech("");
    setLoadingTechs(true);
    techniciansApi
      .list({ locationId: loc.id, size: 100 })
      .then((res) => {
        setTechnicians(res.items);
      })
      .catch(() => {
        toast.error("Không thể tải danh sách kỹ thuật viên");
      })
      .finally(() => {
        setLoadingTechs(false);
      });
  };

  const filteredTechs = useMemo(() => {
    if (!searchTech.trim()) return technicians;
    const q = searchTech.toLowerCase().trim();
    return technicians.filter(
      (t) =>
        t.fullName?.toLowerCase().includes(q) ||
        t.phone?.includes(q)
    );
  }, [technicians, searchTech]);

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
        className: "w-28 text-center",
        render: (r) => (
          <button
            type="button"
            onClick={() => handleOpenTechnicians(r)}
            className="group inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand transition-all hover:border-brand hover:bg-brand hover:text-white"
            title="Nhấn để xem danh sách kỹ thuật viên chi nhánh này"
          >
            <Users size={12} className="transition-transform group-hover:scale-110" />
            <span>{r.technicianCount} thợ</span>
          </button>
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
    <>
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

      {/* Modal danh sách kỹ thuật viên của chi nhánh */}
      <Modal
        open={!!selectedLocation}
        width="lg"
        title={
          <div className="flex items-center gap-2">
            <Users className="text-brand" size={20} />
            <span>Kỹ thuật viên ({filteredTechs.length})</span>
          </div>
        }
        subtitle={
          selectedLocation && (
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <strong className="text-ink">{selectedLocation.name}</strong>
              <span>•</span>
              <MapPin size={12} className="shrink-0" />
              <span>{selectedLocation.address}</span>
            </span>
          )
        }
        onClose={() => setSelectedLocation(null)}
        footer={
          <div className="flex w-full items-center justify-between">
            <Link
              to="/technicians"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
            >
              <span>Đi đến trang Quản lý KTV</span>
              <ExternalLink size={12} />
            </Link>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setSelectedLocation(null)}
            >
              Đóng
            </button>
          </div>
        }
      >
        {loadingTechs ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted">
            <RefreshCw className="mb-2 animate-spin text-brand" size={24} />
            <span className="text-xs">Đang tải danh sách KTV...</span>
          </div>
        ) : technicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand mb-3">
              <Users size={24} />
            </div>
            <p className="font-semibold text-ink">Chưa có kỹ thuật viên nào tại chi nhánh này</p>
            <p className="mt-1 text-xs text-muted max-w-sm">
              Bạn có thể phân bổ kỹ thuật viên về chi nhánh này trong mục Quản lý kỹ thuật viên.
            </p>
            <Link to="/technicians" className="btn-primary mt-4 text-xs">
              Thêm kỹ thuật viên
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {technicians.length > 5 && (
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  className="input pl-8 py-1.5 text-xs"
                  placeholder="Tìm theo tên thợ hoặc số điện thoại..."
                  value={searchTech}
                  onChange={(e) => setSearchTech(e.target.value)}
                />
              </div>
            )}

            {filteredTechs.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                Không tìm thấy kỹ thuật viên nào khớp với "{searchTech}"
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {filteredTechs.map((tech) => {
                  const s = TECH_STATUS[tech.status] || { label: tech.status, tone: "gray" };
                  return (
                    <div
                      key={tech.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas/30 p-3 transition hover:border-brand/40 hover:bg-white"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={tech.fullName} url={tech.avatarUrl} size={38} />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-ink" title={tech.fullName}>
                            {tech.fullName}
                          </div>
                          {tech.phone ? (
                            <a
                              href={`tel:${tech.phone}`}
                              className="inline-flex items-center gap-1 font-mono text-xs text-brand hover:underline"
                            >
                              <Phone size={10} />
                              <span>{tech.phone}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-muted">Chưa có SĐT</span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
