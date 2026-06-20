const API_BASE_URL = "https://be-gold-mongo-mysql.vercel.app";

async function request(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  const payload = await res.json();
  return payload?.response_object || [];
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") return value;

  return Number(String(value).replace(/\./g, "").replace(/,/g, "")) || 0;
}

function toChange(value) {
  if (value === null || value === undefined || value === "") return null;
  return Number(value) || 0;
}

export const HISTORY_RANGE_VALUES = ["7d", "15d", "1m", "3m"];

export const goldHistoryApi = {
  async getHistory({ companyId, name, area, range = "7d" }) {
    const safeRange = HISTORY_RANGE_VALUES.includes(range) ? range : "7d";

    const encodedName = encodeURIComponent(name || "");
    const encodedArea = encodeURIComponent(area || "");

    const rows = await request(
      `/api/getHistoryByDateMongo/${companyId}/${encodedName}/${encodedArea}/${safeRange}`
    );

    return Array.isArray(rows)
      ? rows.map((item) => ({
          id: item.id || item._id || `${item.date_day}-${item.name}`,
          dateDay: item.date_day || "",
          name: item.name || "",
          area: item.area || "",
          companyId: Number(item.company_id || companyId || 0),
          buy: toNumber(item.buy),
          sell: toNumber(item.sell),
          buyChange: toChange(item.diff_yesterday_buy),
          sellChange: toChange(item.diff_yesterday_sell),
          lastUpdate: item.last_update || "",
          dateSync: item.date_sync || "",
        }))
      : [];
  },
};