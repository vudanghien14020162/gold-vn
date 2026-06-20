const BOT_TOKEN = '5370872342:AAH2roTpnTlIkLRbzyg6aqQYm_LkUT77gEE';
const CHAT_ID = '1636128663';

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatChange(value) {
  const number = Number(value || 0);

  if (number > 0) return `+${formatNumber(number)}`;
  if (number < 0) return `-${formatNumber(Math.abs(number))}`;

  return "0";
}

function getNowText() {
  return new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
}

function assertTelegramConfig() {
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error("Thiếu VITE_TELEGRAM_BOT_TOKEN hoặc VITE_TELEGRAM_CHAT_ID");
  }
}

export function buildGoldTelegramText({ company, prices = [] }) {
  const companyCode = company?.code || company?.name || "Tất cả";
  const companyInfo = company?.name || company?.content || "";

  let text = "";

  text += "🏆 BẢNG GIÁ VÀNG\n";
  text += `🏢 Công ty: ${companyCode}\n`;
  text += `📌 Thông tin: ${companyInfo}\n`;
  text += `🕒 Cập nhật: ${getNowText()}\n`;
  text += `📦 Số lượng: ${prices.length}\n\n`;

  prices.forEach((item, index) => {
    text += `${index + 1}. ${item.name || "-"}\n`;
    text += `📍 Khu vực: ${item.area || "-"}\n`;
    text += `💰 Mua: ${formatNumber(item.buy)}\n`;
    text += `💸 Bán: ${formatNumber(item.sell)}\n`;
    text += `📈 Biến động mua: ${formatChange(item.buyChange)}\n`;
    text += `📉 Biến động bán: ${formatChange(item.sellChange)}\n\n`;
  });

  return text.trim();
}

export const telegramShareApi = {
  async sendText({ text }) {
    assertTelegramConfig();

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.description || "Gửi text Telegram thất bại");
    }

    return data;
  },

  async sendImage({ blob, caption = "🏆 Bảng giá vàng hôm nay" }) {
    assertTelegramConfig();

    const formData = new FormData();

    formData.append("chat_id", CHAT_ID);
    formData.append("photo", blob, "bang-gia-vang.png");
    formData.append("caption", caption);

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.description || "Gửi ảnh Telegram thất bại");
    }

    return data;
  },
};