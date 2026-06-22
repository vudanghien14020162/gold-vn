import React from "react";
import {
  formatChange,
  formatCurrency,
  getChangeClass,
} from "../../utils/formatCurrency";
import "./PriceTable.css";

export default function PriceTable({ prices = [], onSelectItem }) {
  return (
    <div className="price-table-list">
      {prices.map((item) => (
        <article
          key={item.id}
          className="price-card"
          onClick={() => onSelectItem?.(item)}
        >
          <div className="price-card-header">
            <div>
              <h3>{item.name || "-"}</h3>

              <p>
                {item.company || item.companyCode || "SJC"}
                <span>•</span>
                {item.area || "-"}
              </p>
            </div>

            <span className={getChangeClass(item.sellChange)}>
              {formatChange(item.sellChange)}
            </span>
          </div>

          <div className="price-card-prices">
            <div className="price-box">
              <span className="price-label">Mua vào</span>

              <strong className="price-value price-buy">
                {formatCurrency(item.buy)}
              </strong>

              <small className={getChangeClass(item.buyChange)}>
                {formatChange(item.buyChange)}
              </small>
            </div>

            <div className="price-box">
              <span className="price-label">Bán ra</span>

              <strong className="price-value price-sell">
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
  );
}