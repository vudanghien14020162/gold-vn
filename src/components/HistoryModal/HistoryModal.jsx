import React, { useEffect, useMemo, useState } from "react";
import { goldHistoryApi } from "../../api/goldHistoryApi";
import { telegramShareApi } from "../../api/telegramShareApi";
import {
  buildHistoryPriceSvg,
  renderSvgToPngBlob,
} from "../../utils/telegramHistoryImage";
import {
  formatChange,
  formatCurrency,
  getChangeClass,
} from "../../utils/formatCurrency";
import Toast from "../Toast/Toast";
import "./HistoryModal.css";

const RANGE_OPTIONS = [
  { label: "7 ngày", value: "7d" },
  { label: "15 ngày", value: "15d" },
  { label: "1 tháng", value: "1m" },
  { label: "3 tháng", value: "3m" },
];

const PAGE_SIZE = 8;

const BUY_COLOR = "#006b4f";
const SELL_COLOR = "#dc2626";

export default function HistoryModal({ priceItem, onClose }) {
  const [range, setRange] = useState("7d");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [hoverPoint, setHoverPoint] = useState(null);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

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

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      try {
        setLoading(true);
        setHoverPoint(null);
        setPage(1);

        const data = await goldHistoryApi.getHistory({
          companyId: priceItem.companyId,
          name: priceItem.name,
          area: priceItem.area,
          range,
        });

        if (mounted) {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(error);

        if (mounted) {
          setRows([]);

          showToast(
            "error",
            "Không tải được lịch sử",
            "Không tải được dữ liệu lịch sử giá vàng."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [priceItem, range]);

  const rangeLabel = useMemo(() => {
    return RANGE_OPTIONS.find((item) => item.value === range)?.label || range;
  }, [range]);

  const chartConfig = useMemo(() => {
    const width = 780;
    const height = 270;
    const paddingX = 52;
    const paddingTop = 34;
    const paddingBottom = 52;

    const values = rows.flatMap((item) => [item.buy, item.sell]);

    const min = values.length ? Math.min(...values) - 250000 : 0;
    const max = values.length ? Math.max(...values) + 250000 : 1;

    const getPoint = (item, key, index) => {
      const x =
        paddingX +
        (index * (width - paddingX * 2)) / Math.max(rows.length - 1, 1);

      const chartHeight = height - paddingTop - paddingBottom;

      const y =
        paddingTop +
        ((max - item[key]) * chartHeight) / Math.max(max - min, 1);

      return { x, y };
    };

    return {
      width,
      height,
      paddingX,
      paddingTop,
      getPoint,
      buyPoints: rows
        .map((item, index) => {
          const point = getPoint(item, "buy", index);
          return `${point.x},${point.y}`;
        })
        .join(" "),
      sellPoints: rows
        .map((item, index) => {
          const point = getPoint(item, "sell", index);
          return `${point.x},${point.y}`;
        })
        .join(" "),
    };
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pagedRows = rows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleSendHistoryTelegram = async () => {
    try {
      if (rows.length === 0) {
        showToast(
          "info",
          "Không có dữ liệu",
          "Không có dữ liệu lịch sử để gửi Telegram."
        );
        return;
      }

      setSendingTelegram(true);

      showToast(
        "loading",
        "Đang tạo ảnh",
        "Đang render ảnh lịch sử giá vàng..."
      );

      const { svg, width, height } = buildHistoryPriceSvg({
        priceItem,
        rows,
        rangeLabel,
      });

      const blob = await renderSvgToPngBlob(svg, width, height);

      showToast(
        "loading",
        "Đang gửi ảnh lên Telegram",
        "Vui lòng chờ trong giây lát..."
      );

      await telegramShareApi.sendImage({
        blob,
        caption: `📈 Lịch sử giá vàng ${priceItem.name} | ${priceItem.area} | ${rangeLabel}`,
      });

      showToast(
        "success",
        "Gửi ảnh Telegram thành công",
        "Ảnh lịch sử giá vàng đã được gửi lên Telegram."
      );
    } catch (error) {
      console.error(error);

      showToast(
        "error",
        "Gửi ảnh Telegram thất bại",
        error?.message || "Có lỗi xảy ra khi gửi ảnh."
      );
    } finally {
      setSendingTelegram(false);
    }
  };

  return (
    <div className="history-overlay" onMouseDown={onClose}>
      <section
        className="history-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="history-header">
          <div>
            <h2>{priceItem.name}</h2>
            <p>
              {priceItem.area} | {priceItem.company}
            </p>
          </div>

          <button type="button" className="history-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="history-actions">
          <div className="history-tabs">
            {RANGE_OPTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={range === item.value ? "active" : ""}
                onClick={() => setRange(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="history-telegram-btn"
            onClick={handleSendHistoryTelegram}
            disabled={loading || sendingTelegram || rows.length === 0}
          >
            {sendingTelegram
              ? "Đang gửi ảnh lên Telegram..."
              : "Gửi ảnh lịch sử Telegram"}
          </button>
        </div>

        <div className="history-chart-card">
          <h3>Biểu đồ giá mua / giá bán</h3>
          <p>Hover vào điểm tròn để xem chi tiết giá và biến động</p>

          <div
            className="history-chart-wrap"
            onMouseLeave={() => setHoverPoint(null)}
          >
            {loading ? (
              <div className="history-empty">Đang tải biểu đồ...</div>
            ) : rows.length === 0 ? (
              <div className="history-empty">Chưa có dữ liệu lịch sử.</div>
            ) : (
              <>
                <svg
                  viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`}
                  className="history-chart-svg"
                >
                  {[0, 1, 2, 3, 4].map((row) => (
                    <line
                      key={row}
                      x1={chartConfig.paddingX}
                      x2={chartConfig.width - chartConfig.paddingX}
                      y1={chartConfig.paddingTop + row * 40}
                      y2={chartConfig.paddingTop + row * 40}
                      stroke="#d9e7f5"
                      strokeDasharray="7 7"
                    />
                  ))}

                  <polyline
                    points={chartConfig.buyPoints}
                    fill="none"
                    stroke={BUY_COLOR}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <polyline
                    points={chartConfig.sellPoints}
                    fill="none"
                    stroke={SELL_COLOR}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {rows.map((item, index) => {
                    const buy = chartConfig.getPoint(item, "buy", index);
                    const sell = chartConfig.getPoint(item, "sell", index);

                    const showLabel =
                      range === "7d" ||
                      range === "15d" ||
                      index % 4 === 0 ||
                      index === rows.length - 1;

                    return (
                      <g key={item.id || `${item.dateDay}-${index}`}>
                        <circle
                          cx={buy.x}
                          cy={buy.y}
                          r="6"
                          fill={BUY_COLOR}
                          stroke="#ffffff"
                          strokeWidth="3"
                          onMouseEnter={() => setHoverPoint(item)}
                          style={{ cursor: "pointer" }}
                        />

                        <circle
                          cx={sell.x}
                          cy={sell.y}
                          r="6"
                          fill={SELL_COLOR}
                          stroke="#ffffff"
                          strokeWidth="3"
                          onMouseEnter={() => setHoverPoint(item)}
                          style={{ cursor: "pointer" }}
                        />

                        {showLabel && (
                          <text
                            x={buy.x}
                            y={chartConfig.height - 16}
                            textAnchor="middle"
                            fill="#52657d"
                            fontSize="13"
                          >
                            {String(item.dateDay || "").slice(5)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {hoverPoint && (
                  <div className="history-tooltip">
                    <strong>{hoverPoint.dateDay}</strong>

                    <div>
                      <span>Giá mua</span>
                      <b className="history-price-buy">
                        {formatCurrency(hoverPoint.buy)}
                      </b>
                    </div>

                    <div>
                      <span>Giá bán</span>
                      <b className="history-price-sell">
                        {formatCurrency(hoverPoint.sell)}
                      </b>
                    </div>

                    <div>
                      <span>Mua so với hôm qua</span>
                      <b className={getChangeClass(hoverPoint.buyChange)}>
                        {formatChange(hoverPoint.buyChange)}
                      </b>
                    </div>

                    <div>
                      <span>Bán so với hôm qua</span>
                      <b className={getChangeClass(hoverPoint.sellChange)}>
                        {formatChange(hoverPoint.sellChange)}
                      </b>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="history-legend">
            <span className="legend-buy">Giá mua</span>
            <span className="legend-sell">Giá bán</span>
          </div>
        </div>

        <div className="history-table-card">
          <div className="history-table-head">
            <h3>Bảng lịch sử giá</h3>
            <span>
              Trang {safePage} / {totalPages}
            </span>
          </div>

          <table className="history-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Giá mua</th>
                <th>Giá bán</th>
                <th>Mua so với hôm qua</th>
                <th>Bán so với hôm qua</th>
              </tr>
            </thead>

            <tbody>
              {pagedRows.map((item, index) => (
                <tr key={item.id || `${item.dateDay}-${index}`}>
                  <td>{item.dateDay}</td>

                  <td className="history-price-buy">
                    {formatCurrency(item.buy)}
                  </td>

                  <td className="history-price-sell">
                    {formatCurrency(item.sell)}
                  </td>

                  <td>
                    <span className={getChangeClass(item.buyChange)}>
                      {formatChange(item.buyChange)}
                    </span>
                  </td>

                  <td>
                    <span className={getChangeClass(item.sellChange)}>
                      {formatChange(item.sellChange)}
                    </span>
                  </td>
                </tr>
              ))}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5}>Không có dữ liệu lịch sử.</td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="history-pagination">
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
        </div>

        <Toast
          type={toast?.type}
          message={toast?.message}
          onClose={() => setToast(null)}
        />
      </section>
    </div>
  );
}