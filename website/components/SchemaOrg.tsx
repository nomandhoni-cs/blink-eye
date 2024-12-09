export const SchemaOrg = ({ locale }: { locale: string }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": `https://yourdomain.com/${locale}`,
          "name": "Blink Eye",
          "inLanguage": locale,
          "alternateName": locale === "en" ? "Blink Eye - Eye Care Timer" : "Blink Eye - Temporizador para el cuidado de los ojos",
        }),
      }}
    />
  );
}; 