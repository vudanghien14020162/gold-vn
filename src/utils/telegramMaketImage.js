export const TELEGRAM_BOT_TOKEN =
  "5370872342:AAH2roTpnTlIkLRbzyg6aqQYm_LkUT77gEE";

export const TELEGRAM_CHAT_ID = "1636128663";

const WORLD_MARKET_IMAGE_WIDTH = 1600;
const WORLD_MARKET_IMAGE_HEIGHT = 980;
const WORLD_HISTORY_IMAGE_WIDTH = 1600;

export function formatWorldNumber(value) {
  if (value === null || value === undefined || value === "") return "--";

  return Number(value).toLocaleString("vi-VN", {
    maximumFractionDigits: 2,
  });
}

export function formatWorldChange(value) {
  const number = Number(value || 0);

  if (number > 0) return `+${formatWorldNumber(number)}`;
  if (number < 0) return `-${formatWorldNumber(Math.abs(number))}`;

  return "0";
}

export function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function assertTelegramConfig() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("Thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID.");
  }
}

function getChangeStyle(value) {
  const number = Number(value || 0);

  if (number > 0) {
    return {
      color: "#006b4f",
      bg: "#e7f3ea",
    };
  }

  if (number < 0) {
    return {
      color: "#dc2626",
      bg: "#fdecec",
    };
  }

  return {
    color: "#64748b",
    bg: "#f1eadf",
  };
}

export function buildWorldText(items, updatedAtText) {
  return [
    "📊 DỮ LIỆU THỊ TRƯỜNG THẾ GIỚI",
    `🕒 Cập nhật: ${updatedAtText}`,
    "",
    ...items.map((item) => {
      return `• ${item.title} (${item.symbol}): ${formatWorldNumber(
        item.value
      )} ${item.unit} | ${formatWorldChange(
        item.change
      )} (${formatWorldChange(item.changePercent)}%)`;
    }),
  ].join("\n");
}

