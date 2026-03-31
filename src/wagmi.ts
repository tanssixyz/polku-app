import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { baseSepolia } from "viem/chains"
import { http } from "wagmi"

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string

if (!projectId) {
  throw new Error("VITE_WALLETCONNECT_PROJECT_ID is not set")
}

export const config = getDefaultConfig({
  appName: "Polku",
  appDescription: "A walk through unmapped territory. Something asks. You arrive. You carry one thing out.",
  appUrl: "https://polku.kaarna.xyz",
  appIcon: "https://polku.kaarna.xyz/favicon.svg",
  projectId,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
  ssr: false,
})
