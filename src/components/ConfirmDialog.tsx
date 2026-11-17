import { ReactNode, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

interface Props {
  open: boolean;
  title?: string;
  message: ReactNode;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export default function ConfirmDialog({ open, title = "Xác nhận xóa", message, confirmText = "Xóa", onConfirm, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      width="sm"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button className="btn-danger" onClick={handle} disabled={loading}>
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
          <AlertTriangle size={20} />
        </div>
        <div className="pt-1 text-sm leading-relaxed text-ink">{message}</div>
      </div>
    </Modal>
  );
}
