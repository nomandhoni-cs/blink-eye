"use client"

import { cn } from "@/utils/cn"
import { Check, Copy } from "lucide-react"
import * as React from "react"

type CopyButtonProps = {
	value: string
} & React.HTMLAttributes<HTMLButtonElement>

const copyToClipboardWithMeta = async (value: string) => {
	navigator.clipboard.writeText(value)
}

export const CopyButton = ({ value, className, ...props }: CopyButtonProps) => {
	const [hasCopied, setHasCopied] = React.useState(false)

	React.useEffect(() => {
		setTimeout(() => {
			setHasCopied(false)
		}, 2000)
	}, [])

	return (
		<button
			type="button"
			className={cn(
				"z-20 h-8 p-2",
				"inline-flex items-center justify-center",
				"rounded",
				"text-sm font-medium",
				"transition-all",
				"focus:outline-none",
				"hover:bg-neutral-100",
				"dark:hover:bg-neutral-800",
				className,
			)}
			onClick={() => {
				copyToClipboardWithMeta(value)
				setHasCopied(true)
			}}
			{...props}
		>
			<span className="sr-only">Copy</span>
			{hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
		</button>
	)
}
