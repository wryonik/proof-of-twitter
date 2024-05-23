import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { WagmiConfig, createConfig } from "wagmi";
import { createPublicClient, http } from "viem";
import { configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { ZeroDevPrivyWagmiProvider } from '@zerodev/wagmi/privy';
import { sepolia } from "wagmi/chains";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleAuthProvider } from "./contexts/GoogleAuth";
import { AccountProvider } from "./contexts/Account";
import { PrivyProvider } from "@privy-io/react-auth";
import { PrivyWagmiConnector } from "@privy-io/wagmi-connector";
import { alchemyProvider } from 'wagmi/providers/alchemy'

const { connectors } = getDefaultWallets({
  appName: "ZK Email - Twitter Verifier",
  chains: [sepolia],
  projectId: "b68298f4e6597f970ac06be1aea7998d",
});

// const configureChainsConfig = configureChains([sepolia], [publicProvider()]);

const configureChainsConfig = configureChains(
  [sepolia],
  [
    publicProvider()
  ]
);


// const config = createConfig({
//   autoConnect: true,
//   publicClient: createPublicClient({
//     chain: sepolia,
//     transport: http(),
//   }),
//   connectors: connectors,
// });

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient: configureChainsConfig.publicClient
})


const zeroDevOptions = {
  projectIds: [import.meta.env.VITE_ZERODEV_APP_ID],
  projectId: import.meta.env.VITE_ZERODEV_APP_ID,
  useSmartWalletForExternalEOA: false, // Only sponsor gas for embedded wallets
}

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={[sepolia]} theme={darkTheme()}>
        <PrivyProvider
          appId={import.meta.env.VITE_PRIVY_APP_ID}
          config={{
            embeddedWallets: {
              createOnLogin: "users-without-wallets",
              noPromptOnSignature: true,
            },
            appearance: {
              theme: "#0E111C",
              accentColor: "#df2e2d",
            },
            defaultChain: sepolia,
            supportedChains: [sepolia],
          }}
        >
          <ZeroDevPrivyWagmiProvider
            wagmiChainsConfig={configureChainsConfig}
            options={zeroDevOptions}
          >
            <AccountProvider>
              <GoogleOAuthProvider
                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              >
                <GoogleAuthProvider>
                  <App />
                </GoogleAuthProvider>
              </GoogleOAuthProvider>
            </AccountProvider>
          </ZeroDevPrivyWagmiProvider>
        </PrivyProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById("root")
);
