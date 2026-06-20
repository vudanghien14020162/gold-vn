import "./PriceTableSkeleton.css";

export default function PriceTableSkeleton({ rows = 8 }) {
  return (
    <div className="price-table-skeleton">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="price-skeleton-row">
          <div className="price-skeleton-info">
            <div className="skeleton-line skeleton-title shimmer" />
            <div className="skeleton-line skeleton-subtitle shimmer" />
          </div>

          <div className="price-skeleton-value">
            <div className="skeleton-line skeleton-label shimmer" />
            <div className="skeleton-line skeleton-money shimmer" />
            <div className="skeleton-line skeleton-chip shimmer" />
          </div>

          <div className="price-skeleton-value">
            <div className="skeleton-line skeleton-label shimmer" />
            <div className="skeleton-line skeleton-money shimmer" />
            <div className="skeleton-line skeleton-chip shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}