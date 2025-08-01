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
const defaultUrl = 'https://www.joinsangha.com';
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
    other: {},
  };
}

export function StructuredData({ data }: { data: Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

export function getStructuredData() {
  const defaultUrl = 'https://www.joinsangha.com';
  const defaultDescription = 'JoinSangha Meditation Platform — Connect with meditation communities, discover mindfulness practices, and build deeper spiritual connections.';
  
  return [
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
          url: defaultUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${defaultUrl}/joinsangha-logo.svg`,
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
          '@type': 'ItemList',
          name: 'Main Navigation',
          itemListElement: [
            {
              '@type': 'SiteNavigationElement',
              position: 1,
              name: 'Download App',
              description: 'Download the JoinSangha meditation app for iOS and Android',
              url: `${defaultUrl}/download`,
            },
            {
              '@type': 'SiteNavigationElement',
              position: 2,
              name: 'Merchandise',
              description: 'Explore mindfulness merchandise and meditation accessories',
              url: `${defaultUrl}/merchandise`,
            },
            {
              '@type': 'SiteNavigationElement',
              position: 3,
              name: 'Partnership',
              description: 'Partner with JoinSangha to spread mindfulness',
              url: `${defaultUrl}/partnership`,
            },
            {
              '@type': 'SiteNavigationElement',
              position: 4,
              name: 'Career',
              description: 'Join our team and help build the future of meditation',
              url: `${defaultUrl}/career`,
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${defaultUrl}/download`,
          name: 'Download App',
          description: 'Download the JoinSangha meditation app for iOS and Android',
          url: `${defaultUrl}/download`,
          mainEntity: {
            '@type': 'SoftwareApplication',
            name: 'JoinSangha',
            applicationCategory: 'HealthApplication',
            operatingSystem: 'iOS, Android',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${defaultUrl}/merchandise`,
          name: 'Merchandise',
          description: 'Explore mindfulness merchandise and meditation accessories',
          url: `${defaultUrl}/merchandise`,
          mainEntity: {
            '@type': 'Store',
            name: 'JoinSangha Store',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${defaultUrl}/partnership`,
          name: 'Partnership',
          description: 'Partner with JoinSangha to spread mindfulness',
          url: `${defaultUrl}/partnership`,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${defaultUrl}/career`,
          name: 'Career',
          description: 'Join our team and help build the future of meditation',
          url: `${defaultUrl}/career`,
          mainEntity: {
            '@type': 'JobPosting',
            hiringOrganization: {
              '@type': 'Organization',
              name: 'JoinSangha',
            },
          },
        },
      ];
} 