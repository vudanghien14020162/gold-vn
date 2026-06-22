const API_BASE_URL = "https://be-gold-mongo-mysql.vercel.app";
const FORECAST_API_URL = "https://gold-forecast-fastapi-ml-production.up.railway.app";
async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json();
}

async function forecastRequest(path) {
  const response = await fetch(`${FORECAST_API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Forecast API error ${response.status}`);
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


  async getHomeForecast() {
  const goldName = encodeURIComponent("Vàng SJC 1L, 10L, 1KG");
  const area = encodeURIComponent("Biên Hòa");

  const data = await forecastRequest(
    `/api/forecast/company/1/gold?name=${goldName}&area=${area}`
  );

  return {
    companyName: data.company_name || "SJC",
    companyCode: data.company_code || "SJC",

    area: data.area,
    goldName: data.gold_name,

    currentBuy: Number(data.current_buy_price || 0),
    currentSell: Number(data.current_sell_price || 0),

    forecastBuy: Number(data.forecast_buy_price || 0),
    forecastSell: Number(data.forecast_sell_price || 0),

    buyChange: Number(data.buy_change || 0),
    sellChange: Number(data.sell_change || 0),

    buyChangePercent: Number(data.buy_change_percent || 0),
    sellChangePercent: Number(data.sell_change_percent || 0),

    trend: data.trend || "sideway",

    confidence: Math.max(
      Number(data?.probability?.up || 0),
      Number(data?.probability?.down || 0),
      Number(data?.probability?.sideway || 0)
    ),

    probability: data.probability || {},

    range: {
      p10: Number(data?.range?.p10 || 0),
      p50: Number(data?.range?.p50 || 0),
      p90: Number(data?.range?.p90 || 0),
    },

    model: data.model || {},
  };
}
};