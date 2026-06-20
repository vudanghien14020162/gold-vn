const API_BASE_URL = "https://be-gold-mongo-mysql.vercel.app";

const COMPANY_SYNC_ENDPOINTS = {
  1: "/api/getGoldCrawlSJCMongo",
  2: "/api/getGoldCrawlDojiMongo",
  3: "/api/getGoldCrawlPNJMongo",
  4: "/api/getGoldCrawlBTMCMongo",
  5: "/api/getGoldCrawlBTMHMongo",
  6: "/api/getGoldCrawlPhuQuyMongo",
  7: "/api/getGoldCrawlMiHongMongo",
  8: "/api/getGoldCrawlNgocThamMongo",
};

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`API sync error ${response.status}`);
  }

  return response.json();
}

export const goldSyncApi = {
  async syncCompany(companyId) {
    const endpoint = COMPANY_SYNC_ENDPOINTS[String(companyId)];

    if (!endpoint) {
      throw new Error("Chưa chọn công ty để đồng bộ.");
    }

    return request(endpoint);
  },

  async syncAllCompanies() {
    return request("/api/crawlDataAllCompanyMongo");
  },
};