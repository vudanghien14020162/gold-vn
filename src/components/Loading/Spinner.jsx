import "./Spinner.css";

export default function Spinner({ text = "Đang tải dữ liệu..." }) {
  return (
    <div className="app-spinner">
      <div className="app-spinner-icon" />
      <span>{text}</span>
    </div>
  );
}