export function buildWorldMarketSvg(items, updatedAtText) {
  const width = WORLD_MARKET_IMAGE_WIDTH;
  const height = WORLD_MARKET_IMAGE_HEIGHT;

  const cards = items
    .map((item, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);

      const x = 70 + col * 500;
      const y = 210 + row * 310;

      const changeStyle = getChangeStyle(item.change);

      return `
        <rect x="${x}" y="${y}" width="450" height="260" rx="22" fill="#fffdf9" stroke="#e9c895"/>
        <rect x="${x + 24}" y="${y + 24}" width="54" height="54" rx="16" fill="#fff2d0" stroke="#ead6c4"/>

        <text x="${x + 51}" y="${
        y + 61
      }" text-anchor="middle" font-size="28" font-weight="900" fill="#a87118">◎</text>

        <text x="${x + 95}" y="${
        y + 48
      }" font-size="24" font-weight="900" fill="#172033">
          ${escapeXml(item.title)}
        </text>

        <text x="${x + 95}" y="${
        y + 78
      }" font-size="18" font-weight="800" fill="#71665f">
          ${escapeXml(item.symbol)}
        </text>

        <text x="${x + 24}" y="${
        y + 150
      }" font-size="42" font-weight="900" fill="#006b4f">
          ${escapeXml(formatWorldNumber(item.value))}
        </text>

        <text x="${x + 255}" y="${
        y + 150
      }" font-size="18" font-weight="900" fill="#71665f">
          ${escapeXml(item.unit)}
        </text>

        <rect x="${x + 24}" y="${
        y + 178
      }" width="110" height="34" rx="17" fill="${changeStyle.bg}"/>
        <text x="${x + 79}" y="${
        y + 201
      }" text-anchor="middle" font-size="17" font-weight="900" fill="${
        changeStyle.color
      }">
          ${escapeXml(formatWorldChange(item.change))}
        </text>

        <rect x="${x + 148}" y="${
        y + 178
      }" width="110" height="34" rx="17" fill="${changeStyle.bg}"/>
        <text x="${x + 203}" y="${
        y + 201
      }" text-anchor="middle" font-size="17" font-weight="900" fill="${
        changeStyle.color
      }">
          ${escapeXml(formatWorldChange(item.changePercent))}%
        </text>
      `;
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#000000" flood-opacity="0.12"/>
        </filter>
      </defs>

      <rect width="${width}" height="${height}" fill="#fff9e8"/>

      <rect x="50" y="36" width="1500" height="110" rx="18" fill="#123b73" filter="url(#shadow)"/>
      <rect x="50" y="138" width="1500" height="10" fill="#ffd231"/>

      <text x="90" y="88" font-size="42" font-weight="900" fill="#ffd231">
        DỮ LIỆU THỊ TRƯỜNG THẾ GIỚI
      </text>

      <text x="90" y="126" font-size="25" font-weight="800" fill="#ffffff">
        Cập nhật: ${escapeXml(updatedAtText)}
      </text>

      ${cards}

      <text x="800" y="935" text-anchor="middle" font-size="22" font-style="italic" fill="#6b7280">
        * Dữ liệu được cập nhật tự động từ hệ thống thị trường
      </text>
    </svg>
  `;
}

function getHistoryImageHeight(count) {
  const safeCount = Math.max(Number(count || 0), 1);

  const topAreaHeight = 585;
  const tableHeaderHeight = 64;
  const rowHeight = 58;
  const footerHeight = 90;
  const bottomPadding = 44;

  return topAreaHeight + tableHeaderHeight + safeCount * rowHeight + footerHeight + bottomPadding;
}

function getSafeHistoryDomain(history) {
  const values = history.map((row) => Number(row.value || 0));

  let minValue = Math.min(...values, 0);
  let maxValue = Math.max(...values, 1);

  if (minValue === maxValue) {
    minValue -= 1;
    maxValue += 1;
  } else {
    const padding = (maxValue - minValue) * 0.14;
    minValue -= padding;
    maxValue += padding;
  }

  return { minValue, maxValue };
}

export function buildWorldHistorySvg({ item, history, rangeLabel }) {
  const width = WORLD_HISTORY_IMAGE_WIDTH;
  const height = getHistoryImageHeight(history.length);

  const { minValue, maxValue } = getSafeHistoryDomain(history);

  const chartLeft = 170;
  const chartRight = 1400;
  const chartTop = 255;
  const chartBottom = 455;
  const chartHeight = chartBottom - chartTop;

  const tableX = 60;
  const tableY = 605;
  const tableWidth = 1480;
  const tableHeaderHeight = 64;
  const rowHeight = 58;
  const tableRadius = 12;

  const points = history.map((row, index) => {
    const x =
      history.length <= 1
        ? chartLeft
        : chartLeft +
          (index * (chartRight - chartLeft)) / (history.length - 1);

    const percent =
      (Number(row.value || 0) - minValue) / (maxValue - minValue || 1);

    const y = chartBottom - percent * chartHeight;

    return { ...row, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const dots = points
    .map(
      (point) => `
        <circle cx="${point.x}" cy="${point.y}" r="9" fill="#006b4f" stroke="#ffffff" stroke-width="4"/>
        <text x="${point.x}" y="505" text-anchor="middle" font-size="20" fill="#52657d">
          ${escapeXml(point.date?.slice(5))}
        </text>
      `
    )
    .join("");

  const rows = history
    .map((row, index) => {
      const y = tableY + tableHeaderHeight + index * rowHeight;
      const style = getChangeStyle(row.change);

      return `
        <rect x="${tableX}" y="${y}" width="${tableWidth}" height="${rowHeight}" fill="${
        index % 2 === 0 ? "#ffffff" : "#f8fbff"
      }"/>

        <text x="190" y="${y + 37}" text-anchor="middle" font-size="24" font-weight="800" fill="#172033">
          ${escapeXml(row.date)}
        </text>

        <text x="540" y="${y + 37}" text-anchor="middle" font-size="24" font-weight="900" fill="#006b4f">
          ${escapeXml(formatWorldNumber(row.value))} ${escapeXml(item.unit)}
        </text>

        <text x="890" y="${y + 37}" text-anchor="middle" font-size="24" font-weight="900" fill="${style.color}">
          ${escapeXml(formatWorldChange(row.change))}
        </text>

        <text x="1220" y="${y + 37}" text-anchor="middle" font-size="24" font-weight="900" fill="${style.color}">
          ${escapeXml(formatWorldChange(row.changePercent))}%
        </text>
      `;
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="header" x1="0" x2="1">
          <stop offset="0%" stop-color="#061b3a"/>
          <stop offset="100%" stop-color="#0b4d8f"/>
        </linearGradient>

        <linearGradient id="gold" x1="0" x2="1">
          <stop offset="0%" stop-color="#ffd95a"/>
          <stop offset="100%" stop-color="#e3a21b"/>
        </linearGradient>

        <filter id="shadow">
          <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#000000" flood-opacity="0.12"/>
        </filter>
      </defs>

      <rect width="${width}" height="${height}" fill="#fff9e8"/>

      <rect x="40" y="32" width="1520" height="105" rx="14" fill="url(#header)" filter="url(#shadow)"/>
      <rect x="40" y="130" width="1520" height="10" fill="#ffd231"/>

      <text x="78" y="82" font-size="42" font-weight="900" fill="#ffd231">
        LỊCH SỬ DỮ LIỆU THẾ GIỚI
      </text>

      <text x="78" y="122" font-size="30" font-weight="900" fill="#ffffff">
        ${escapeXml(item.title)} | ${escapeXml(item.symbol)} | ${escapeXml(rangeLabel)}
      </text>

      <rect x="40" y="170" width="1520" height="385" rx="14" fill="#ffffff" filter="url(#shadow)"/>

      <text x="78" y="222" font-size="30" font-weight="900" fill="#172033">
        Biểu đồ lịch sử
      </text>

      ${[0, 1, 2, 3, 4]
        .map((index) => {
          const y = chartTop + index * ((chartBottom - chartTop) / 4);
          return `<line x1="${chartLeft}" x2="${chartRight}" y1="${y}" y2="${y}" stroke="#d9e7f5" stroke-dasharray="8 8"/>`;
        })
        .join("")}

      <path d="${linePath}" fill="none" stroke="#006b4f" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>

      ${dots}

      <rect x="${tableX}" y="${tableY}" width="${tableWidth}" height="${
        tableHeaderHeight + history.length * rowHeight
      }" rx="${tableRadius}" fill="#ffffff"/>

      <rect x="${tableX}" y="${tableY}" width="${tableWidth}" height="${tableHeaderHeight}" rx="${tableRadius}" fill="url(#gold)"/>
      <rect x="${tableX}" y="${
        tableY + tableHeaderHeight - tableRadius
      }" width="${tableWidth}" height="${tableRadius}" fill="url(#gold)"/>

      <text x="190" y="${tableY + 41}" text-anchor="middle" font-size="24" font-weight="900" fill="#172033">NGÀY</text>
      <text x="540" y="${tableY + 41}" text-anchor="middle" font-size="24" font-weight="900" fill="#172033">GIÁ TRỊ</text>
      <text x="890" y="${tableY + 41}" text-anchor="middle" font-size="24" font-weight="900" fill="#172033">THAY ĐỔI</text>
      <text x="1220" y="${tableY + 41}" text-anchor="middle" font-size="24" font-weight="900" fill="#172033">% THAY ĐỔI</text>

      ${rows}

      <text x="800" y="${height - 44}" text-anchor="middle" font-size="22" font-style="italic" fill="#6b7280">
        * Dữ liệu được cập nhật tự động từ hệ thống thị trường
      </text>
    </svg>
  `;
}

