import { useCallback, useEffect, useState } from "react";
import { metaApi, Options } from "../api/endpoints";

const empty: Options = { locations: [], categories: [], technicians: [] };
let cache: Options | null = null;
const listeners = new Set<(o: Options) => void>();

/** Gọi sau khi tạo/sửa/xóa để dropdown ở các trang khác cập nhật. */
export async function refreshOptions() {
  try {
    cache = await metaApi.options();
    listeners.forEach((l) => l(cache!));
  } catch {
    /* ignore */
  }
}

export function useOptions() {
  const [options, setOptions] = useState<Options>(cache || empty);

  useEffect(() => {
    listeners.add(setOptions);
    if (!cache) refreshOptions();
    return () => {
      listeners.delete(setOptions);
    };
  }, []);

  const reload = useCallback(() => refreshOptions(), []);
  return { options, reload };
}
