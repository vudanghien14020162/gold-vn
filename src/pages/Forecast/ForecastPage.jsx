import React, { useMemo, useState } from "react";
import { goldMockData } from "../../data/goldMockData";
import {
  formatChange,
  formatCurrency,
  getChangeClass,
} from "../../utils/formatCurrency";
import "./ForecastPage.css";

const PAGE_SIZE = 8;

export default function ForecastPage() {
  const [companyId, setCompanyId] = useState("1");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const companies = goldMockData.companies;
  const forecastsSource = goldMockData.forecasts || [];

  const forecasts = useMemo(() => {
    return forecastsSource.filter(
      (item) => String(item.companyId) === String(companyId)
    );
  }, [companyId, forecastsSource]);

  const filteredForecasts = useMemo(() => {
    const cleanKeyword = keyword.trim().toLowerCase();

    if (!cleanKeyword) return forecasts;

    return forecasts.filter((item) =>
      item.goldTypeName.toLowerCase().includes(cleanKeyword)
    );
  }, [forecasts, keyword]);

  const totalItems = filteredForecasts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const pagedForecasts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredForecasts.slice(start, start + PAGE_SIZE);
  }, [filteredForecasts, page]);

  const upCount = filteredForecasts.filter((item) => item.trend === "UP").length;
  const downCount = filteredForecasts.filter((item) => item.trend === "DOWN").length;

  const selectedCompany = companies.find(
    (item) => String(item.id) === String(companyId)
  );

  const handleCompanyChange = (event) => {
    setCompanyId(event.target.value);
    setKeyword("");
    setPage(1);
  };

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value);
    setPage(1);
  };

  return (
    <main className="forecast-page">
      <div className="forecast-page-title">
        <h2>Dự đoán giá vàng theo từng loại</h2>
        <span />
      </div>

      <div className="forecast-filter-bar">
        <div className="forecast-filter-item">
          <label>Công ty</label>

          <select value={companyId} onChange={handleCompanyChange}>
            {companies.map((company) => (
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
            placeholder="Ví dụ: nhẫn, nữ trang, vàng miếng..."
          />
        </div>
      </div>

      <section className="forecast-summary-panel">
        <div>
          <span>Công ty</span>
          <strong>{selectedCompany?.name || "-"}</strong>
        </div>

        <div>
          <span>Số loại vàng</span>
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
          {pagedForecasts.map((forecast) => (
            <article
              key={`${forecast.companyId}-${forecast.goldType}`}
              className="forecast-item-card"
            >
              <div className="forecast-card-header">
                <div>
                  <span className="forecast-badge">{forecast.companyCode}</span>

                  <h3>{forecast.goldTypeName}</h3>

                  <p>{forecast.companyName}</p>
                  <p>Ngày dự đoán: {forecast.date}</p>
                </div>

                <div className="forecast-confidence-box">
                  <span>Độ tin cậy</span>
                  <strong>{forecast.confidence}%</strong>
                </div>
              </div>

              <div
                className={`forecast-trend ${
                  forecast.trend === "UP" ? "trend-up" : "trend-down"
                }`}
              >
                {forecast.trend === "UP"
                  ? "▲ Xu hướng tăng"
                  : "▼ Xu hướng giảm"}
              </div>

              <div className="forecast-value-grid">
                <div className="forecast-value-card">
                  <p>Giá mua dự kiến</p>

                  <strong className="price-buy">
                    {formatCurrency(forecast.buy)}
                  </strong>

                  <small className={getChangeClass(forecast.buyChange)}>
                    {formatChange(forecast.buyChange)}
                  </small>
                </div>

                <div className="forecast-value-card">
                  <p>Giá bán dự kiến</p>

                  <strong className="price-sell">
                    {formatCurrency(forecast.sell)}
                  </strong>

                  <small className={getChangeClass(forecast.sellChange)}>
                    {formatChange(forecast.sellChange)}
                  </small>
                </div>
              </div>

              <div className="forecast-note">{forecast.note}</div>
            </article>
          ))}
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