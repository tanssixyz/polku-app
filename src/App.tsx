import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Walk } from "./components/Walk"
import { About } from "./components/About"
import "./App.css"

export default function App() {
  const { isConnected } = useAccount()

  return (
    <div className="app">
      <header>
        <span className="wordmark">polku</span>
        <ConnectButton
          showBalance={false}
          chainStatus="none"
          accountStatus="avatar"
        />
      </header>

      <main>
        {!isConnected ? (
          <div className="connect-prompt">
            <p className="card-label">polku</p>
            <p className="card-desc">
              a walk through unmapped territory.<br />
              something asks. you arrive.<br />
              you carry one thing out.
            </p>
          </div>
        ) : (
          <Walk />
        )}
      </main>

      <footer>
        <About />
        <div className="footer-links">
          <a
            href="https://sepolia.basescan.org/address/0xc57d270Ab2CeB89844D6E97feA5Abab46a37a34d"
            target="_blank"
            rel="noreferrer"
          >
            contract
          </a>
          <span>·</span>
          <a href="https://kaarna.xyz" target="_blank" rel="noreferrer">
            kaarna
          </a>
        </div>
        <p className="footer-disclaimer">
          experimental · transactions are permanent · no data collected
        </p>
      </footer>
    </div>
  )
}
