import { Metadata } from 'next';

interface SeoOptions {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  breadcrumbs?: Array<{name: string; url: string}>;
}

const defaultTitle = 'JoinSangha - Official Site';
const defaultDescription = 'JoinSangha Meditation Platform — Connect with meditation communities, discover mindfulness practices, and build deeper spiritual connections.';
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
          alternateName: 'JoinSangha - Official Site',
          url: defaultUrl,
          description: defaultDescription,
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
          '@id': `${defaultUrl}/#organization`,
          name: 'JoinSangha',
          url: url,
          logo: {
            '@type': 'ImageObject',
            url: `${defaultUrl}${image}`,
            width: 400,
            height: 400,
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
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Meditation Services',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Meditation Community Access',
                  description: 'Connect with meditation communities worldwide',
                },
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Mindfulness Practices',
                  description: 'Discover guided meditation and mindfulness practices',
                },
              },
            ],
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'SiteNavigationElement',
          name: 'Download App',
          description: 'Download the JoinSangha meditation app for iOS and Android',
          url: `${defaultUrl}/download`,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'SiteNavigationElement',
          name: 'Merchandise',
          description: 'Explore mindfulness merchandise and meditation accessories',
          url: `${defaultUrl}/merchandise`,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'SiteNavigationElement',
          name: 'Partnership',
          description: 'Partner with JoinSangha to spread mindfulness',
          url: `${defaultUrl}/partnership`,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'SiteNavigationElement',
          name: 'Team Blog',
          description: 'Read insights and updates from the JoinSangha team',
          url: `${defaultUrl}/team-blog`,
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