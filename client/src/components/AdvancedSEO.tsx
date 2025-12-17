import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface StructuredDataProps {
  type: 'WebSite' | 'Organization' | 'Article' | 'Product' | 'Service' | 'BreadcrumbList' | 'FAQPage';
  data: Record<string, any>;
}

// Структурированные данные для SEO
export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type as string,
    ...data
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}

// Организационные данные для всего сайта
export function OrganizationSchema() {
  const { language } = useLanguage();
  
  const organizationData = {
    name: language === 'kz' ? 'Өрт Қауіпсіздігі ҚЗ' : 'Fire Safety KZ',
    description: language === 'kz' 
      ? 'Қазақстанның өрт қауіпсіздігі саласындағы жетекші цифрлық платформа'
      : 'Ведущая цифровая платформа пожарной безопасности Казахстана',
    url: 'https://firesafety.kz',
    logo: 'https://firesafety.kz/logo.png',
    sameAs: [
      'https://www.facebook.com/FireSafetyKZ',
      'https://www.linkedin.com/company/fire-safety-kz',
      'https://t.me/FireSafetyKZ'
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KZ',
      addressLocality: language === 'kz' ? 'Алматы' : 'Алматы',
      addressRegion: language === 'kz' ? 'Алматы қаласы' : 'город Алматы'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+7-727-XXX-XXXX',
      contactType: 'customer service',
      availableLanguage: ['Russian', 'Kazakh']
    }
  };

  return <StructuredData type="Organization" data={organizationData} />;
}

// Схема для веб-сайта
export function WebSiteSchema() {
  const { language } = useLanguage();
  
  const websiteData = {
    name: language === 'kz' ? 'Өрт Қауіпсіздігі ҚЗ' : 'Fire Safety KZ',
    description: language === 'kz'
      ? 'Өрт қауіпсіздігі бойынша кешенді цифрлық платформа - маркетплейс, калькуляторлар, құжаттар және оқыту материалдары'
      : 'Комплексная цифровая платформа пожарной безопасности - маркетплейс, калькуляторы, документы и обучающие материалы',
    url: 'https://firesafety.kz',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://firesafety.kz/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: language === 'kz' ? 'Өрт Қауіпсіздігі ҚЗ' : 'Fire Safety KZ'
    }
  };

  return <StructuredData type="WebSite" data={websiteData} />;
}

// Схема для статей/постов
interface ArticleSchemaProps {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  imageUrl?: string;
  url: string;
}

export function ArticleSchema({
  title,
  description,
  author,
  datePublished,
  dateModified,
  imageUrl,
  url
}: ArticleSchemaProps) {
  const { language } = useLanguage();
  
  const articleData = {
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: language === 'kz' ? 'Өрт Қауіпсіздігі ҚЗ' : 'Fire Safety KZ',
      logo: {
        '@type': 'ImageObject',
        url: 'https://firesafety.kz/logo.png'
      }
    },
    datePublished,
    dateModified: dateModified || datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    ...(imageUrl && {
      image: {
        '@type': 'ImageObject',
        url: imageUrl
      }
    })
  };

  return <StructuredData type="Article" data={articleData} />;
}

// Схема для услуг маркетплейса
interface ServiceSchemaProps {
  name: string;
  description: string;
  provider: string;
  price?: number;
  currency?: string;
  category: string;
  location: string;
}

export function ServiceSchema({
  name,
  description,
  provider,
  price,
  currency = 'KZT',
  category,
  location
}: ServiceSchemaProps) {
  const { language } = useLanguage();
  
  const serviceData = {
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider
    },
    serviceType: category,
    areaServed: {
      '@type': 'Place',
      name: location
    },
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency: currency,
        availability: 'https://schema.org/InStock'
      }
    })
  };

  return <StructuredData type="Service" data={serviceData} />;
}

// Breadcrumb схема
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const breadcrumbData = {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return <StructuredData type="BreadcrumbList" data={breadcrumbData} />;
}

// FAQ схема
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const faqData = {
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return <StructuredData type="FAQPage" data={faqData} />;
}

// Компонент для Open Graph мета-тегов
interface OpenGraphProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
}

export function OpenGraphMeta({
  title,
  description,
  url,
  image,
  type = 'website',
  siteName = 'Fire Safety KZ'
}: OpenGraphProps) {
  return (
    <>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Telegram */}
      <meta property="telegram:channel" content="@FireSafetyKZ" />
    </>
  );
}

// Canonical и языковые альтернативы
interface LanguageAlternatesProps {
  canonical: string;
  alternates?: {
    ru: string;
    kz: string;
  };
}

export function LanguageAlternates({ canonical, alternates }: LanguageAlternatesProps) {
  return (
    <>
      <link rel="canonical" href={canonical} />
      {alternates && (
        <>
          <link rel="alternate" hrefLang="ru" href={alternates.ru} />
          <link rel="alternate" hrefLang="kk" href={alternates.kz} />
          <link rel="alternate" hrefLang="x-default" href={alternates.ru} />
        </>
      )}
    </>
  );
}