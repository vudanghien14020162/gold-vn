import React, { useEffect, useMemo, useState } from "react";
import { Image, Loader2, X } from "lucide-react";
import { worldMarketApi } from "../../api/worldMarketApi";
import { createAndSendWorldHistoryImageTelegram } from "../../utils/telegramMaketImage";
import "./WorldHistoryModal.css";

const RANGES = [
  { label: "7 ngày", value: "7d" },
  { label: "15 ngày", value: "15d" },
  { label: "1 tháng", value: "1m" },
  { label: "3 tháng", value: "3m" },
];

const TABLE_PAGE_SIZE = 7;

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "--";

  return Number(value).toLocaleString("vi-VN", {
    maximumFractionDigits: 2,
  });
}

function formatChange(value) {
  const number = Number(value || 0);

  if (number > 0) return `+${formatNumber(number)}`;
  if (number < 0) return `-${formatNumber(Math.abs(number))}`;

  return "0";
}

function getChangeClass(value) {
  const number = Number(value || 0);

  if (number > 0) return "world-history-change-up";
  if (number < 0) return "world-history-change-down";

  return "world-history-change-zero";
}

function getRangeLabel(range) {
  return RANGES.find((item) => item.value === range)?.label || range;
}

function getSafeDomain(history) {
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

export default function WorldHistoryModal({ item, onClose }) {
  const [range, setRange] = useState("7d");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [tooltip, setTooltip] = useState(null);
  const [tablePage, setTablePage] = useState(1);

  const chartPoints = useMemo(() => {
    if (!history.length) return [];

    const { minValue, maxValue } = getSafeDomain(history);

    const chartLeft = 90;
    const chartRight = 790;
    const chartTop = 95;
    const chartBottom = 250;
    const chartHeight = chartBottom - chartTop;

    return history.map((row, index) => {
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
  }, [history]);

  const linePath = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const totalTablePages = Math.max(
    1,
    Math.ceil(history.length / TABLE_PAGE_SIZE)
  );

  const pagedHistory = history.slice(
    (tablePage - 1) * TABLE_PAGE_SIZE,
    tablePage * TABLE_PAGE_SIZE
  );

  useEffect(() => {
    let ignore = false;

    async function loadHistory() {
      try {
        setLoading(true);
        setMessage("");
        setTooltip(null);
        setTablePage(1);

        const result = await worldMarketApi.getHistory(item.key, range);

        if (!ignore) {
          setHistory(result.data || []);
        }
      } catch (error) {
        console.error(error);

        if (!ignore) {
          setHistory([]);
          setMessage("Không tải được lịch sử.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (item?.key) {
      loadHistory();
    }

    return () => {
      ignore = true;
    };
  }, [item?.key, range]);

  const handlePointClick = (point) => {
    const tooltipWidth = 260;
    const tooltipHeight = 128;

    let left = point.x + 16;
    let top = point.y - 18;

    if (left + tooltipWidth > 860) {
      left = point.x - tooltipWidth - 16;
    }

    if (top + tooltipHeight > 300) {
      top = point.y - tooltipHeight + 18;
    }

    if (top < 12) top = 12;

    setTooltip({ ...point, left, top });
  };

  const handleSendTelegramImage = async () => {
    try {
      if (!history.length) {
        setMessage("Chưa có dữ liệu lịch sử để gửi.");
        return;
      }

      setSending(true);
      setMessage("Đang tạo và gửi ảnh lịch sử...");

      await createAndSendWorldHistoryImageTelegram({
        item,
        history,
        rangeLabel: getRangeLabel(range),
      });

      setMessage("Đã gửi ảnh lịch sử lên Telegram.");
    } catch (error) {
      console.error(error);
      setMessage(error?.message || "Gửi ảnh Telegram thất bại.");
    } finally {
      setSending(false);
    }
  };

  if (!item) return null;

  return (
    <div className="world-history-overlay" onClick={onClose}>
      <div
        className="world-history-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="world-history-header">
          <div>
            <h2>{item.title}</h2>
            <p>
              {item.symbol} | {item.unit}
            </p>
          </div>

          <button
            type="button"
            className="world-history-close"
            onClick={onClose}
            aria-label="Đóng lịch sử"
          >
            <X size={26} />
          </button>
        </div>

        <div className="world-history-actions">
          <div className="world-history-tabs">
            {RANGES.map((rangeItem) => (
              <button
                key={rangeItem.value}
                type="button"
                className={range === rangeItem.value ? "active" : ""}
                onClick={() => setRange(rangeItem.value)}
              >
                {rangeItem.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="world-history-telegram-btn"
            onClick={handleSendTelegramImage}
            disabled={sending || loading || history.length === 0}
          >
            {sending ? (
              <Loader2 size={18} className="world-history-spin" />
            ) : (
              <Image size={18} />
            )}
            {sending ? "Đang gửi ảnh..." : "Gửi ảnh lịch sử Telegram"}
          </button>
        </div>

        {message && <div className="world-history-message">{message}</div>}

        <section className="world-history-chart-card">
          <h3>Biểu đồ lịch sử</h3>
          <p>Click vào điểm tròn để xem chi tiết giá trị và biến động</p>

          {loading ? (
            <div className="world-history-empty">Đang tải lịch sử...</div>
          ) : history.length === 0 ? (
            <div className="world-history-empty">Chưa có dữ liệu lịch sử.</div>
          ) : (
            <>
              <div
                className="world-chart-wrap"
                onMouseLeave={() => setTooltip(null)}
              >
                <svg viewBox="0 0 880 320" className="world-chart-svg">
                  {[0, 1, 2, 3, 4].map((line) => (
                    <line
                      key={line}
                      x1="60"
                      x2="820"
                      y1={80 + line * 42}
                      y2={80 + line * 42}
                      className="world-history-grid-line"
                    />
                  ))}

                  <path d={linePath} className="world-history-line" />

                  {chartPoints.map((point) => (
                    <g
                      key={point.date}
                      className="world-history-point"
                      onClick={() => handlePointClick(point)}
                      onMouseEnter={() => handlePointClick(point)}
                    >
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="15"
                        className="world-history-dot-hit"
                      />

                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="7"
                        className={
                          tooltip?.date === point.date
                            ? "world-history-dot active"
                            : "world-history-dot"
                        }
                      />

                      <text
                        x={point.x}
                        y="296"
                        textAnchor="middle"
                        className="world-history-axis-label"
                      >
                        {point.date?.slice(5)}
                      </text>
                    </g>
                  ))}
                </svg>

                {tooltip && (
                  <div
                    className="world-history-tooltip"
                    style={{
                      left: `${tooltip.left}px`,
                      top: `${tooltip.top}px`,
                    }}
                  >
                    <div className="world-history-tooltip-date">
                      {tooltip.date}
                    </div>

                    <div className="world-history-tooltip-row">
                      <span>Giá trị</span>
                      <strong>
                        {formatNumber(tooltip.value)} {item.unit}
                      </strong>
                    </div>

                    <div className="world-history-tooltip-row">
                      <span>Thay đổi</span>
                      <b className={getChangeClass(tooltip.change)}>
                        {formatChange(tooltip.change)}
                      </b>
                    </div>

                    <div className="world-history-tooltip-row">
                      <span>% thay đổi</span>
                      <b className={getChangeClass(tooltip.changePercent)}>
                        {formatChange(tooltip.changePercent)}%
                      </b>
                    </div>
                  </div>
                )}
              </div>

              <div className="world-history-legend">
                <span>{item.title}</span>
              </div>
            </>
          )}
        </section>

        <section className="world-history-table-card">
          <div className="world-history-table-head">
            <h3>Bảng lịch sử giá</h3>

            <span>
              Trang {tablePage} / {totalTablePages}
            </span>
          </div>

          <div className="world-history-table-wrap">
            <table className="world-history-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Giá trị</th>
                  <th>So với hôm qua</th>
                  <th>% thay đổi</th>
                  <th>Cập nhật</th>
                </tr>
              </thead>

              <tbody>
                {pagedHistory.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>

                    <td className="world-history-price-value">
                      {formatNumber(row.value)} {item.unit}
                    </td>

                    <td>
                      <span className={getChangeClass(row.change)}>
                        {formatChange(row.change)}
                      </span>
                    </td>

                    <td>
                      <span className={getChangeClass(row.changePercent)}>
                        {formatChange(row.changePercent)}%
                      </span>
                    </td>

                    <td>{row.updatedAtText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalTablePages > 1 && (
            <div className="world-history-pagination">
              <button
                type="button"
                disabled={tablePage === 1}
                onClick={() => setTablePage((prev) => Math.max(prev - 1, 1))}
              >
                ←
              </button>

              {Array.from({ length: totalTablePages }, (_, index) => {
                const pageNumber = index + 1;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    className={tablePage === pageNumber ? "active" : ""}
                    onClick={() => setTablePage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={tablePage === totalTablePages}
                onClick={() =>
                  setTablePage((prev) => Math.min(prev + 1, totalTablePages))
                }
              >
                →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}