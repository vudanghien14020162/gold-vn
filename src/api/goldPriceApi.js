const API_BASE_URL = "https://be-gold-mongo-mysql.vercel.app";

async function request(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  const payload = await res.json();
  return payload?.response_object || [];
}

function parseMoney(value) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") return value;

  return Number(String(value).replace(/\./g, "").replace(/,/g, "")) || 0;
}

function parseChange(value) {
  if (value === null || value === undefined || value === "") return null;
  return Number(value) || 0;
}

function splitCompanyName(value = "") {
  const [code = "", content = ""] = String(value).split("|");

  return {
    code: code.trim(),
    content: content.trim(),
  };
}

function normalizeCompany(item) {
  return {
    id: Number(item.id || 0),
    code: item.name || "",
    name: item.content || item.name || "",
    content: item.content || "",
    icon: item.icon || "",
  };
}

function normalizePrice(item, companyGroup = {}) {
  const companyInfo = splitCompanyName(companyGroup.company_name);

  return {
    id: item.id || item._id,
    name: item.name || "",
    area: item.area || "",
    companyId: Number(item.companyId || item.company_id || companyGroup.company_id || 0),
    company: companyInfo.code || item.company_name || "",
    companyContent: companyInfo.content || item.company_content || "",
    buy: parseMoney(item.buy),
    sell: parseMoney(item.sell),
    buyChange: parseChange(item.diff_yesterday_buy),
    sellChange: parseChange(item.diff_yesterday_sell),
    lastUpdate: item.last_update || "",
    dateSync: item.date_sync || "",
  };
}

export const goldPriceApi = {
  async getCompanies() {
    const rows = await request("/api/getAllCompanyMongo");
    return Array.isArray(rows) ? rows.map(normalizeCompany) : [];
  },

  async getAllPrices() {
    const groups = await request("/api/getDataPagePriceMongo");

    if (!Array.isArray(groups)) return [];

    return groups.flatMap((group) =>
      Array.isArray(group.items)
        ? group.items.map((item) => normalizePrice(item, group))
        : []
    );
  },

  async getPricesByCompany(companyId) {
    const allRows = await this.getAllPrices();

    if (!companyId || companyId === "all") {
      return allRows;
    }

    return allRows.filter(
      (item) => String(item.companyId) === String(companyId)
    );
  },
};