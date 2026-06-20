import { CheckCircle, XCircle, Info, Loader2 } from "lucide-react";
import "./Toast.css";

export default function Toast({ type = "info", message, onClose }) {
  if (!message) return null;

  const Icon =
    type === "success"
      ? CheckCircle
      : type === "error"
      ? XCircle
      : type === "loading"
      ? Loader2
      : Info;

  return (
    <div className={`toast toast-${type}`}>
      <Icon className={type === "loading" ? "toast-spin" : ""} size={20} />

      <div>
        <strong>{message.title}</strong>
        {message.description && <p>{message.description}</p>}
      </div>

      <button type="button" onClick={onClose}>
        ×
      </button>
    </div>
  );
}