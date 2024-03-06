import { CONFIG } from "@/configs/site"
import { Globe2 } from "lucide-react"

export const Footer = () => {
	return (
		<footer className="container">
			<div className="flex  flex-col items-center justify-between gap-4 border-t py-10 md:h-24 md:flex-row md:py-0">
				<div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
					<Globe2 className="h-6 w-6" />

					<p className="text-center text-sm leading-loose md:text-left">
						Built by{" "}
						<a
							href={CONFIG.twitter}
							target="_blank"
							rel="noreferrer noopener nofollow"
							className="font-medium underline underline-offset-4"
						>
							vinihvc
						</a>
						. Highly inspired by{" "}
						<a
							href={CONFIG.shadcn}
							target="_blank"
							rel="noreferrer noopener nofollow"
							className="font-medium underline underline-offset-4"
						>
							shadcn
						</a>
						.
					</p>
				</div>
			</div>
		</footer>
	)
}
