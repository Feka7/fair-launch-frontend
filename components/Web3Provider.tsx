"use client"
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { tenderly_fork_chain } from "@/lib/tenderly";

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [
      //baseSepolia
      tenderly_fork_chain
    ],
    transports: {
      // RPC URL for each chain
      // [baseSepolia.id]: http(
      //   process.env.NEXT_PUBLIC_ALCHEMY_URL,
      // ),
      [tenderly_fork_chain.id]: http(),
    },
    ssr: true,
    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

    // Required App Info
    appName: "Fair launch",

    // Optional App Info
    // appDescription: "Your App Description",
    // appUrl: "https://family.co", // your app's url
    // appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode}) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};