import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "./button"

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
	title: "Components/Button",
	component: Button,
	args: {
		children: "I am a button",
	},
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
	args: {
		variant: "default",
	},
}
