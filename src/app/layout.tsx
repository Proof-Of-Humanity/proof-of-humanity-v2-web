import cn from "classnames";
import { defaultChain } from "config/chains";
import { getContractData } from "data/contract";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./Footer";
import Header from "./Header/index";
import Toastify from "./Toastify";
import "./globals.css";
import AppKitProvider from "../context/AppKitProvider";
import HashBasedRedirectHandler from "../components/HashBasedRedirectHandler";
import { SettingsPopoverProvider } from "../context/SettingsPopoverContext";
import AirdropBanner from "../components/AirdropBanner";
import SubgraphsStatus from "../components/SubgraphsStatus";

export const metadata: Metadata = {
  title: "Proof of Humanity V2",
};

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // The layout must render even when the default chain's subgraph is down,
  // otherwise every page in the app crashes with it.
  const policy = await getContractData(defaultChain.id)
    .then((contractData) => contractData.arbitrationInfo.policy)
    .catch((err) => {
      console.error(
        "Failed to load layout policy (subgraph, RPC, or IPFS):",
        err,
      );
      return "";
    });

  return (
    <html lang="en">
      <body
        className={cn(
          "bg-primaryBackground scrollbar relative flex min-h-screen flex-col",
          inter.className,
        )}
      >
        <AppKitProvider>
          <SettingsPopoverProvider>
            <HashBasedRedirectHandler />
            <SubgraphsStatus />
            <AirdropBanner />
            <Header policy={policy} />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toastify />
          </SettingsPopoverProvider>
        </AppKitProvider>
      </body>
    </html>
  );
}
