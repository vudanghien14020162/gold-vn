// const API_BASE_URL = "https://be-gold-mongo-mysql.vercel.app";

// const MARKET_META = {
//   xauusd: { title: "Giá vàng thế giới", symbol: "XAU/USD", unit: "USD/oz" },
//   usd_vnd: { title: "Tỷ giá USD/VND", symbol: "USD/VND", unit: "VND" },
//   dxy: { title: "Dollar Index", symbol: "DXY", unit: "điểm" },
//   fed_rate: { title: "Lãi suất FED", symbol: "FEDFUNDS", unit: "%" },
//   brent_oil: { title: "Dầu Brent", symbol: "BRENT", unit: "USD/thùng" },
//   vnindex: { title: "VN-Index", symbol: "VNINDEX", unit: "điểm" },
// };

// async function requestJson(url) {
//   const response = await fetch(url);
//   const data = await response.json().catch(() => null);

//   if (!response.ok || data?.success === false) {
//     throw new Error(data?.message || "API lỗi");
//   }

//   return data;
// }

// export function formatVietnamDateTime(value) {
//   if (!value) return "--";

//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return "--";

//   return date.toLocaleString("vi-VN", {
//     timeZone: "Asia/Ho_Chi_Minh",
//     hour12: false,
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   });
// }

// function normalizeToday(apiData) {
//   const data = apiData?.data || {};

//   return Object.keys(MARKET_META).map((key) => ({
//     key,
//     ...MARKET_META[key],
//     value: data[key] ?? null,
//     prev: data[`${key}_prev`] ?? null,
//     change: data[`${key}_change`] ?? 0,
//     changePercent: data[`${key}_change_percent`] ?? 0,
//     updatedAt: data.updated_at || data.created_at || "",
//     updatedAtText: formatVietnamDateTime(data.updated_at || data.created_at),
//     indicatorDate: data.indicator_date || "",
//   }));
// }

// function normalizeHistory(apiData, type) {
//   const rows = Array.isArray(apiData?.data) ? apiData.data : [];

//   return rows.map((item, index) => {
//     const value = item[type] ?? null;
//     const prevRow = rows[index - 1];
//     const prev = item[`${type}_prev`] ?? prevRow?.[type] ?? null;

//     const change =
//       item[`${type}_change`] ??
//       (prev !== null && value !== null ? Number(value) - Number(prev) : 0);

//     const changePercent =
//       item[`${type}_change_percent`] ??
//       (prev ? (Number(change) / Number(prev)) * 100 : 0);

//     return {
//       date: item.indicator_date,
//       value,
//       prev,
//       change,
//       changePercent,
//       updatedAt: item.updated_at || "",
//       updatedAtText: formatVietnamDateTime(item.updated_at),
//     };
//   });
// }

// export const worldMarketApi = {
//   meta: MARKET_META,

//   async getLatest() {
//     const data = await requestJson(
//       `${API_BASE_URL}/api/market-indicators/today`
//     );

//     return normalizeToday(data);
//   },

//   async sync() {
//     const data = await requestJson(
//       `${API_BASE_URL}/api/market-indicators/today`
//     );

//     return normalizeToday(data);
//   },

//   async getHistory(type, range = "7d") {
//     const data = await requestJson(
//       `${API_BASE_URL}/api/market-indicators/history?type=${type}&range=${range}`
//     );

//     return {
//       type: data.type || type,
//       range: data.range || range,
//       total: data.total || 0,
//       data: normalizeHistory(data, type),
//     };
//   },
// };


const API_BASE_URL = "https://be-gold-mongo-mysql.vercel.app";

const MARKET_META = {
  xauusd: { title: "Giá vàng thế giới", symbol: "XAU/USD", unit: "USD/oz" },
  usd_vnd: { title: "Tỷ giá USD/VND", symbol: "USD/VND", unit: "VND" },
  dxy: { title: "Dollar Index", symbol: "DXY", unit: "điểm" },
  fed_rate: { title: "Lãi suất FED", symbol: "FEDFUNDS", unit: "%" },
  brent_oil: { title: "Dầu Brent", symbol: "BRENT", unit: "USD/thùng" },
  vnindex: { title: "VN-Index", symbol: "VNINDEX", unit: "điểm" },
};

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "API lỗi");
  }

  return data;
}

export function formatVietnamDateTime(value) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function normalizeToday(apiData) {
  const data = apiData?.data || {};

  return Object.keys(MARKET_META).map((key) => ({
    key,
    ...MARKET_META[key],
    value: data[key] ?? null,
    prev: data[`${key}_prev`] ?? null,
    change: data[`${key}_change`] ?? 0,
    changePercent: data[`${key}_change_percent`] ?? 0,
    updatedAt: data.updated_at || data.created_at || "",
    updatedAtText: formatVietnamDateTime(data.updated_at || data.created_at),
    indicatorDate: data.indicator_date || "",
  }));
}

function normalizeHistory(apiData, type) {
  const rows = Array.isArray(apiData?.data) ? apiData.data : [];

  return rows.map((item, index) => {
    const value = item[type] ?? null;
    const prevRow = rows[index - 1];
    const prev = item[`${type}_prev`] ?? prevRow?.[type] ?? null;

    const change =
      item[`${type}_change`] ??
      (prev !== null && value !== null ? Number(value) - Number(prev) : 0);

    const changePercent =
      item[`${type}_change_percent`] ??
      (prev ? (Number(change) / Number(prev)) * 100 : 0);

    return {
      date: item.indicator_date,
      value,
      prev,
      change,
      changePercent,
      updatedAt: item.updated_at || "",
      updatedAtText: formatVietnamDateTime(item.updated_at),
    };
  });
}

export const worldMarketApi = {
  meta: MARKET_META,

  async getLatest() {
    const data = await requestJson(
      `${API_BASE_URL}/api/market-indicators/today`
    );

    return normalizeToday(data);
  },

  async sync() {
    const data = await requestJson(
      `${API_BASE_URL}/api/market-indicators/sync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return normalizeToday(data);
  },

  async getHistory(type, range = "7d") {
    const data = await requestJson(
      `${API_BASE_URL}/api/market-indicators/history?type=${type}&range=${range}`
    );

    return {
      type: data.type || type,
      range: data.range || range,
      total: data.total || 0,
      data: normalizeHistory(data, type),
    };
  },
};