export function renderSvgToPngBlob(svg, width = 1600, height = 980) {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;

      context.fillStyle = "#fff9e8";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0);

      URL.revokeObjectURL(url);

      canvas.toBlob(
        (pngBlob) => {
          if (!pngBlob) {
            reject(new Error("Không tạo được ảnh PNG."));
            return;
          }

          resolve(pngBlob);
        },
        "image/png",
        1
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không render được ảnh."));
    };

    image.src = url;
  });
}

export async function sendTelegramText(text) {
  assertTelegramConfig();

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.description || "Gửi text Telegram thất bại.");
  }

  return data;
}

export async function sendTelegramPhoto({ blob, filename, caption }) {
  assertTelegramConfig();

  const formData = new FormData();

  formData.append("chat_id", TELEGRAM_CHAT_ID);
  formData.append("caption", caption || "");
  formData.append("photo", blob, filename || "world-market.png");

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.description || "Gửi ảnh Telegram thất bại.");
  }

  return data;
}

export async function createAndSendWorldImageTelegram(items, updatedAtText) {
  const svg = buildWorldMarketSvg(items, updatedAtText);
  const pngBlob = await renderSvgToPngBlob(
    svg,
    WORLD_MARKET_IMAGE_WIDTH,
    WORLD_MARKET_IMAGE_HEIGHT
  );

  return sendTelegramPhoto({
    blob: pngBlob,
    filename: "du-lieu-the-gioi.png",
    caption: `Dữ liệu thế giới - ${updatedAtText}`,
  });
}

export async function createAndSendWorldHistoryImageTelegram({
  item,
  history,
  rangeLabel,
}) {
  const height = getHistoryImageHeight(history.length);

  const svg = buildWorldHistorySvg({
    item,
    history,
    rangeLabel,
  });

  const pngBlob = await renderSvgToPngBlob(
    svg,
    WORLD_HISTORY_IMAGE_WIDTH,
    height
  );

  return sendTelegramPhoto({
    blob: pngBlob,
    filename: `lich-su-${item.key}.png`,
    caption: `Lịch sử ${item.title} - ${item.symbol} - ${rangeLabel}`,
  });
}