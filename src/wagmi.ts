import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { baseSepolia } from "viem/chains"
import { http } from "wagmi"

export const config = getDefaultConfig({
  appName: "Polku",
  appDescription: "A walk through unmapped territory. Something asks. You arrive. You carry one thing out.",
  appUrl: "https://polku.kaarna.xyz",
  appIcon: "https://polku.kaarna.xyz/favicon.svg",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
  ssr: false,
})
