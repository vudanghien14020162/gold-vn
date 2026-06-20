import React, { useEffect, useMemo, useState } from "react";
import { forecastApi } from "../../api/forecastApi";
import Loading from "../../components/Loading/Loading";
import "./ForecastPage.css";

const PAGE_SIZE = 9;

const COMPANIES = [
  { id: 1, code: "SJC", name: "Vàng Bạc Đá Quý Sài Gòn" },
  { id: 2, code: "DOJI", name: "Trang Sức DOJI" },
  { id: 3, code: "PNJ", name: "Vàng Bạc Đá Quý Phú Nhuận" },
  { id: 4, code: "BTMC", name: "Bảo Tín Minh Châu" },
  { id: 5, code: "BTMH", name: "Bảo Tín Minh Hải" },
  { id: 6, code: "Phú Quý", name: "Vàng Bạc Đá Quý Phú Quý" },
  { id: 7, code: "Mi Hồng", name: "Vàng Bạc Đá Quý Mi Hồng" },
  { id: 8, code: "Ngọc Thẩm", name: "Vàng Bạc Đá Quý Ngọc Thẩm" },
];

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "--";
  return `${Number(value).toLocaleString("vi-VN")} đ`;
}

function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "--";
  return Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}

function formatChange(value) {
  const number = Number(value || 0);
  if (number > 0) return `▲ ${Math.abs(number).toLocaleString("vi-VN")}`;
  if (number < 0) return `▼ ${Math.abs(number).toLocaleString("vi-VN")}`;
  return "0";
}

function getChangeClass(value) {
  const number = Number(value || 0);
  if (number > 0) return "forecast-change-up";
  if (number < 0) return "forecast-change-down";
  return "forecast-change-zero";
}

function getTrendText(trend) {
  if (trend === "up") return "Xu hướng tăng";
  if (trend === "down") return "Xu hướng giảm";
  return "Đi ngang";
}

function getTrendClass(trend) {
  if (trend === "up") return "forecast-trend-up";
  if (trend === "down") return "forecast-trend-down";
  return "forecast-trend-sideway";
}

