import Head from 'next/head';

interface SeoProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

const defaultTitle = 'JoinSangha – Meditate Anywhere, Connect Everywhere';
const defaultDescription = 'From your quiet corner to the wider world, explore mindfulness practices that ground you—and connections that uplift you.';
const defaultUrl = 'https://joinsangha.com';
const defaultImage = '/joinsangha-logo.svg';

export default function Seo({
  title = defaultTitle,
  description = defaultDescription,
  url = defaultUrl,
  image = defaultImage,
}: SeoProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="JoinSangha" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@joinsangha" />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'JoinSangha',
            url: url,
            logo: image,
            sameAs: [
              'https://twitter.com/joinsangha',
              'https://facebook.com/joinsangha',
              'https://instagram.com/joinsangha',
            ],
          }),
        }}
      />
    </Head>
  );
} 