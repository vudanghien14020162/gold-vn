import "./HistorySkeleton.css";

export default function HistorySkeleton() {
  return (
    <>
      <div className="history-chart-skeleton">
        <div className="history-skeleton-title shimmer" />
        <div className="history-skeleton-subtitle shimmer" />

        <div className="history-skeleton-chart">
          {[0, 1, 2, 3, 4].map((item) => (
            <span key={item} />
          ))}

          <div className="history-skeleton-line line-one shimmer" />
          <div className="history-skeleton-line line-two shimmer" />
        </div>

        <div className="history-skeleton-legend">
          <div className="history-skeleton-chip shimmer" />
          <div className="history-skeleton-chip shimmer" />
        </div>
      </div>

      <div className="history-table-skeleton">
        <div className="history-table-skeleton-head">
          <div className="history-skeleton-title small shimmer" />
          <div className="history-skeleton-chip shimmer" />
        </div>

        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="history-skeleton-row">
            <div className="history-skeleton-cell shimmer" />
            <div className="history-skeleton-cell shimmer" />
            <div className="history-skeleton-cell shimmer" />
            <div className="history-skeleton-cell shimmer" />
            <div className="history-skeleton-cell shimmer" />
          </div>
        ))}
      </div>
    </>
  );
}