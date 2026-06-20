import React, { useEffect, useMemo, useState } from "react";
import { goldPriceApi } from "../../api/goldPriceApi";
import {
  buildGoldTelegramText,
  telegramShareApi,
} from "../../api/telegramShareApi";
import {
  RefreshCw,
  RotateCcw,
  Send,
  Image as ImageIcon,
} from "lucide-react";

import PriceTable from "../../components/PriceTable/PriceTable";
import HistoryModal from "../../components/HistoryModal/HistoryModal";
import "./GoldPricePage.css";
import Toast from "../../components/Toast/Toast";
import Spinner from "../../components/Loading/Spinner";
import PriceTableSkeleton from "../../components/Loading/PriceTableSkeleton";
import { goldSyncApi } from "../../api/goldSyncApi";

const PAGE_SIZE = 10;
const IMAGE_WIDTH = 1600;
const MAX_IMAGE_ROWS = 25;

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatChange(value) {
  if (value === null || value === undefined || value === "") return "-";

  const number = Number(value || 0);

  if (number > 0) return `▲ ${formatNumber(number)}`;
  if (number < 0) return `▼ ${formatNumber(Math.abs(number))}`;

  return "-";
}

function normalizeCompanyId(value) {
  if (value === null || value === undefined || value === "") return "all";
  return String(value);
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function splitText(text, maxLength = 28) {
  const words = String(text || "").split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;

    if (nextLine.length > maxLength) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }
  });

  if (line) lines.push(line);

  return lines;
}

function getGoldImageHeight(count) {
  return 365 + Math.min(count, MAX_IMAGE_ROWS) * 128 + 30;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatImageDiff(value) {
  if (value === null || value === undefined || value === "") return "-";

  const number = Number(value || 0);

  if (number > 0) return `▲ ${formatMoney(number)}`;
  if (number < 0) return `▼ ${formatMoney(Math.abs(number))}`;

  return "-";
}

function getDiffColor(value) {
  const number = Number(value || 0);

  if (number > 0) return "#08751f";
  if (number < 0) return "#d71920";

  return "#6b7280";
}

function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
}

function splitDateTimeText(value) {
  const text = String(value || "--");
  const parts = text.split(" ");

  if (parts.length >= 2) {
    return [parts[1] || "--", parts[0] || "--"];
  }

  return [text || "--", ""];
}

function normalizeImageItem(item) {
  return {
    id: item.id,
    name: item.name || "-",
    area: item.area || "-",

    buy: item.buy ?? item.buy_price ?? item.price_buy ?? 0,
    sell: item.sell ?? item.sell_price ?? item.price_sell ?? 0,

    diff_yesterday_buy:
      item.diff_yesterday_buy ??
      item.buyChange ??
      item.buy_change ??
      item.diffBuy ??
      0,

    diff_yesterday_sell:
      item.diff_yesterday_sell ??
      item.sellChange ??
      item.sell_change ??
      item.diffSell ??
      0,

    company_name:
      item.company_name ??
      item.companyCode ??
      item.company_code ??
      item.company ??
      "GOLD",

    company_content:
      item.company_content ??
      item.companyContent ??
      item.company_name ??
      item.company ??
      "GOLD",

    sync_time_text: item.sync_time_text ?? "",
    sync_time: item.sync_time ?? item.syncTime ?? "",
    date_sync: item.date_sync ?? item.dateSync ?? "",
    last_update: item.last_update ?? item.lastUpdate ?? "",
  };
}

