import "./AffiliateSidebar.css";

export default function AffiliateSidebar() {
  return (
    <>
      <aside className="affiliate-sidebar affiliate-left">
        <a
          href="https://s.shopee.vn/your-aff-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/images/banner-shopee-left.png"
            alt="Shopee Affiliate"
          />
        </a>
      </aside>

      <aside className="affiliate-sidebar affiliate-right">
        <a
          href="https://s.shopee.vn/your-aff-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/images/banner-shopee-right.png"
            alt="Shopee Affiliate"
          />
        </a>
      </aside>
    </>
  );
}