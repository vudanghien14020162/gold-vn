import React, { useState } from "react";
import "./ContactPage.css";

const CONTACT_EMAIL = "hienmdbn@gmail.com";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Vui lòng nhập họ tên.");
      return;
    }

    if (!form.email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }

    if (!form.message.trim()) {
      setError("Vui lòng nhập nội dung liên hệ.");
      return;
    }

    const subject = `Liên hệ từ website Giá Vàng - ${form.name}`;

    const body = `
Họ tên: ${form.name}
Email: ${form.email}

Nội dung:
${form.message}
`;

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <span>Liên hệ hỗ trợ</span>
        <h2>Gửi thông tin liên hệ</h2>
        <p>
          Nếu bạn cần góp ý giao diện, báo lỗi dữ liệu giá vàng hoặc yêu cầu hỗ
          trợ tích hợp Telegram, hãy gửi thông tin tại đây.
        </p>
      </section>

      <section className="contact-layout">
        <form className="contact-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ tên</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nhập họ tên của bạn"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
            />
          </div>

          <div className="form-group">
            <label>Nội dung</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Nhập nội dung cần liên hệ..."
              rows={6}
            />
          </div>

          {error && <div className="contact-error">{error}</div>}

          <button type="submit">Gửi liên hệ</button>
        </form>

        <aside className="contact-info-card">
          <div className="contact-icon">✉</div>

          <h3>Thông tin nhận liên hệ</h3>

          <div className="contact-info-item">
            <span>Email nhận</span>
            <strong>{CONTACT_EMAIL}</strong>
          </div>

          <div className="contact-info-item">
            <span>Chủ đề</span>
            <strong>Hỗ trợ website Giá Vàng</strong>
          </div>

          <div className="contact-info-note">
            Khi bấm gửi, hệ thống sẽ mở ứng dụng email trên máy của bạn và tự
            điền sẵn nội dung.
          </div>
        </aside>
      </section>
    </main>
  );
}