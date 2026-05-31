import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://typingmaster2.vercel.app";
const SITE_NAME = "Typing Master by Vinkal Prajapati";
const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`;

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: "website" | "article";
  breadcrumbs?: { name: string; path: string }[];
  schema?: object | object[];
  noindex?: boolean;
}

const SEO = ({
  title,
  description,
  keywords,
  image = DEFAULT_IMAGE,
  type = "website",
  breadcrumbs,
  schema,
  noindex = false,
}: SEOProps) => {
  const location = useLocation();
  const url = `${SITE_URL}${location.pathname}`;
  const fullTitle = title.includes("Typing Master") ? title : `${title} | Typing Master by Vinkal Prajapati`;

  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: `${SITE_URL}${b.path}`,
    })),
  } : null;

  const schemaArray = [
    breadcrumbSchema,
    ...(Array.isArray(schema) ? schema : schema ? [schema] : []),
  ].filter(Boolean);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {schemaArray.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
