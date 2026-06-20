import { useEffect, useState } from "react";
export function useAsync(callback, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const r = await callback();
      setData(r.response_object);
    } catch (e) {
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, dependencies);
  return { data, loading, error, refetch: fetchData };
}
