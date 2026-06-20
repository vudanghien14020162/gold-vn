import React from "react";
import { formatChange, formatCurrency, getChangeClass } from "../../utils/formatCurrency";
import "./GoldCard.css";
export default function GoldCard({ company }) {
  return (
    <article className="gold-card">
      <div className="gold-card-head">
        <div className="company-logo">{company.code}</div>
        <div>
          <h2>{company.code}</h2>
          <p>{company.name}</p>
        </div>
      </div>
      <div className="gold-card-price">
        <div>
          <p>MUA VÀO</p>
          <strong className="price-green price-nowrap">{formatCurrency(company.buy)}</strong>
          <span className={getChangeClass(company.buyChange)}>
            {formatChange(company.buyChange)}
          </span>
        </div>
        <div className="divider" />
        <div>
          <p>BÁN RA</p>
          <strong className="price-gold price-nowrap">{formatCurrency(company.sell)}</strong>
          <span className={getChangeClass(company.sellChange)}>
            {formatChange(company.sellChange)}
          </span>
        </div>
      </div>
    </article>
  );
}
