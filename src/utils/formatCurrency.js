export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toLocaleString("vi-VN")} đ`;
}
// export function formatChange(value) {
//   if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
//   const sign = Number(value) > 0 ? "+" : "";
//   return `${sign}${Number(value).toLocaleString("vi-VN")}`;
// }

export function formatChange(value) {
  const number = Number(value || 0);

  if (!number) return "0";

  const absText = Math.abs(number).toLocaleString("vi-VN");

  return number > 0 ? `▲ ${absText}` : `▼ ${absText}`;
}

export function getChangeClass(value) {
  const number = Number(value || 0);

  if (number > 0) return "change-up";
  if (number < 0) return "change-down";

  return "change-zero";
}

// export function getChangeClass(value) {
//   return Number(value) >= 0 ? "text-green" : "text-red";
// }
