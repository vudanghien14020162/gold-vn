import React from "react";
import { newsApi } from "../../api/newsApi";
import { useAsync } from "../../hooks/useAsync";
import Loading from "../../components/Loading/Loading";
import "./NewsPage.css";
export default function NewsPage() {
  const news = useAsync(() => newsApi.getNews(), []);
  if (news.loading) return <Loading />;
  return (
    <main className="news-page">
      <h2>Tin tức thị trường vàng</h2>
      <div className="news-list">
        {news.data.map((i) => (
          <article className="panel news-card" key={i.id}>
            <small>{i.publishedAt}</small>
            <h3>{i.title}</h3>
            <p>{i.summary}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
