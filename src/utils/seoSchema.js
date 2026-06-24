import { SITE_CONFIG } from "../config/seo.config";

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.siteName,
    url: SITE_CONFIG.domain,
    inLanguage: "vi",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.domain}/bang-gia?keyword={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.siteName,
    url: SITE_CONFIG.domain,
    logo: `${SITE_CONFIG.domain}/icon-512.png`,
  };
}

export function buildBreadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.domain}${item.path}`,
    })),
  };
}

export function buildFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Giá vàng hôm nay được cập nhật từ đâu?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Dữ liệu giá vàng được tổng hợp từ các thương hiệu vàng trong nước như SJC, PNJ, DOJI, BTMC và dữ liệu thị trường thế giới.",
        },
      },
      {
        "@type": "Question",
        name: "Website có dự đoán giá vàng ngày mai không?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Có. Website cung cấp tính năng dự đoán xu hướng giá vàng ngày mai dựa trên dữ liệu lịch sử và các yếu tố thị trường.",
        },
      },
      {
        "@type": "Question",
        name: "Giá vàng thế giới có được cập nhật không?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Có. Website theo dõi các chỉ số như XAU/USD, USD/VND, DXY, dầu Brent, lãi suất FED và VN-Index.",
        },
      },
    ],
  };
}

export function buildDatasetSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Dữ liệu giá vàng hôm nay",
    description:
      "Dữ liệu giá vàng SJC, PNJ, DOJI, BTMC, giá vàng thế giới và lịch sử biến động giá vàng.",
    url: SITE_CONFIG.domain,
    inLanguage: "vi",
  };
}