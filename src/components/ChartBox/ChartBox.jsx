import React, { useState } from "react";
import { goldMockData } from "../../data/goldMockData";
import { formatCurrency } from "../../utils/formatCurrency";
import "./ChartBox.css";

export default function ChartBox() {
  const [selectedDays, setSelectedDays] = useState(7);
  const [hoverPoint, setHoverPoint] = useState(null);

  const data = goldMockData.sjcCharts[selectedDays];
  const latest = data[data.length - 1];

  const width = 420;
  const height = 260;
  const paddingX = 44;
  const paddingTop = 36;
  const paddingBottom = 48;

  const values = data.flatMap((item) => [item.buy, item.sell]);
  const min = Math.min(...values) - 180000;
  const max = Math.max(...values) + 180000;

  const getPoint = (item, key, index) => {
    const x =
      paddingX +
      (index * (width - paddingX * 2)) / Math.max(data.length - 1, 1);

    const chartHeight = height - paddingTop - paddingBottom;

    const y =
      paddingTop +
      ((max - item[key]) * chartHeight) / Math.max(max - min, 1);

    return { x, y };
  };

  const buyPoints = data
    .map((item, index) => {
      const point = getPoint(item, "buy", index);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  const sellPoints = data
    .map((item, index) => {
      const point = getPoint(item, "sell", index);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  const getVisibleDate = (item, index) => {
    if (selectedDays === 7) return item.date;
    if (selectedDays === 15 && index % 2 === 0) return item.date;
    if (selectedDays === 30 && index % 5 === 0) return item.date;
    return "";
  };

  return (
    <section className="panel chart-box">
      <div className="chart-box-header">
        <div>
          <h3>Biểu đồ giá vàng</h3>
          <p>SJC vàng miếng - khu vực Hà Nội</p>
        </div>

        <div className="chart-current">
          <span>Giá bán hiện tại</span>
          <strong>{formatCurrency(latest.sell)}</strong>
        </div>
      </div>

      <div className="chart-tabs">
        {[7, 15, 30].map((days) => (
          <button
            key={days}
            type="button"
            className={selectedDays === days ? "active" : ""}
            onClick={() => {
              setSelectedDays(days);
              setHoverPoint(null);
            }}
          >
            {days} ngày
          </button>
        ))}
      </div>

      <div className="chart-svg-wrap" onMouseLeave={() => setHoverPoint(null)}>
        <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
          {[0, 1, 2, 3, 4].map((row) => (
            <line
              key={row}
              x1={paddingX}
              x2={width - paddingX}
              y1={paddingTop + row * 40}
              y2={paddingTop + row * 40}
              className="grid-line"
            />
          ))}

          <polyline points={buyPoints} className="line-buy" />
          <polyline points={sellPoints} className="line-sell" />

          {data.map((item, index) => {
            const buy = getPoint(item, "buy", index);
            const sell = getPoint(item, "sell", index);

            return (
              <g key={`${item.date}-${index}`}>
                <circle
                  cx={buy.x}
                  cy={buy.y}
                  r="5.5"
                  className="dot-buy chart-hover-dot"
                  onMouseEnter={() => setHoverPoint(item)}
                />

                <circle
                  cx={sell.x}
                  cy={sell.y}
                  r="5.5"
                  className="dot-sell chart-hover-dot"
                  onMouseEnter={() => setHoverPoint(item)}
                />

                <text
                  x={buy.x}
                  y={height - 14}
                  textAnchor="middle"
                  className="axis-label"
                >
                  {getVisibleDate(item, index)}
                </text>
              </g>
            );
          })}
        </svg>

        {hoverPoint && (
          <div className="chart-tooltip">
            <strong>{hoverPoint.date}</strong>
            <p>SJC vàng miếng - Hà Nội</p>

            <div>
              <span>Giá mua</span>
              <b>{formatCurrency(hoverPoint.buy)}</b>
            </div>

            <div>
              <span>Giá bán</span>
              <b>{formatCurrency(hoverPoint.sell)}</b>
            </div>
          </div>
        )}
      </div>

      <div className="chart-legend">
        <span className="legend-buy">Giá mua</span>
        <span className="legend-sell">Giá bán</span>
      </div>
    </section>
  );
}