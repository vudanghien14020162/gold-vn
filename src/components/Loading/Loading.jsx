import React from "react";import "./Loading.css";export default function Loading({text="Đang tải dữ liệu..."}){return <div className="loading-box"><div className="spinner"/><p>{text}</p></div>}