function buildGoldPriceSvg(rawItems, selectedCompany = null) {
  const items = rawItems.slice(0, MAX_IMAGE_ROWS).map((item) => {
    const normalized = normalizeImageItem(item);

    if (selectedCompany) {
      normalized.company_name =
        selectedCompany.code || selectedCompany.name || normalized.company_name;

      normalized.company_content =
        selectedCompany.name ||
        selectedCompany.content ||
        normalized.company_content;
    }

    return normalized;
  });

  const first = items[0] || {};
  const height = getGoldImageHeight(items.length);

  const companyName =
    selectedCompany?.code || first.company_name || "GOLD";

  const companyContent =
    selectedCompany?.name ||
    selectedCompany?.content ||
    first.company_content ||
    companyName;

  const syncTime =
    first.sync_time_text ||
    formatDateTime(first.sync_time) ||
    formatDateTime(first.date_sync) ||
    first.last_update ||
    new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
    });

  const [timePart, datePart] = splitDateTimeText(syncTime);
  const area = first.area || "--";

  const rows = items
    .map((item, index) => {
      const y = 365 + index * 128;
      const nameLines = splitText(item.name || "-", 28).slice(0, 2);

      return `
        <rect x="60" y="${y}" width="1480" height="128" fill="#ffffff" stroke="#efd28a" stroke-width="1"/>

        <text x="110" y="${y + 42}" font-size="27" font-weight="900" fill="#061b3a">
          ${escapeXml(nameLines[0] || "-")}
        </text>

        ${
          nameLines[1]
            ? `<text x="110" y="${y + 74}" font-size="27" font-weight="900" fill="#061b3a">${escapeXml(nameLines[1])}</text>`
            : ""
        }

        <text x="110" y="${y + 108}" font-size="21" fill="#061b3a">
          ${escapeXml(item.area || "-")}
        </text>

        <text x="570" y="${y + 74}" text-anchor="middle" font-size="36" font-weight="900" fill="#08751f">
          ${escapeXml(formatMoney(item.buy))}
        </text>

        <text x="850" y="${y + 74}" text-anchor="middle" font-size="36" font-weight="900" fill="#d71920">
          ${escapeXml(formatMoney(item.sell))}
        </text>

        <text x="1190" y="${y + 50}" text-anchor="middle" font-size="25" font-weight="900" fill="${getDiffColor(
          item.diff_yesterday_buy
        )}">
          Mua: ${escapeXml(formatImageDiff(item.diff_yesterday_buy))}
        </text>

        <text x="1190" y="${y + 90}" text-anchor="middle" font-size="25" font-weight="900" fill="${getDiffColor(
          item.diff_yesterday_sell
        )}">
          Bán: ${escapeXml(formatImageDiff(item.diff_yesterday_sell))}
        </text>
      `;
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${IMAGE_WIDTH}" height="${height}" viewBox="0 0 ${IMAGE_WIDTH} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#fff8e8"/>
          <stop offset="55%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#fff0b8"/>
        </linearGradient>

        <linearGradient id="gold" x1="0" x2="1">
          <stop offset="0%" stop-color="#facc15"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>

        <linearGradient id="navy" x1="0" x2="1">
          <stop offset="0%" stop-color="#061b3a"/>
          <stop offset="100%" stop-color="#063b7a"/>
        </linearGradient>
      </defs>

      <rect width="${IMAGE_WIDTH}" height="${height}" fill="url(#bg)"/>

      <circle cx="115" cy="90" r="65" fill="url(#gold)"/>

      <text x="115" y="108" text-anchor="middle" font-size="48" font-weight="900" fill="#ffffff">
        ${escapeXml(companyName.slice(0, 3).toUpperCase())}
      </text>

      <text x="220" y="92" font-size="60" font-weight="900" fill="#062b61">
        BẢNG GIÁ VÀNG ${escapeXml(companyName)}
      </text>

      <text x="220" y="145" font-size="32" fill="#062b61">
        ${escapeXml(companyContent)}
      </text>

      <path d="M1070 0 H1600 V170 H1110 Q1070 170 1045 132 L1015 86 Q1000 60 1015 32 L1032 0 Z" fill="url(#navy)"/>

      <text x="1258" y="46" font-size="28" font-weight="800" fill="#ffffff">CẬP NHẬT LÚC</text>
      <text x="1258" y="98" font-size="46" font-weight="900" fill="#ffd231">${escapeXml(
        timePart
      )}</text>
      <text x="1258" y="145" font-size="34" font-weight="900" fill="#ffffff">${escapeXml(
        datePart
      )}</text>

      <rect x="60" y="195" width="1480" height="86" rx="14" fill="url(#navy)"/>

      <text x="180" y="232" font-size="26" font-weight="800" fill="#ffffff">TỔNG SẢN PHẨM</text>
      <text x="180" y="266" font-size="36" font-weight="900" fill="#ffd231">${items.length}</text>

      <text x="650" y="232" font-size="26" font-weight="800" fill="#ffffff">KHU VỰC</text>
      <text x="650" y="266" font-size="32" font-weight="900" fill="#ffd231">${escapeXml(
        area
      )}</text>

      <text x="1110" y="232" font-size="26" font-weight="800" fill="#ffffff">ĐƠN VỊ TÍNH</text>
      <text x="1110" y="266" font-size="32" font-weight="900" fill="#ffd231">VND/lượng</text>

      <rect x="60" y="305" width="1480" height="64" rx="14" fill="#ffd231"/>

      <text x="310" y="340" text-anchor="middle" font-size="27" font-weight="900" fill="#061b3a">SẢN PHẨM</text>
      <text x="570" y="340" text-anchor="middle" font-size="27" font-weight="900" fill="#061b3a">MUA VÀO</text>
      <text x="850" y="340" text-anchor="middle" font-size="27" font-weight="900" fill="#061b3a">BÁN RA</text>

      <text x="1190" y="332" text-anchor="middle" font-size="24" font-weight="900" fill="#061b3a">BIẾN ĐỘNG</text>
      <text x="1190" y="360" text-anchor="middle" font-size="18" font-weight="800" fill="#061b3a">GIÁ MUA / GIÁ BÁN SO VỚI HÔM QUA</text>

      ${rows}
    </svg>
  `;
}

function renderSvgToPngBlob(svg, width, height) {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
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
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(url);

        canvas.toBlob(
          (pngBlob) => {
            if (!pngBlob) {
              reject(new Error("Không tạo được PNG"));
              return;
            }

            resolve(pngBlob);
          },
          "image/png",
          1
        );
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không render được SVG sang PNG"));
    };

    img.src = url;
  });
}

function formatSyncTime(value) {
  if (!value) return "Đang tải dữ liệu...";

  const raw = String(value);
  const fixed = raw.includes("Z") || raw.includes("+") ? raw : `${raw}Z`;
  const date = new Date(fixed);

  if (Number.isNaN(date.getTime())) return "Đang tải dữ liệu...";

  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function GoldPricePage({ initialCompanyId = "all" }) {
  const [companyId, setCompanyId] = useState(() =>
    normalizeCompanyId(initialCompanyId)
  );
  const [companies, setCompanies] = useState([]);
  const [pricesSource, setPricesSource] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState("");

  useEffect(() => {
    setCompanyId(normalizeCompanyId(initialCompanyId));
    setKeyword("");
    setPage(1);
    setMessage("");
  }, [initialCompanyId]);

  useEffect(() => {
    let mounted = true;

    async function loadCompanies() {
      try {
        const data = await goldPriceApi.getCompanies();
        if (mounted) setCompanies(data);
      } catch (error) {
        console.error(error);
        if (mounted) setMessage("Không tải được danh sách công ty.");
      }
    }

    loadCompanies();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadPrices() {
      try {
        setLoading(true);
        setMessage("");

        const data = await goldPriceApi.getPricesByCompany(companyId);

        if (mounted) {
          setPricesSource(data);
          setPage(1);
        }
      } catch (error) {
        console.error(error);

        if (mounted) {
          setPricesSource([]);
          setMessage("Không tải được dữ liệu bảng giá.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPrices();

    return () => {
      mounted = false;
    };
  }, [companyId]);

  const showToast = (type, title, description = "") => {
    setToast({
      type,
      message: {
        title,
        description,
      },
    });

    if (type !== "loading") {
      setTimeout(() => {
        setToast(null);
      }, 3500);
    }
  };

  const getNowText = () => {
    return new Date().toLocaleString("vi-VN", {
      hour12: false,
    });
  };

  const selectedCompany = useMemo(() => {
    if (companyId === "all") return null;

    return (
      companies.find((item) => String(item.id) === String(companyId)) || null
    );
  }, [companies, companyId]);

  const filteredPrices = useMemo(() => {
    const cleanKeyword = keyword.trim().toLowerCase();

    return pricesSource.filter((item) => {
      if (!cleanKeyword) return true;

      return (
        String(item.name || "").toLowerCase().includes(cleanKeyword) ||
        String(item.company || "").toLowerCase().includes(cleanKeyword) ||
        String(item.companyContent || "").toLowerCase().includes(cleanKeyword) ||
        String(item.area || "").toLowerCase().includes(cleanKeyword)
      );
    });
  }, [keyword, pricesSource]);

  const currentSyncTime = useMemo(() => {
    if (lastSyncTime) return lastSyncTime;

    const newest = filteredPrices
      .map((item) => item.dateSync || item.date_sync)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];

    return formatSyncTime(newest);
  }, [filteredPrices, lastSyncTime]);

  const totalPages = Math.max(1, Math.ceil(filteredPrices.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredPrices.slice(start, start + PAGE_SIZE);
  }, [filteredPrices, safePage]);

  const handleChangeCompany = (event) => {
    setCompanyId(event.target.value);
    setKeyword("");
    setPage(1);
    setMessage("");
  };

  const handleSendTextTelegram = async () => {
    try {
      if (filteredPrices.length === 0) {
        setMessage("Không có dữ liệu để gửi Telegram.");
        return;
      }

      setMessage("Đang gửi text Telegram...");

      const text = buildGoldTelegramText({
        company: selectedCompany,
        prices: filteredPrices,
      });

      const res = await telegramShareApi.sendText({ text });

      setMessage(
        res?.response_object?.message ||
          res?.message ||
          "Đã gửi text Telegram."
      );
    } catch (error) {
      console.error(error);
      setMessage("Gửi text Telegram thất bại.");
    }
  };

  const handleSendImageTelegram = async () => {
    try {
      if (filteredPrices.length === 0) {
        showToast(
          "info",
          "Không có dữ liệu",
          "Không có dữ liệu để tạo ảnh."
        );
        return;
      }

      showToast(
        "loading",
        "Đang tạo ảnh",
        "Đang render bảng giá vàng..."
      );

      const svgItems = filteredPrices.slice(0, MAX_IMAGE_ROWS);
      const svg = buildGoldPriceSvg(svgItems, selectedCompany);
      const height = getGoldImageHeight(svgItems.length);
      const pngBlob = await renderSvgToPngBlob(svg, IMAGE_WIDTH, height);

      showToast(
        "loading",
        "Đang gửi Telegram",
        "Vui lòng chờ..."
      );

      await telegramShareApi.sendImage({
        blob: pngBlob,
        caption: `🏆 Bảng giá vàng ${selectedCompany?.code || "TẤT CẢ"}`,
      });

      showToast(
        "success",
        "Gửi ảnh Telegram thành công",
        "Ảnh đã được gửi lên Telegram."
      );
    } catch (error) {
      console.error(error);

      showToast(
        "error",
        "Gửi ảnh Telegram thất bại",
        error?.message || "Có lỗi xảy ra"
      );
    }
  };

  const reloadPrices = async (targetCompanyId = companyId) => {
    try {
      const data = await goldPriceApi.getPricesByCompany(targetCompanyId);

      setPricesSource(data);
      setPage(1);
    } catch (error) {
      console.error(error);
      showToast("error", "Lỗi tải dữ liệu", "Không tải được bảng giá vàng.");
    }
  };

  const handleSyncCompany = async () => {
    try {
      if (companyId === "all") {
        showToast(
          "info",
          "Chưa chọn công ty",
          "Vui lòng chọn một công ty để đồng bộ."
        );
        return;
      }

      setLoading(true);

      showToast(
        "loading",
        "Đang đồng bộ hãng",
        "Hệ thống đang cập nhật dữ liệu mới nhất..."
      );

      await goldSyncApi.syncCompany(companyId);
      await reloadPrices(companyId);

      const timeText = getNowText();
      setLastSyncTime(timeText);

      showToast(
        "success",
        "Đồng bộ hãng thành công",
        `Cập nhật lúc ${timeText}`
      );
    } catch (error) {
      console.error(error);
      showToast("error", "Đồng bộ hãng thất bại", "Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAllCompanies = async () => {
    try {
      setLoading(true);

      showToast(
        "loading",
        "Đang đồng bộ tất cả",
        "Đang cập nhật dữ liệu 8 công ty vàng..."
      );

      await goldSyncApi.syncAllCompanies();

      setCompanyId("all");
      await reloadPrices("all");

      const timeText = getNowText();
      setLastSyncTime(timeText);

      showToast(
        "success",
        "Đồng bộ tất cả thành công",
        `Cập nhật lúc ${timeText}`
      );
    } catch (error) {
      console.error(error);
      showToast("error", "Đồng bộ tất cả thất bại", "Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="gold-price-page">
      <div className="price-page-title">
        <h2>Bảng giá vàng hôm nay</h2>
        <span />
      </div>

      <section className="price-toolbar">
        <div className="price-filter-group">
          <label>
            Công ty
            <select value={companyId} onChange={handleChangeCompany}>
              <option value="all">Tất cả công ty vàng</option>

              {companies.map((company) => (
                <option key={company.id} value={String(company.id)}>
                  {company.code} - {company.name}
                </option>
              ))}
            </select>
          </label>

          <label className="search-filter">
            Tìm kiếm
            <input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
                setMessage("");
              }}
              placeholder="Tìm theo tên vàng, công ty, khu vực..."
            />
          </label>
        </div>

        <div className="price-action-area">
          <div className="company-sync-time">
            <span>Đồng bộ</span>
            <strong>{currentSyncTime}</strong>
          </div>

          <div className="price-toolbar-actions">
            <button
              type="button"
              className="sync-btn"
              onClick={handleSyncCompany}
              disabled={loading}
            >
              <RefreshCw size={18} />
              Đồng bộ hãng
            </button>

            <button
              type="button"
              className="sync-btn"
              onClick={handleSyncAllCompanies}
              disabled={loading}
            >
              <RotateCcw size={18} />
              Đồng bộ tất cả
            </button>

            <button
              type="button"
              className="telegram-text-btn"
              onClick={handleSendTextTelegram}
              disabled={loading}
            >
              <Send size={18} />
              Gửi text Telegram
            </button>

            <button
              type="button"
              className="telegram-image-btn"
              onClick={handleSendImageTelegram}
              disabled={loading}
            >
              <ImageIcon size={18} />
              Gửi ảnh Telegram
            </button>
          </div>
        </div>
      </section>

      {message && <div className="gold-message">{message}</div>}

      <div className="price-count-row">
        <p>
          {loading ? (
            <Spinner text="Đang cập nhật bảng giá vàng..." />
          ) : (
            <>
              Hiển thị <strong>{pagedItems.length}</strong> /{" "}
              <strong>{filteredPrices.length}</strong> dòng dữ liệu
            </>
          )}
        </p>
      </div>

      {loading ? (
        <PriceTableSkeleton rows={10} />
      ) : (
        <>
          <PriceTable
            prices={pagedItems}
            onSelectItem={(item) => setSelectedHistoryItem(item)}
          />

          {filteredPrices.length === 0 && (
            <div className="price-empty-box">Không có dữ liệu phù hợp.</div>
          )}

          {totalPages > 1 && (
            <div className="price-pagination">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;

                return (
                  <button
                    type="button"
                    key={pageNumber}
                    className={safePage === pageNumber ? "active" : ""}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      {selectedHistoryItem && (
        <HistoryModal
          priceItem={selectedHistoryItem}
          onClose={() => setSelectedHistoryItem(null)}
        />
      )}

      <Toast
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />
    </main>
  );
}