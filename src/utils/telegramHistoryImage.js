const IMAGE_WIDTH = 1600;
const CHART_TOP = 215;
const CHART_HEIGHT = 280;
const TABLE_TOP = 610;
const ROW_HEIGHT = 62;

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatDiff(value) {
  if (value === null || value === undefined || value === "") return "0";

  const number = Number(value || 0);

  if (number > 0) return `+${formatMoney(number)}`;
  if (number < 0) return `-${formatMoney(Math.abs(number))}`;

  return "0";
}

function getDiffColor(value) {
  const number = Number(value || 0);

  if (number > 0) return "#059669";
  if (number < 0) return "#dc2626";

  return "#64748b";
}

function getDateText(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toISOString().slice(0, 10);
}

function getShortDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value).slice(5);

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

function normalizeHistoryItem(item) {
  return {
    id: item.id,
    date:
      item.dateDay ||
      item.date ||
      item.date_sync ||
      item.dateSync ||
      item.sync_time ||
      item.created_at ||
      item.createdAt,

    buy: item.buy ?? item.buy_price ?? item.price_buy ?? 0,
    sell: item.sell ?? item.sell_price ?? item.price_sell ?? 0,

    buyChange:
      item.buyChange ??
      item.buy_change ??
      item.diff_yesterday_buy ??
      item.diff_buy ??
      0,

    sellChange:
      item.sellChange ??
      item.sell_change ??
      item.diff_yesterday_sell ??
      item.diff_sell ??
      0,
  };
}

export function renderSvgToPngBlob(svg, width, height) {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Không tạo được canvas context"));
          return;
        }

        ctx.fillStyle = "#fff8e8";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);

        URL.revokeObjectURL(url);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Không tạo được PNG"));
              return;
            }

            resolve(blob);
          },
          "image/png",
          1
        );
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không render được SVG sang PNG"));
    };

    image.src = url;
  });
}

function buildChartSvg(rows) {
  const items = rows.map(normalizeHistoryItem);

  if (items.length === 0) return "";

  const chartX = 155;
  const chartY = CHART_TOP;
  const chartWidth = 1360;
  const chartHeight = CHART_HEIGHT;

  const values = items.flatMap((item) => [Number(item.buy), Number(item.sell)]);
  const minValue = Math.min(...values) - 250000;
  const maxValue = Math.max(...values) + 250000;
  const range = maxValue - minValue || 1;

  const getX = (index) => {
    if (items.length === 1) return chartX;
    return chartX + (index * chartWidth) / (items.length - 1);
  };

  const getY = (value) => {
    return chartY + chartHeight - ((Number(value) - minValue) / range) * chartHeight;
  };

  const buyPoints = items
    .map((item, index) => `${getX(index)},${getY(item.buy)}`)
    .join(" ");

  const sellPoints = items
    .map((item, index) => `${getX(index)},${getY(item.sell)}`)
    .join(" ");

  const labelStep = items.length <= 10 ? 1 : items.length <= 31 ? 4 : 8;

  const gridLines = Array.from({ length: 6 }, (_, index) => {
    const y = chartY + (index * chartHeight) / 5;
    const value = maxValue - (index * range) / 5;

    return `
      <line x1="${chartX}" y1="${y}" x2="${chartX + chartWidth}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="8 8"/>
      <text x="95" y="${y + 7}" text-anchor="middle" font-size="20" fill="#334155">
        ${escapeXml((value / 1000000).toFixed(3))}
      </text>
    `;
  }).join("");

  const points = items
    .map((item, index) => {
      const x = getX(index);
      const showLabel = index % labelStep === 0 || index === items.length - 1;

      return `
        <circle cx="${x}" cy="${getY(item.buy)}" r="7" fill="#059669" stroke="#ffffff" stroke-width="4"/>
        <circle cx="${x}" cy="${getY(item.sell)}" r="7" fill="#dc2626" stroke="#ffffff" stroke-width="4"/>

        ${
          showLabel
            ? `<text x="${x}" y="${chartY + chartHeight + 35}" text-anchor="middle" font-size="20" fill="#334155">
                ${escapeXml(getShortDate(item.date))}
              </text>`
            : ""
        }
      `;
    })
    .join("");

  return `
    <rect x="30" y="145" width="1540" height="410" rx="12" fill="#ffffff" stroke="#dbeafe"/>

    <text x="105" y="185" font-size="30" font-weight="900" fill="#111827">
      Biểu đồ giá mua / giá bán
    </text>

    <text x="175" y="220" font-size="22" font-weight="900" fill="#059669">● Giá mua</text>
    <text x="285" y="220" font-size="22" font-weight="900" fill="#dc2626">● Giá bán</text>

    <text x="70" y="365" font-size="20" font-weight="900" fill="#334155" transform="rotate(-90 70 365)">
      Triệu đồng
    </text>

    ${gridLines}

    <line x1="${chartX}" y1="${chartY}" x2="${chartX}" y2="${chartY + chartHeight}" stroke="#cbd5e1"/>
    <line x1="${chartX}" y1="${chartY + chartHeight}" x2="${chartX + chartWidth}" y2="${chartY + chartHeight}" stroke="#cbd5e1"/>

    <polyline points="${buyPoints}" fill="none" stroke="#059669" stroke-width="5"/>
    <polyline points="${sellPoints}" fill="none" stroke="#dc2626" stroke-width="5"/>

    ${points}
  `;
}

