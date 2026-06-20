const API_BASE_URL = "http://127.0.0.1:8000";

async function requestJson(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => null);

  if (!response.ok || data?.ok === false) {
    throw new Error(data?.message || "Không lấy được dữ liệu dự đoán");
  }

  return data;
}

export const forecastApi = {
  async getByCompany(companyId) {
    const data = await requestJson(
      `${API_BASE_URL}/api/forecast/company/${companyId}`
    );

    return {
      companyId: data.company_id,
      companyName: data.company_name,
      companyCode: data.company_code || data.company_name,
      totalItems: data.total_items || 0,
      items: Array.isArray(data.items) ? data.items : [],
    };
  },
};