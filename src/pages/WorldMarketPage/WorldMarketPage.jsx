import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  DollarSign,
  Fuel,
  Globe2,
  Image,
  Landmark,
  Mic,
  RefreshCw,
  Send,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { worldMarketApi } from "../../api/worldMarketApi";
import Loading from "../../components/Loading/Loading";
import WorldHistoryModal from "../../components/WorldHistoryModal/WorldHistoryModal";
import {
  buildWorldText,
  createAndSendWorldImageTelegram,
  sendTelegramText,
} from "../../utils/telegramMaketImage";
import "./WorldMarketPage.css";

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "--";

  return Number(value).toLocaleString("vi-VN", {
    maximumFractionDigits: 2,
  });
}

function formatChange(value) {
  const number = Number(value || 0);

  if (number > 0) return `+${formatNumber(number)}`;
  if (number < 0) return `-${formatNumber(Math.abs(number))}`;

  return "0";
}

function getChangeClass(value) {
  const number = Number(value || 0);

  if (number > 0) return "world-change-up";
  if (number < 0) return "world-change-down";

  return "world-change-zero";
}

function getIcon(key) {
  if (key === "xauusd") return <Globe2 size={24} />;
  if (key === "usd_vnd") return <DollarSign size={24} />;
  if (key === "dxy") return <BarChart3 size={24} />;
  if (key === "fed_rate") return <Landmark size={24} />;
  if (key === "brent_oil") return <Fuel size={24} />;
  if (key === "vnindex") return <TrendingUp size={24} />;

  return <Globe2 size={24} />;
}

export default function WorldMarketPage() {
  const audioRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const updatedAtText = useMemo(() => {
    return items.find((item) => item.updatedAtText)?.updatedAtText || "--";
  }, [items]);

  const loadLatest = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await worldMarketApi.getLatest();

      setItems(data);
    } catch (error) {
      console.error(error);
      setMessage(error?.message || "Không tải được dữ liệu thế giới.");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setMessage("Đang đồng bộ dữ liệu thế giới...");

      const data = await worldMarketApi.sync();

      setItems(data);
      setMessage("Đồng bộ dữ liệu thế giới thành công.");
    } catch (error) {
      console.error(error);
      setMessage(error?.message || "Đồng bộ dữ liệu thế giới thất bại.");
    } finally {
      setSyncing(false);
    }
  };

  const handleSendTextTelegram = async () => {
    try {
      setActionLoading("text");
      setMessage("Đang gửi text Telegram...");

      const text = buildWorldText(items, updatedAtText);

      await sendTelegramText(text);

      setMessage("Đã gửi text Telegram.");
    } catch (error) {
      console.error(error);
      setMessage(error?.message || "Gửi text Telegram thất bại.");
    } finally {
      setActionLoading("");
    }
  };

  const handleSendImageTelegram = async () => {
    try {
      setActionLoading("image");
      setMessage("Đang tạo và gửi ảnh Telegram...");

      await createAndSendWorldImageTelegram(items, updatedAtText);

      setMessage("Đã gửi ảnh Telegram.");
    } catch (error) {
      console.error(error);
      setMessage(error?.message || "Gửi ảnh Telegram thất bại.");
    } finally {
      setActionLoading("");
    }
  };

  const handleGenerateTts = async () => {
    try {
      setActionLoading("tts");
      setMessage("Đang tạo MP3 đọc dữ liệu thế giới...");

      const text = buildWorldTtsText(items, updatedAtText);
      const result = await generateWorldTts(text);

      if (!result.audioUrl) {
        throw new Error("API TTS chưa trả về play_url.");
      }

      setAudioUrl(result.audioUrl);
      setMessage("Đã tạo MP3 đọc dữ liệu thế giới.");

      setTimeout(() => {
        audioRef.current?.load();
        audioRef.current?.play();
      }, 120);
    } catch (error) {
      console.error(error);
      setMessage(error?.message || "Tạo TTS thất bại.");
    } finally {
      setActionLoading("");
    }
  };

  useEffect(() => {
    loadLatest();
  }, []);

  if (loading) return <Loading />;

  return (
    <main className="world-page">
      <div className="world-page-title">
        <h2>Dữ liệu thế giới</h2>
        <span />
      </div>

      <section className="world-toolbar">
        <div className="world-updated-box">
          <span>Cập nhật gần nhất</span>
          <strong>{updatedAtText}</strong>
        </div>

        <button type="button" onClick={handleSync} disabled={syncing}>
          <RefreshCw size={18} className={syncing ? "world-spin" : ""} />
          {syncing ? "Đang đồng bộ..." : "Đồng bộ dữ liệu"}
        </button>

        <button
          type="button"
          className="world-btn-blue"
          onClick={handleSendTextTelegram}
          disabled={!!actionLoading}
        >
          <Send size={18} />
          {actionLoading === "text" ? "Đang gửi..." : "Gửi text Telegram"}
        </button>

        <button
          type="button"
          className="world-btn-green"
          onClick={handleSendImageTelegram}
          disabled={!!actionLoading}
        >
          <Image size={18} />
          {actionLoading === "image" ? "Đang gửi..." : "Gửi ảnh Telegram"}
        </button>

        {/* <button
          type="button"
          className="world-btn-dark"
          onClick={handleGenerateTts}
          disabled={!!actionLoading}
        >
          <Mic size={18} />
          {actionLoading === "tts" ? "Đang tạo..." : "Đọc TTS"}
        </button> */}
      </section>

      {message && <div className="world-message">{message}</div>}

      {audioUrl && (
        <audio className="world-audio" ref={audioRef} controls>
          <source src={audioUrl} type="audio/mpeg" />
        </audio>
      )}

      <section className="world-summary-grid">
        {items.map((item) => {
          const isUp = Number(item.change || 0) > 0;
          const isDown = Number(item.change || 0) < 0;

          return (
            <article
              key={item.key}
              className="world-card"
              onClick={() => setSelectedHistory(item)}
            >
              <div className="world-card-header">
                <div className="world-card-icon">{getIcon(item.key)}</div>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.symbol}</p>
                </div>
              </div>

              <div className="world-value-row">
                <strong>{formatNumber(item.value)}</strong>
                <span>{item.unit}</span>
              </div>

              <div className="world-change-row">
                <span className={getChangeClass(item.change)}>
                  {isUp && <TrendingUp size={15} />}
                  {isDown && <TrendingDown size={15} />}
                  {!isUp && !isDown && <RefreshCw size={13} />}
                  {formatChange(item.change)}
                </span>

                <small className={getChangeClass(item.changePercent)}>
                  {formatChange(item.changePercent)}%
                </small>
              </div>

              <div className="world-card-footer">Nhấn để xem lịch sử</div>
            </article>
          );
        })}
      </section>

      {selectedHistory && (
        <WorldHistoryModal
          item={selectedHistory}
          onClose={() => setSelectedHistory(null)}
        />
      )}
    </main>
  );
}