export function buildHistoryPriceSvg({
  priceItem,
  rows = [],
  rangeLabel = "7 ngày",
}) {
  const histories = rows.map(normalizeHistoryItem);
  const width = IMAGE_WIDTH;

  // Chiều cao ảnh tự tăng theo số dòng lịch sử
  const height = TABLE_TOP + 62 + histories.length * ROW_HEIGHT + 90;

  const productName = priceItem?.name || "Lịch sử giá vàng";
  const area = priceItem?.area || "-";
  const company = priceItem?.company || "";

  const tableRows = histories
    .map((item, index) => {
      const y = TABLE_TOP + 62 + index * ROW_HEIGHT;

      return `
        <rect x="30" y="${y}" width="1540" height="${ROW_HEIGHT}" fill="${
        index % 2 === 0 ? "#ffffff" : "#eff6ff"
      }"/>

        <text x="180" y="${y + 40}" text-anchor="middle" font-size="26" font-weight="900" fill="#0f172a">
          ${escapeXml(getDateText(item.date))}
        </text>

        <text x="500" y="${y + 40}" text-anchor="middle" font-size="26" font-weight="900" fill="#059669">
          ${escapeXml(formatMoney(item.buy))}
        </text>

        <text x="800" y="${y + 40}" text-anchor="middle" font-size="26" font-weight="900" fill="#dc2626">
          ${escapeXml(formatMoney(item.sell))}
        </text>

        <text x="1110" y="${y + 40}" text-anchor="middle" font-size="25" font-weight="900" fill="${getDiffColor(
          item.buyChange
        )}">
          ${escapeXml(formatDiff(item.buyChange))}
        </text>

        <text x="1420" y="${y + 40}" text-anchor="middle" font-size="25" font-weight="900" fill="${getDiffColor(
          item.sellChange
        )}">
          ${escapeXml(formatDiff(item.sellChange))}
        </text>
      `;
    })
    .join("");

  return {
    width,
    height,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="navy" x1="0" x2="1">
            <stop offset="0%" stop-color="#03264f"/>
            <stop offset="100%" stop-color="#064b93"/>
          </linearGradient>

          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#fff8e8"/>
            <stop offset="60%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#fff4c4"/>
          </linearGradient>
        </defs>

        <rect width="${width}" height="${height}" fill="url(#bg)"/>

        <rect x="30" y="20" width="1540" height="100" rx="12" fill="url(#navy)"/>
        <rect x="30" y="112" width="1540" height="8" fill="#ffd231"/>

        <text x="65" y="68" font-size="42" font-weight="900" fill="#ffd231">
          LỊCH SỬ GIÁ VÀNG
        </text>

        <text x="65" y="104" font-size="30" font-weight="900" fill="#ffffff">
          ${escapeXml(productName)} | ${escapeXml(area)}${company ? ` | ${escapeXml(company)}` : ""} | ${escapeXml(rangeLabel)}
        </text>

        ${buildChartSvg(histories)}

        <rect x="30" y="${TABLE_TOP}" width="1540" height="62" rx="8" fill="#ffd231"/>

        <text x="180" y="${TABLE_TOP + 40}" text-anchor="middle" font-size="24" font-weight="900" fill="#111827">NGÀY</text>
        <text x="500" y="${TABLE_TOP + 40}" text-anchor="middle" font-size="24" font-weight="900" fill="#111827">GIÁ MUA (ĐỒNG)</text>
        <text x="800" y="${TABLE_TOP + 40}" text-anchor="middle" font-size="24" font-weight="900" fill="#111827">GIÁ BÁN (ĐỒNG)</text>
        <text x="1110" y="${TABLE_TOP + 40}" text-anchor="middle" font-size="24" font-weight="900" fill="#111827">MUA ± (ĐỒNG)</text>
        <text x="1420" y="${TABLE_TOP + 40}" text-anchor="middle" font-size="24" font-weight="900" fill="#111827">BÁN ± (ĐỒNG)</text>

        ${tableRows}

        <text x="800" y="${height - 35}" text-anchor="middle" font-size="22" font-style="italic" fill="#64748b">
          * Dữ liệu được cập nhật tự động từ hệ thống giá vàng thời gian thực
        </text>
      </svg>
    `,
  };
}