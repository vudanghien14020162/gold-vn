import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  Download,
  Headphones,
  Info,
  Lightbulb,
  Mic,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  Settings,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { ttsTelegramApi } from "../../api/ttsTelegramApi";
import Loading from "../../components/Loading/Loading";
import "./TtsTelegramPage.css";

const SPEED_OPTIONS = [
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
];

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minute = Math.floor(seconds / 60);
  const second = Math.floor(seconds % 60);

  return `${minute}:${String(second).padStart(2, "0")}`;
}

function getVoiceName(voice) {
  return voice?.name || "-";
}

export default function TtsTelegramPage() {
  const audioRef = useRef(null);

  const [companies, setCompanies] = useState([]);
  const [voices, setVoices] = useState([]);

  const [companyId, setCompanyId] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [speed, setSpeed] = useState(1);

  const [audioInfo, setAudioInfo] = useState(null);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const selectedCompany = useMemo(() => {
    return companies.find((item) => String(item.id) === String(companyId));
  }, [companies, companyId]);

  const selectedVoice = useMemo(() => {
    return voices.find((item) => item.id === voiceId);
  }, [voices, voiceId]);

  const audioVoice = useMemo(() => {
    return voices.find((item) => item.speakerId === audioInfo?.speaker);
  }, [voices, audioInfo]);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const loadAudioToPlayer = () => {
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.playbackRate = Number(speed);
      }
    }, 80);
  };

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);

        const [companyList, voiceList] = await Promise.all([
          ttsTelegramApi.getCompanies(),
          ttsTelegramApi.getVoices(),
        ]);

        setCompanies(companyList);
        setVoices(voiceList);

        if (companyList[0]?.id) setCompanyId(String(companyList[0].id));
        if (voiceList[0]?.id) setVoiceId(voiceList[0].id);
      } catch (error) {
        console.error(error);
        setMessage(error?.message || "Không tải được cấu hình đọc.");
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  useEffect(() => {
    if (!companyId) return;

    async function loadLatest() {
      try {
        setLoadingLatest(true);
        setMessage("Đang lấy MP3 đồng bộ cuối cùng...");

        const latestAudio = await ttsTelegramApi.getLatest(companyId);

        setAudioInfo(latestAudio);
        setPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setMessage("Đã lấy MP3 đồng bộ cuối cùng.");

        loadAudioToPlayer();
      } catch (error) {
        console.error(error);
        setAudioInfo(null);
        setPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setMessage("Công ty này chưa có MP3 đồng bộ cuối cùng.");
      } finally {
        setLoadingLatest(false);
      }
    }

    loadLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = Number(speed);
    }
  }, [speed, audioInfo]);

  const handleGenerateMp3 = async () => {
    try {
      if (!companyId || !voiceId) {
        setMessage("Vui lòng chọn công ty và giọng đọc.");
        return;
      }

      setGenerating(true);
      setMessage("Đang tạo MP3 và gửi lên Telegram...");

      const audio = await ttsTelegramApi.generateMp3({
        companyId,
        speaker: voiceId,
      });

      setAudioInfo(audio);

      setPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setMessage("Tạo MP3 và gửi Telegram thành công.");

      loadAudioToPlayer();
    } catch (error) {
      console.error(error);
      setMessage(error?.message || "Tạo MP3 thất bại.");
    } finally {
      setGenerating(false);
    }
  };

  const handleLoadLatest = async () => {
    if (!companyId) return;

    try {
      setLoadingLatest(true);
      setMessage("Đang lấy MP3 đồng bộ cuối cùng...");

      const latestAudio = await ttsTelegramApi.getLatest(companyId);

      setAudioInfo(latestAudio);
      setPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setMessage("Đã lấy MP3 đồng bộ cuối cùng.");

      loadAudioToPlayer();
    } catch (error) {
      console.error(error);
      setMessage("Công ty này chưa có MP3 đồng bộ cuối cùng.");
    } finally {
      setLoadingLatest(false);
    }
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || !audioInfo?.audioUrl) return;

    try {
      audioRef.current.playbackRate = Number(speed);

      if (audioRef.current.paused) {
        await audioRef.current.play();
        setPlaying(true);
      } else {
        audioRef.current.pause();
        setPlaying(false);
      }
    } catch (error) {
      console.error(error);
      setMessage("Không phát được MP3 từ server.");
    }
  };

  const handleRestart = async () => {
    if (!audioRef.current || !audioInfo?.audioUrl) return;

    try {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      await audioRef.current.play();
      setPlaying(true);
    } catch (error) {
      console.error(error);
      setMessage("Không quay lại từ đầu được.");
    }
  };

  const handleSeek = (event) => {
    const nextTime = Number(event.target.value);

    if (!audioRef.current) return;

    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleSkip = (seconds) => {
    if (!audioRef.current) return;

    const nextTime = Math.min(
      Math.max(audioRef.current.currentTime + seconds, 0),
      duration || 0
    );

    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleDownloadMp3 = async () => {
    if (!audioInfo?.audioUrl) {
      setMessage("Chưa có MP3 để tải.");
      return;
    }

    try {
      const response = await fetch(audioInfo.audioUrl);
      const blob = await response.blob();
      const fileName = audioInfo.fileName || "gold-price.mp3";

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);

      setMessage("Đang tải MP3 về máy.");
    } catch (error) {
      console.error(error);
      setMessage("Không tải được MP3.");
    }
  };

  const handleShareTelegram = async () => {
    if (!audioInfo?.audioUrl) {
      setMessage("Chưa có MP3 để chia sẻ.");
      return;
    }

    try {
      const response = await fetch(audioInfo.audioUrl);
      const blob = await response.blob();

      const file = new File([blob], audioInfo.fileName || "gold-price.mp3", {
        type: "audio/mpeg",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "MP3 giá vàng",
          text: "Chia sẻ MP3 giá vàng",
          files: [file],
        });

        setMessage("Đã mở màn hình chia sẻ.");
        return;
      }

      const shareUrl = encodeURIComponent(audioInfo.audioUrl);
      const shareText = encodeURIComponent(
        `MP3 giá vàng: ${audioInfo.fileName || ""}`
      );

      window.open(
        `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
        "_blank"
      );

      setMessage("Đã mở Telegram để chia sẻ link MP3.");
    } catch (error) {
      console.error(error);
      setMessage("Không chia sẻ được MP3.");
    }
  };

  const handleEnded = () => {
    setPlaying(false);
  };

  if (loading) return <Loading />;

  return (
    <main className="tts-page">
      <div className="tts-page-header">
        <span className="tts-kicker">
          <Headphones size={22} />
          Telegram Audio
        </span>

        <h2>Đọc giá vàng & gửi MP3 Telegram</h2>

        <p>
          Lấy MP3 đồng bộ cuối cùng, tạo MP3 mới và nghe trực tiếp trên giao
          diện.
        </p>
      </div>

      <section className="tts-layout">
        <aside className="tts-control-card">
          <h3>
            <Settings size={32} />
            Cấu hình đọc
          </h3>

          <div className="tts-form-grid">
            <label>
              Công ty

              <div className="tts-select-wrap company-select-wrap">
                {selectedCompany?.icon && (
                  <img
                    className="tts-company-logo"
                    src={selectedCompany.icon}
                    alt={selectedCompany.code}
                  />
                )}

                <select
                  value={companyId}
                  onChange={(event) => setCompanyId(event.target.value)}
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.code} - {company.name}
                    </option>
                  ))}
                </select>

                <ChevronDown size={18} />
              </div>
            </label>

            <p className="tts-field-help">
              Chọn công ty để lấy MP3 đồng bộ cuối cùng.
            </p>

            <label>
              Giọng đọc

              <div className="tts-select-wrap voice-select-wrap">
                <Mic size={26} className="tts-select-icon" />

                <select
                  value={voiceId}
                  onChange={(event) => setVoiceId(event.target.value)}
                >
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {getVoiceName(voice)}
                    </option>
                  ))}
                </select>

                <ChevronDown size={18} />
              </div>
            </label>

            <p className="tts-field-help">Chọn giọng đọc để tạo MP3 mới.</p>
          </div>

          <div className="tts-actions">
            <button
              type="button"
              className="tts-create-btn"
              onClick={handleGenerateMp3}
              disabled={generating || !companyId || !voiceId}
            >
              <Mic size={22} />
              {generating ? "Đang tạo..." : "Tạo & gửi Telegram"}
            </button>

            <button
              type="button"
              className="tts-latest-btn"
              onClick={handleLoadLatest}
              disabled={loadingLatest || !companyId}
            >
              <RefreshCw size={24} />
              {loadingLatest ? "Đang lấy..." : "MP3 mới nhất"}
            </button>
          </div>

          {message && (
            <p className="tts-message">
              <CheckCircle size={24} />
              {message}
            </p>
          )}

          <div className="tts-help-box">
            <strong>
              <Info size={22} />
              MP3 mới nhất là gì?
            </strong>

            <p>Lấy file MP3 đồng bộ gần nhất của công ty đang chọn.</p>
            <p>Dùng để nghe nhanh nội dung đã được tạo trước đó.</p>
          </div>
        </aside>

        <section className="music-player-card">
          <div className="music-main">
            <div className="music-top-row">
              <span className="music-label">
                {loadingLatest ? "Đang tải MP3..." : "MP3 mới nhất"}
              </span>
            </div>

            <h3>
              {audioInfo?.fileName ||
                (loadingLatest
                  ? "Đang lấy MP3 mới nhất..."
                  : "Chưa có file MP3")}
            </h3>

            <p className="music-desc">
              {audioInfo
                ? `${audioInfo.syncTimeText || "MP3 mới nhất"} • Giọng đọc: ${
                    audioVoice?.name || audioInfo.speaker || "-"
                  }`
                : "Chọn công ty để lấy MP3 đồng bộ cuối cùng"}
            </p>

            <audio
              ref={audioRef}
              preload="metadata"
              onLoadedMetadata={() => {
                setDuration(audioRef.current?.duration || 0);

                if (audioRef.current) {
                  audioRef.current.playbackRate = Number(speed);
                }
              }}
              onTimeUpdate={() =>
                setCurrentTime(audioRef.current?.currentTime || 0)
              }
              onEnded={handleEnded}
              onError={() => setMessage("Không load được MP3 từ server.")}
            >
              {audioInfo?.audioUrl && (
                <source src={audioInfo.audioUrl} type="audio/mpeg" />
              )}
            </audio>

            <div className="zing-player">
              <div className="zing-controls">
                <div className="player-speed">
                  <select
                    value={speed}
                    onChange={(event) => setSpeed(Number(event.target.value))}
                    disabled={!audioInfo}
                    title="Tốc độ phát"
                  >
                    {SPEED_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={14} />
                </div>

                <button
                  type="button"
                  onClick={() => handleSkip(-5)}
                  disabled={!audioInfo}
                  title="Lùi 5 giây"
                >
                  <SkipBack size={28} fill="currentColor" />
                </button>

                <button
                  type="button"
                  className="zing-play-btn"
                  onClick={handlePlayPause}
                  disabled={!audioInfo}
                  title="Phát / Dừng"
                >
                  {playing ? (
                    <Pause size={34} fill="currentColor" />
                  ) : (
                    <Play size={36} fill="currentColor" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSkip(5)}
                  disabled={!audioInfo}
                  title="Tua 5 giây"
                >
                  <SkipForward size={28} fill="currentColor" />
                </button>

                <button
                  type="button"
                  onClick={handleRestart}
                  disabled={!audioInfo}
                  title="Quay lại từ đầu"
                >
                  <RotateCcw size={28} />
                </button>
              </div>

              <div className="zing-seek-row">
                <span>{formatTime(currentTime)}</span>

                <input
                  className="zing-seekbar"
                  style={{ "--progress": `${progress}%` }}
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={!audioInfo}
                />

                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="music-player-actions">
              <button
                type="button"
                className="download-mp3-btn"
                disabled={!audioInfo?.audioUrl}
                onClick={handleDownloadMp3}
              >
                <Download size={42} />

                <div>
                  <strong>Tải MP3</strong>
                  <small>Tải file về máy</small>
                </div>
              </button>

              <button
                type="button"
                className="share-telegram-btn"
                disabled={!audioInfo?.audioUrl}
                onClick={handleShareTelegram}
              >
                <Send size={44} fill="currentColor" />

                <div>
                  <strong>Chia sẻ đến Telegram</strong>
                  <small>Gửi file MP3 này qua Telegram</small>
                </div>
              </button>
            </div>
          </div>

          <div className="tts-tip-box">
            <Lightbulb size={32} />

            <p>
              <strong>Mẹo:</strong> Bạn có thể tạo MP3 mới với giọng đọc khác
              hoặc lấy lại MP3 đồng bộ mới nhất để nghe.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}