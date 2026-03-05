import React from 'react'
import { useTranslations } from 'next-intl';

const SupportedPlatforms = () => {
    const t = useTranslations("DownloadApp");
    return (
        <p className="text-gray-500 dark:text-zinc-500 text-sm text-center transition-colors duration-300">
            {t("supportedPlatforms")}
        </p>
    )
}

export default SupportedPlatforms