import React, { useEffect, useMemo, useState, useTransition } from "react";
import { homeApi } from "../../api/homeApi";
import "./HomePage.css";

const HOME_CACHE_KEY = "home_market_overview_cache_v1";
const HISTORY_CACHE_KEY = "home_sjc_history_cache_v1";

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatChange(value) {
  if (value === null || value === undefined || value === "") return "Chưa cập nhật";

  const number = Number(value || 0);

  if (number > 0) return `▲ ${formatNumber(number)}`;
  if (number < 0) return `▼ ${formatNumber(Math.abs(number))}`;

  return "Không đổi";
}

function getChangeClass(value) {
  if (value === null || value === undefined || value === "") return "change-empty";

  const number = Number(value || 0);

  if (number > 0) return "change-up";
  if (number < 0) return "change-down";

  return "change-zero";
}

function formatDateText(dateString) {
  if (!dateString) return "Đang cập nhật";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Đang cập nhật";

  return date.toLocaleString("vi-VN");
}

function getCachedData(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setCachedData(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore cache error
  }
}

export default function HomePage({ onNavigate }) {
  const [overview, setOverview] = useState(() =>
    getCachedData(HOME_CACHE_KEY, [])
  );
  const [history, setHistory] = useState(() =>
    getCachedData(HISTORY_CACHE_KEY, [])
  );
  const [prediction, setPrediction] = useState(null);
  const [chartRange, setChartRange] = useState("7d");
  const [hoverPoint, setHoverPoint] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(overview.length === 0);
  const [chartLoading, setChartLoading] = useState(history.length === 0);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const featuredCompanies = useMemo(() => overview.slice(0, 3), [overview]);
  const marketItems = useMemo(() => overview.slice(0, 4), [overview]);

  const latestUpdate = useMemo(() => {
    const item = overview.find((row) => row.dateSync);
    return formatDateText(item?.dateSync);
  }, [overview]);

  const latestChartItem = history[history.length - 1];

  useEffect(() => {
    let mounted = true;

    async function loadOverview() {
      try {
        setLoadingOverview(overview.length === 0);
        setError("");

        const data = await homeApi.getMarketOverview();

        if (!mounted) return;

        startTransition(() => {
          setOverview(data);
        });

        setCachedData(HOME_CACHE_KEY, data);
      } catch (err) {
        console.error(err);

        if (mounted && overview.length === 0) {
          setError("Không tải được dữ liệu tổng quan thị trường.");
        }
      } finally {
        if (mounted) {
          setLoadingOverview(false);
        }
      }
    }

    loadOverview();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadChart() {
      try {
        setChartLoading(history.length === 0);
        setHoverPoint(null);

        const data = await homeApi.getSjcHistory(chartRange);

        if (!mounted) return;

        startTransition(() => {
          setHistory(data);
        });

        if (chartRange === "7d") {
          setCachedData(HISTORY_CACHE_KEY, data);
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setHistory([]);
        }
      } finally {
        if (mounted) {
          setChartLoading(false);
        }
      }
    }

    loadChart();

    return () => {
      mounted = false;
    };
  }, [chartRange]);

  useEffect(() => {
    let mounted = true;

    async function loadPredictionLater() {
      try {
        const timer = setTimeout(async () => {
          const data = await homeApi.getHomeForecast();

          if (mounted) {
            setPrediction(data);
          }
        }, 250);

        return () => clearTimeout(timer);
      } catch {
        // mock prediction fail is not critical
      }
    }

    loadPredictionLater();

    return () => {
      mounted = false;
    };
  }, []);

  const chartConfig = useMemo(() => {
    const width = 520;
    const height = 260;
    const paddingX = 42;
    const paddingTop = 34;
    const paddingBottom = 48;

    const values = history.flatMap((item) => [item.buy, item.sell]);
    const min = values.length ? Math.min(...values) - 250000 : 0;
    const max = values.length ? Math.max(...values) + 250000 : 1;

    const getPoint = (item, key, index) => {
      const x =
        paddingX +
        (index * (width - paddingX * 2)) / Math.max(history.length - 1, 1);

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
      buyPoints: history
        .map((item, index) => {
          const point = getPoint(item, "buy", index);
          return `${point.x},${point.y}`;
        })
        .join(" "),
      sellPoints: history
        .map((item, index) => {
          const point = getPoint(item, "sell", index);
          return `${point.x},${point.y}`;
        })
        .join(" "),
      getPoint,
    };
  }, [history]);

  const goToPricePage = (companyId = "all") => {
    if (typeof onNavigate === "function") {
      onNavigate("price", { companyId });
    }
  };

  return (
    <main className="home-page">
      {error && <div className="home-error">{error}</div>}

      <section className="home-dashboard">
        <div className="home-company-column">
          {loadingOverview && overview.length === 0
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="home-company-card home-skeleton" />
              ))
            : featuredCompanies.map((item) => (
                <article
                  key={item.companyId}
                  className="home-company-card"
                  onClick={() => goToPricePage(item.companyId)}
                >
                  <div className="company-card-head">
                    <div className="company-logo">
                      {item.companyIcon ? (
                        <img src={item.companyIcon} alt={item.companyName} />
                      ) : (
                        <span>{item.companyName}</span>
                      )}
                    </div>

                    <div>
                      <h2>{item.companyName}</h2>
                      <p>{item.companyContent}</p>
                      <small className="gold-type-chip">{item.goldName}</small>
                    </div>
                  </div>

                  <div className="company-price-panel">
                    <div>
                      <span>MUA VÀO</span>
                      <strong className="price-buy">
                        {formatCurrency(item.buy)}
                      </strong>
                      <small className={getChangeClass(item.buyChange)}>
                        {formatChange(item.buyChange)}
                      </small>
                    </div>

                    <div>
                      <span>BÁN RA</span>
                      <strong className="price-sell">
                        {formatCurrency(item.sell)}
                      </strong>
                      <small className={getChangeClass(item.sellChange)}>
                        {formatChange(item.sellChange)}
                      </small>
                    </div>
                  </div>
                </article>
              ))}
        </div>

        <div className="home-market-column">
          <div className="section-heading">
            <h2>Tổng quan thị trường</h2>
            <span />
          </div>

          <div className="market-card">
            <div className="market-card-head">
              <h3>Giá vàng nổi bật</h3>
              <small>Top 4 công ty</small>
            </div>

            {loadingOverview && overview.length === 0
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="market-item market-skeleton" />
                ))
              : marketItems.map((item) => (
                  <article
                    key={item.companyId}
                    className="market-item"
                    onClick={() => goToPricePage(item.companyId)}
                  >
                    <div className="market-item-top">
                      <strong>{item.companyName}</strong>
                      <span className={getChangeClass(item.buyChange)}>
                        {formatChange(item.buyChange)}
                      </span>
                    </div>

                    <p>{item.companyContent}</p>

                    <small className="gold-type-chip gold-type-chip-small">
                      {item.goldName}
                    </small>

                    <div className="market-price-grid">
                      <div>
                        <span>Mua vào</span>
                        <b className="price-buy">{formatCurrency(item.buy)}</b>
                      </div>

                      <div>
                        <span>Bán ra</span>
                        <b className="price-sell">{formatCurrency(item.sell)}</b>
                      </div>
                    </div>
                  </article>
                ))}

            <button
              type="button"
              className="market-list-btn"
              onClick={() => goToPricePage("all")}
            >
              Xem bảng giá đầy đủ
            </button>
          </div>
        </div>

        <div className="home-right-column">
          <section className="home-chart-card">
            <div className="chart-title-row">
              <div>
                <h2>Biểu đồ giá vàng</h2>
                <p>SJC vàng miếng - khu vực Biên Hòa</p>
                <small>Cập nhật: {latestUpdate}</small>
              </div>

              <div className="current-price-box">
                <span>Giá bán hiện tại</span>
                <strong>{formatCurrency(latestChartItem?.sell || 0)}</strong>
              </div>
            </div>

            <div className="chart-tabs">
              {[
                { label: "7 ngày", value: "7d" },
                { label: "15 ngày", value: "15d" },
                { label: "1 tháng", value: "1m" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={chartRange === item.value ? "active" : ""}
                  onClick={() => setChartRange(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="chart-svg-wrap" onMouseLeave={() => setHoverPoint(null)}>
              {chartLoading && history.length === 0 ? (
                <div className="chart-empty">Đang tải biểu đồ...</div>
              ) : history.length === 0 ? (
                <div className="chart-empty">Chưa có dữ liệu biểu đồ.</div>
              ) : (
                <>
                  <svg
                    viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`}
                    className="chart-svg"
                  >
                    {[0, 1, 2, 3, 4].map((row) => (
                      <line
                        key={row}
                        x1={chartConfig.paddingX}
                        x2={chartConfig.width - chartConfig.paddingX}
                        y1={chartConfig.paddingTop + row * 38}
                        y2={chartConfig.paddingTop + row * 38}
                        className="chart-grid-line"
                      />
                    ))}

                    <polyline
                      points={chartConfig.buyPoints}
                      className="chart-line-buy"
                    />

                    <polyline
                      points={chartConfig.sellPoints}
                      className="chart-line-sell"
                    />

                    {history.map((item, index) => {
                      const buy = chartConfig.getPoint(item, "buy", index);
                      const sell = chartConfig.getPoint(item, "sell", index);
                      const showLabel = chartRange !== "1m" || index % 4 === 0;

                      return (
                        <g key={item.id}>
                          <circle
                            cx={buy.x}
                            cy={buy.y}
                            r="5.5"
                            className="chart-dot-buy"
                            onMouseEnter={() => setHoverPoint(item)}
                          />

                          <circle
                            cx={sell.x}
                            cy={sell.y}
                            r="5.5"
                            className="chart-dot-sell"
                            onMouseEnter={() => setHoverPoint(item)}
                          />

                          {showLabel && (
                            <text
                              x={buy.x}
                              y={chartConfig.height - 16}
                              textAnchor="middle"
                              className="chart-axis-label"
                            >
                              {String(item.dateDay).slice(5)}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {hoverPoint && (
                    <div className="chart-tooltip">
                      <strong>{hoverPoint.dateDay}</strong>

                      <div>
                        <span>Giá mua</span>
                        <b className="price-buy">
                          {formatCurrency(hoverPoint.buy)}
                        </b>
                      </div>

                      <div>
                        <span>Giá bán</span>
                        <b className="price-sell">
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

            <div className="chart-legend">
              <span className="legend-buy">Giá mua</span>
              <span className="legend-sell">Giá bán</span>
            </div>
          </section>

          {prediction ? (
            <section className="prediction-card">
              <div className="prediction-head">
                <div>
                  <span className="prediction-badge">
                    {prediction.companyName} • {prediction.area}
                  </span>

                  <h2>Dự đoán giá vàng SJC ngày mai</h2>
                  <p>{prediction.goldName}</p>
                </div>

                <div className="prediction-confidence">
                  <span>Độ tin cậy</span>
                  <strong>{prediction.confidence}%</strong>
                </div>
              </div>

              <div className="prediction-price-grid">
                <div>
                  <span>Giá mua dự kiến</span>
                  <strong className="price-buy">
                    {formatCurrency(prediction.forecastBuy)}
                  </strong>
                  <small className={getChangeClass(prediction.buyChange)}>
                    {formatChange(prediction.buyChange)}
                  </small>
                </div>

                <div>
                  <span>Giá bán dự kiến</span>
                  <strong className="price-sell">
                    {formatCurrency(prediction.forecastSell)}
                  </strong>
                  <small className={getChangeClass(prediction.sellChange)}>
                    {formatChange(prediction.sellChange)}
                  </small>
                </div>
              </div>

              <p className="prediction-note">{prediction.note}</p>
            </section>
          ) : (
            <section className="prediction-card prediction-skeleton" />
          )}
        </div>
      </section>
    </main>
  );
}