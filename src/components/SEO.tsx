import { Helmet } from "react-helmet-async";

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    // Open Graph
    ogType?: "website" | "article";
    ogImage?: string;
    // Twitter
    twitterCard?: string;
    // Structured Data (JSON-LD)
    structuredData?: Record<string, any>;
}

export const SEO = ({ title, description, canonical, ogType = "website", ogImage = "https://sl2.my.id/og-image.webp", twitterCard = "summary_large_image", structuredData }: SEOProps) => {
    const siteName = "ShortLink";
    const fullTitle = `${title} | ${siteName}`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph */}
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            {canonical && <meta property="og:url" content={canonical} />}

            {/* Twitter */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Structured Data */}
            {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
        </Helmet>
    );
};
