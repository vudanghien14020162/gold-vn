import { Helmet } from "react-helmet-async";
import { SITE_CONFIG } from "../../config/seo.config";

export default function SEOHead({
  title,
  description,
  keywords,
  path = "/",
  image,
  type = "website",
  noIndex = false,
  schemas = [],
}) {
  const fullTitle = title
    ? `${title} | ${SITE_CONFIG.siteName}`
    : SITE_CONFIG.siteName;

  const canonicalUrl = `${SITE_CONFIG.domain}${path}`;
  const ogImage = image || SITE_CONFIG.defaultImage;

  return (
    <Helmet>
      <title>{fullTitle}</title>

      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SITE_CONFIG.author} />
      <meta
        name="robots"
        content={
          noIndex
            ? "noindex,nofollow"
            : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        }
      />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:locale" content="vi_VN" />
      <meta property="og:site_name" content={SITE_CONFIG.siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}