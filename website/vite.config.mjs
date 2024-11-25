import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	test: {
		// 👋 add the line below to add jsdom to vite
		environment: "jsdom",
		// hey! 👋 over here
		globals: true,
		setupFiles: "./tests/setup.js", // assuming the test folder is in the root of our project
	},
})
