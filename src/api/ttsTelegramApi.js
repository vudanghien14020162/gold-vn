const API_BASE_URL = "https://be-gold-mongo-mysql.vercel.app";

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || data?.error_description || "API lỗi");
  }

  return data;
}

function normalizeCompany(item) {
  return {
    id: item.id,
    code: item.name,
    name: item.content,
    content: item.content,
    icon: item.icon,
  };
}

function normalizeVoice(item) {
  return {
    id: item.speaker_id,
    speakerId: item.speaker_id,
    name: item.display_name,
    description: item.description,
    gender: item.gender,
    category: item.category,
    effect: item.effect,
  };
}

function normalizeAudio(data) {
  if (!data) return null;

  return {
    id: data.id,
    companyId: data.company_id,
    companyName: data.company_name,
    companyContent: data.company_content,

    syncTime: data.sync_time,
    syncTimeText: data.sync_time_text,

    speaker: data.speaker,
    totalItems: data.total_items,

    fileName: data.telegram_file_name || "gold-price.mp3",
    audioDuration: data.audio_duration || 0,
    telegramFileId: data.telegram_file_id,

    audioUrl: data.play_url ? apiUrl(data.play_url) : "",
    playLatestUrl: data.play_latest_url ? apiUrl(data.play_latest_url) : "",

    text: data.text || "",
  };
}

export const ttsTelegramApi = {
  async getCompanies() {
    const data = await requestJson(apiUrl("/api/getAllCompanyMongo"));

    return Array.isArray(data.response_object)
      ? data.response_object.map(normalizeCompany)
      : [];
  },

  async getVoices() {
    const data = await requestJson(apiUrl("/api/tts/listTtsVoices"));

    return Array.isArray(data.data)
      ? data.data
          .filter((item) => item.active)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map(normalizeVoice)
      : [];
  },

  async getLatest(companyId) {
    const query = companyId ? `?company_id=${companyId}` : "";
    const data = await requestJson(apiUrl(`/api/tts/latest${query}`));

    return normalizeAudio(data.data);
  },

  async generateMp3({ companyId, speaker }) {
    const data = await requestJson(apiUrl("/api/tts/generate"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_id: Number(companyId),
        speaker,
      }),
    });

    return normalizeAudio(data.data);
  },
};