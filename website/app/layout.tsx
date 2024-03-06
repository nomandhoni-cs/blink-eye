import { Metadata, Viewport } from "next"
import { Inter as FontSans } from "next/font/google"

import { SEO } from "@/configs/seo"
import "@/styles/globals.css"
import { Providers } from "./providers"

import { MediaQueriesDebug } from "@/components/debug/media-queries"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"

const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
})

type RootLayoutProps = {
	children: React.ReactNode
}

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#FFF" },
		{ media: "(prefers-color-scheme: dark)", color: "000" },
	],
}

export const metadata: Metadata = {
	metadataBase: new URL(SEO.url),
	title: { absolute: SEO.title, template: `%s // ${SEO.title}` },
	applicationName: SEO.title,
	description: SEO.description,
	keywords: SEO.keywords,
	openGraph: {
		locale: "en",
		title: SEO.title,
		description: SEO.description,
		url: SEO.url,
		type: "website",
		images: [
			{
				url: "/images/thumb.png",
				width: 1200,
				height: 630,
				alt: SEO.description,
			},
		],
		siteName: SEO.title,
	},
	twitter: {
		site: SEO.twitter,
	},
}

const RootLayout = ({ children }: RootLayoutProps) => {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={fontSans.variable}>
				<Providers>
					<Header />

					<main className="flex flex-1 flex-col">{children}</main>

					<Footer />

					<MediaQueriesDebug />
				</Providers>
			</body>
		</html>
	)
}

export default RootLayout
