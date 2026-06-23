// import "./SidebarAds.css";

// export default function SidebarAds() {
//   return (
//     <>
//       <aside className="sidebar-ads sidebar-ads-left">
//         <a
//           href="https://s.shopee.vn/4qDTbqjnkY"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <img
//             src="/images/ads/iphone-17-pro-max.png"
//             alt="iPhone 17 Pro Max Shopee"
//           />
//         </a>
//       </aside>

//       <aside className="sidebar-ads sidebar-ads-right">
//         <a
//           href="https://s.shopee.vn/4qDTbqjnkY"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <img
//             src="/images/ads/galaxy-z-fold-7.png"
//             alt="Galaxy Z Fold 7 Shopee"
//           />
//         </a>
//       </aside>
//     </>
//   );
// }

import { useMemo, useState } from "react";
import "./SidebarAds.css";

const ADS = [
  {
    image: "/images/ads/iphone-17-pro-max.png",
    url: "https://s.shopee.vn/link-iphone",
    alt: "iPhone 17 Pro Max Shopee",
  },
  {
    image: "/images/ads/galaxy-z-fold-7.png",
    url: "https://s.shopee.vn/link-samsung",
    alt: "Galaxy Z Fold 7 Shopee",
  },
];

export default function SidebarAds() {
  const [visible, setVisible] = useState(true);

  const mobileAd = useMemo(() => {
    const index = Math.floor(Math.random() * ADS.length);
    return ADS[index];
  }, []);

  if (!visible) return null;

  return (
    <>
      <aside className="sidebar-ads sidebar-ads-left">
        <a href={ADS[0].url} target="_blank" rel="noopener noreferrer">
          <img src={ADS[0].image} alt={ADS[0].alt} />
        </a>
      </aside>

      <aside className="sidebar-ads sidebar-ads-right">
        <a href={ADS[1].url} target="_blank" rel="noopener noreferrer">
          <img src={ADS[1].image} alt={ADS[1].alt} />
        </a>
      </aside>

      <div className="mobile-floating-ads">
        <button
          type="button"
          className="mobile-ads-close"
          onClick={() => setVisible(false)}
          aria-label="Đóng quảng cáo"
        >
          ×
        </button>

        <a href={mobileAd.url} target="_blank" rel="noopener noreferrer">
          <img src={mobileAd.image} alt={mobileAd.alt} />
        </a>
      </div>
    </>
  );
}