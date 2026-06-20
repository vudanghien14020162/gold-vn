const API_BASE_URL = "https://be-gold-mongo-mysql.vercel.app";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json();
}

function unwrap(payload) {
  return payload?.response_object || payload?.data || payload?.result || [];
}

function normalizeChange(value) {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}

export const homeApi = {
  async getMarketOverview() {
    const payload = await request("/api/marketOverview");
    const rows = unwrap(payload);

    return Array.isArray(rows)
      ? rows.map((item) => ({
          companyId: Number(item.company_id || 0),
          companyName: item.company_name || "",
          companyContent: item.company_content || "",
          companyIcon: item.company_icon || "",
          goldName: item.gold_name || "",
          buy: Number(item.buy || 0),
          sell: Number(item.sell || 0),
          buyChange: normalizeChange(item.buy_change),
          sellChange: normalizeChange(item.sell_change),
          dateSync: item.date_sync || "",
        }))
      : [];
  },

  async getSjcHistory(range = "7d") {
    const safeRange = ["7d", "15d", "1m"].includes(range) ? range : "7d";

    const goldName = encodeURIComponent("Vàng SJC 1L, 10L, 1KG");
    const area = encodeURIComponent("Biên Hòa");

    const payload = await request(
      `/api/getHistoryByDateMongo/1/${goldName}/${area}/${safeRange}`
    );

    const rows = unwrap(payload);

    return Array.isArray(rows)
      ? rows.map((item) => ({
          id: item.id || `${item.date_day}-${item.name}`,
          dateDay: item.date_day || "",
          buy: Number(item.buy || 0),
          sell: Number(item.sell || 0),
          buyChange: normalizeChange(item.diff_yesterday_buy),
          sellChange: normalizeChange(item.diff_yesterday_sell),
        }))
      : [];
  },

  async getPredictionMock() {
    return {
      companyName: "SJC",
      area: "Biên Hòa",
      goldName: "Vàng SJC 1L, 10L, 1KG",
      buy: 14550000,
      sell: 14800000,
      buyChange: 150000,
      sellChange: 100000,
      confidence: 94,
      note: "Dự đoán mock dựa trên lịch sử biến động giá gần nhất.",
    };
  },
};