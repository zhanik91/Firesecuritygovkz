import React, { useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  structuredData?: object;
  noindex?: boolean;
}

export default function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  noindex = false
}: SEOHeadProps) {
  const { language } = useLanguage();

  const defaultSEO = {
    ru: {
      siteName: 'Fire Safety KZ - Пожарная безопасность Казахстана',
      defaultDescription: 'Комплексная платформа пожарной безопасности Казахстана с профессиональными услугами, документацией, калькуляторами и образовательными материалами.',
      defaultKeywords: 'пожарная безопасность, Казахстан, огнетушители, пожарная охрана, НПБ, калькуляторы, документы'
    },
    kz: {
      siteName: 'Fire Safety KZ - Қазақстанның өрт қауіпсіздігі',
      defaultDescription: 'Қазақстанның өрт қауіпсіздігінің кешенді платформасы кәсіби қызметтермен, құжаттамамен, калькуляторлармен және білім беру материалдарымен.',
      defaultKeywords: 'өрт қауіпсіздігі, Қазақстан, өрт сөндіргіштер, өрт қауіпсіздік қызметі, НПБ, калькуляторлар, құжаттар'
    }
  };

  const seo = defaultSEO[language];
  
  const finalTitle = title ? `${title} | ${seo.siteName}` : seo.siteName;
  const finalDescription = description || seo.defaultDescription;
  const finalKeywords = keywords || seo.defaultKeywords;
  const finalCanonical = canonical || window.location.href;
  const finalOgImage = ogImage || '/images/og-fire-safety-kz.jpg';

  useEffect(() => {
    // Устанавливаем title
    document.title = finalTitle;

    // Удаляем существующие meta теги
    const existingMetas = document.querySelectorAll('meta[data-seo]');
    existingMetas.forEach(meta => meta.remove());

    const existingLinks = document.querySelectorAll('link[data-seo]');
    existingLinks.forEach(link => link.remove());

    const existingScripts = document.querySelectorAll('script[data-seo]');
    existingScripts.forEach(script => script.remove());

    // Добавляем новые meta теги
    const metaTags = [
      { name: 'description', content: finalDescription },
      { name: 'keywords', content: finalKeywords },
      { name: 'author', content: 'Fire Safety KZ' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { httpEquiv: 'content-language', content: language === 'kz' ? 'kk' : 'ru' },
      
      // Open Graph
      { property: 'og:title', content: ogTitle || finalTitle },
      { property: 'og:description', content: ogDescription || finalDescription },
      { property: 'og:image', content: finalOgImage },
      { property: 'og:url', content: finalCanonical },
      { property: 'og:type', content: ogType },
      { property: 'og:site_name', content: seo.siteName },
      { property: 'og:locale', content: language === 'kz' ? 'kk_KZ' : 'ru_RU' },
      
      // Twitter
      { name: 'twitter:card', content: twitterCard },
      { name: 'twitter:title', content: ogTitle || finalTitle },
      { name: 'twitter:description', content: ogDescription || finalDescription },
      { name: 'twitter:image', content: finalOgImage },
      
      // Дополнительные SEO теги
      { name: 'theme-color', content: '#0040CC' },
      { name: 'msapplication-TileColor', content: '#0040CC' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'format-detection', content: 'telephone=no' },
    ];

    if (noindex) {
      metaTags.push({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      metaTags.push(
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' }
      );
    }

    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('data-seo', 'true');
      
      Object.entries(tag).forEach(([key, value]) => {
        meta.setAttribute(key, value);
      });
      
      document.head.appendChild(meta);
    });

    // Canonical link
    const canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('data-seo', 'true');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = finalCanonical;
    document.head.appendChild(canonicalLink);

    // Hreflang links для мультиязычности
    const hreflangLinks = [
      { hreflang: 'ru', href: finalCanonical.replace(/[?&]lang=kz/, '') },
      { hreflang: 'kk', href: finalCanonical + (finalCanonical.includes('?') ? '&' : '?') + 'lang=kz' },
      { hreflang: 'x-default', href: finalCanonical.replace(/[?&]lang=kz/, '') }
    ];

    hreflangLinks.forEach(link => {
      const hreflangLink = document.createElement('link');
      hreflangLink.setAttribute('data-seo', 'true');
      hreflangLink.rel = 'alternate';
      hreflangLink.hreflang = link.hreflang;
      hreflangLink.href = link.href;
      document.head.appendChild(hreflangLink);
    });

    // Structured Data (JSON-LD)
    if (structuredData) {
      const script = document.createElement('script');
      script.setAttribute('data-seo', 'true');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Общие Structured Data для организации
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": seo.siteName,
      "url": "https://firesafety.kz",
      "logo": "https://firesafety.kz/images/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+7-727-123-45-67",
        "contactType": "Customer Service",
        "availableLanguage": ["Russian", "Kazakh"]
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "KZ",
        "addressLocality": "Алматы"
      },
      "sameAs": [
        "https://www.facebook.com/firesafetykz",
        "https://www.linkedin.com/company/firesafetykz"
      ]
    };

    const orgScript = document.createElement('script');
    orgScript.setAttribute('data-seo', 'true');
    orgScript.type = 'application/ld+json';
    orgScript.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

  }, [finalTitle, finalDescription, finalKeywords, finalCanonical, language, structuredData, noindex, ogTitle, ogDescription, finalOgImage, ogType, twitterCard]);

  return null; // Этот компонент не рендерит ничего видимого
}