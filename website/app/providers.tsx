"use client"

import { ThemeProvider } from "next-themes"

type ProvidersProps = {
	children?: React.ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
	return (
		<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
			{children}
		</ThemeProvider>
	)
}