export default function ForecastPage() {
  const [companyId, setCompanyId] = useState("1");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const selectedCompany = COMPANIES.find(
    (item) => String(item.id) === String(companyId)
  );

  const forecasts = forecastData?.items || [];

  const filteredForecasts = useMemo(() => {
    const cleanKeyword = keyword.trim().toLowerCase();
    if (!cleanKeyword) return forecasts;

    return forecasts.filter((item) =>
      `${item.gold_name || ""} ${item.area || ""}`
        .toLowerCase()
        .includes(cleanKeyword)
    );
  }, [forecasts, keyword]);

  const totalItems = filteredForecasts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const pagedForecasts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredForecasts.slice(start, start + PAGE_SIZE);
  }, [filteredForecasts, page]);

  const upCount = filteredForecasts.filter((item) => item.trend === "up").length;
  const downCount = filteredForecasts.filter((item) => item.trend === "down").length;
  const sidewayCount = filteredForecasts.filter(
    (item) => item.trend !== "up" && item.trend !== "down"
  ).length;

  useEffect(() => {
    let ignore = false;

    async function loadForecast() {
      try {
        setLoading(true);
        setMessage("");
        setPage(1);

        const data = await forecastApi.getByCompany(companyId);

        if (!ignore) setForecastData(data);
      } catch (error) {
        console.error(error);
        if (!ignore) {
          setForecastData(null);
          setMessage(error?.message || "Không tải được dữ liệu dự đoán.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadForecast();

    return () => {
      ignore = true;
    };
  }, [companyId]);

  const handleCompanyChange = (event) => {
    setCompanyId(event.target.value);
    setKeyword("");
    setPage(1);
  };

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value);
    setPage(1);
  };

  if (loading) return <Loading />;

  return (
    <main className="forecast-page">
      <div className="forecast-page-title">
        <h2>Dự đoán giá vàng theo từng loại</h2>
        <span />
      </div>

      <section className="forecast-filter-bar">
        <div className="forecast-filter-item">
          <label>Công ty</label>
          <select value={companyId} onChange={handleCompanyChange}>
            {COMPANIES.map((company) => (
              <option key={company.id} value={company.id}>
                {company.code} - {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="forecast-filter-item forecast-search">
          <label>Tìm loại vàng</label>
          <input
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="Ví dụ: nhẫn, nữ trang, vàng miếng, Hồ Chí Minh..."
          />
        </div>
      </section>

      {message && <div className="forecast-message">{message}</div>}

      <section className="forecast-summary-panel">
        <div>
          <span>Công ty</span>
          <strong>{selectedCompany?.name || forecastData?.companyName || "-"}</strong>
        </div>

        <div>
          <span>Số sản phẩm</span>
          <strong>{totalItems}</strong>
        </div>

        <div>
          <span>Xu hướng tăng</span>
          <strong className="summary-up">{upCount}</strong>
        </div>

        <div>
          <span>Xu hướng giảm</span>
          <strong className="summary-down">{downCount}</strong>
        </div>

        <div>
          <span>Đi ngang</span>
          <strong className="summary-sideway">{sidewayCount}</strong>
        </div>
      </section>

      <div className="forecast-list-head">
        <p>
          Hiển thị <strong>{pagedForecasts.length}</strong> /{" "}
          <strong>{totalItems}</strong> sản phẩm dự đoán
        </p>

        <span>
          Trang {page} / {totalPages}
        </span>
      </div>

      {pagedForecasts.length === 0 ? (
        <div className="forecast-empty">Không có dữ liệu dự đoán phù hợp.</div>
      ) : (
        <section className="forecast-grid-list">
          {pagedForecasts.map((forecast, index) => {
            const companyCode = forecast.company_code || forecast.company_name || "GOLD";
            const probability = forecast.probability || {};
            const confidence =
              forecast.trend === "up"
                ? probability.up
                : forecast.trend === "down"
                ? probability.down
                : probability.sideway;

            return (
              <article
                key={`${forecast.company_id}-${forecast.gold_name}-${forecast.area}-${index}`}
                className="forecast-item-card"
              >
                <div className="forecast-top-line" />

                <div className="forecast-card-header">
                  <div className="forecast-card-info">
                    <span className="forecast-badge">{companyCode}</span>
                    <h3>{forecast.gold_name}</h3>
                    <p>{forecast.company_name}</p>
                    <p>Khu vực: {forecast.area || "-"}</p>
                  </div>

                  <div className="forecast-confidence-box">
                    <span>Độ tin cậy</span>
                    <strong>{formatPercent(confidence)}%</strong>
                  </div>
                </div>

                <div className={`forecast-trend ${getTrendClass(forecast.trend)}`}>
                  {forecast.trend === "up" ? "▲" : forecast.trend === "down" ? "▼" : "●"}{" "}
                  {getTrendText(forecast.trend)}
                </div>

                <div className="forecast-value-grid">
                  <div className="forecast-value-card">
                    <p>Giá mua hiện tại</p>
                    <strong className="forecast-current-price">
                      {formatCurrency(forecast.current_buy_price)}
                    </strong>
                  </div>

                  <div className="forecast-value-card">
                    <p>Giá bán hiện tại</p>
                    <strong className="forecast-current-price">
                      {formatCurrency(forecast.current_sell_price)}
                    </strong>
                  </div>

                  <div className="forecast-value-card forecast-buy-box">
                    <p>Giá mua dự kiến</p>
                    <strong className="forecast-buy-price">
                      {formatCurrency(forecast.forecast_buy_price)}
                    </strong>

                    <div className="forecast-change-line">
                      <small className={getChangeClass(forecast.buy_change)}>
                        {formatChange(forecast.buy_change)}
                      </small>
                      <em className={getChangeClass(forecast.buy_change_percent)}>
                        {formatChange(forecast.buy_change_percent)}%
                      </em>
                    </div>
                  </div>

                  <div className="forecast-value-card forecast-sell-box">
                    <p>Giá bán dự kiến</p>
                    <strong className="forecast-sell-price">
                      {formatCurrency(forecast.forecast_sell_price)}
                    </strong>

                    <div className="forecast-change-line">
                      <small className={getChangeClass(forecast.sell_change)}>
                        {formatChange(forecast.sell_change)}
                      </small>
                      <em className={getChangeClass(forecast.sell_change_percent)}>
                        {formatChange(forecast.sell_change_percent)}%
                      </em>
                    </div>
                  </div>
                </div>

                <div className="forecast-note">
                  Dự báo dựa trên mô hình {forecast.model?.price_model || "AI"}.
                </div>
              </article>
            );
          })}
        </section>
      )}

      {totalPages > 1 && (
        <div className="forecast-pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            ←
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;

            return (
              <button
                key={pageNumber}
                className={page === pageNumber ? "active" : ""}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            →
          </button>
        </div>
      )}
    </main>
  );
}