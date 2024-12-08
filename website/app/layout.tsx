import { Viewport } from "next";
import "@/styles/globals.css";

type RootLayoutProps = {
  children: React.ReactNode;
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF" },
    { media: "(prefers-color-scheme: dark)", color: "000" },
  ],
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return <>{children}</>;
};

export default RootLayout;
