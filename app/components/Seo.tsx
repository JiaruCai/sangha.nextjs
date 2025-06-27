import { Metadata } from 'next';

interface SeoOptions {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

const defaultTitle = 'JoinSangha – Meditate Anywhere, Connect Everywhere';
const defaultDescription = 'From your quiet corner to the wider world, explore mindfulness practices that ground you—and connections that uplift you.';
const defaultUrl = 'https://joinsangha.com';
const defaultImage = '/joinsangha-logo.svg';

export function generateSeoMetadata({
  title = defaultTitle,
  description = defaultDescription,
  url = defaultUrl,
  image = defaultImage,
}: SeoOptions = {}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      images: [{ url: image }],
      siteName: 'JoinSangha',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@joinsangha',
    },
    other: {
      'application/ld+json': JSON.stringify({
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
    },
  };
} 