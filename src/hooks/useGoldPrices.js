import { useEffect, useState } from "react";
import { goldPriceApi } from "../api/goldPriceApi";
export function useGoldPrices(filters) {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const r = await goldPriceApi.getAll(filters);
      setData(r.response_object);
    } catch (e) {
      setError(e?.message || "Không lấy được dữ liệu giá vàng");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [filters.companyId, filters.keyword]);
  return { data, loading, error, refetch: fetchData };
}
