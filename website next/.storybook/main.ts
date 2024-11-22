import type { StorybookConfig } from "@storybook/nextjs"

const config: StorybookConfig = {
	stories: ["../**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)"],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-onboarding",
		"@storybook/addon-interactions",
	],
	framework: {
		name: "@storybook/nextjs",
		options: {},
	},
	docs: {
		autodocs: "tag",
	},
}
export default config
