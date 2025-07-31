import { Metadata } from 'next';

interface SeoOptions {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  breadcrumbs?: Array<{name: string; url: string}>;
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
  breadcrumbs = [],
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
      'application/ld+json': JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'JoinSangha',
          url: defaultUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${defaultUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'JoinSangha',
          url: url,
          logo: {
            '@type': 'ImageObject',
            url: `${defaultUrl}${image}`,
          },
          description: defaultDescription,
          foundingDate: '2024',
          sameAs: [
            'https://twitter.com/joinsangha',
            'https://facebook.com/joinsangha',
            'https://instagram.com/joinsangha',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: 'English',
          },
        },
        ...(breadcrumbs.length > 0 ? [{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: `${defaultUrl}${crumb.url}`,
          })),
        }] : []),
      ]),
    },
  };
} 