"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const LIGHT_URL =
  "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=445267&theme=light";
const DARK_URL =
  "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=445267&theme=dark";

const ProductHuntWidget = () => {
  const { resolvedTheme } = useTheme();
  const [src, setSrc] = useState(LIGHT_URL);

  // Only update src when theme changes — no infinite loop
  useEffect(() => {
    setSrc(resolvedTheme === "dark" ? DARK_URL : LIGHT_URL);
  }, [resolvedTheme]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Blink Eye - Featured on Product Hunt"
      width={250}
      height={54}
      loading="lazy"
      className="h-[54px] w-auto"
    />
  );
};

export default ProductHuntWidget;