import cn from "classnames";
import { defaultChain } from "config/chains";
import { getContractData } from "data/contract";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import { ipfs } from "utils/ipfs";
import Footer from "./Footer";
import Header from "./Header/index";
import Toastify from "./Toastify";
import "./globals.css";
import AppKitProvider from "../context/AppKitProvider";
import HashBasedRedirectHandler from "../components/HashBasedRedirectHandler";
import { SettingsPopoverProvider } from "../context/SettingsPopoverContext";
import AirdropBanner from "../components/AirdropBanner";
import MobileBlocker from "components/MobileBlocker";

export const metadata: Metadata = {
  title: "Proof of Humanity V2",
};

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const policy = (await getContractData(defaultChain.id)).arbitrationInfo
    .policy;

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
            <MobileBlocker/>
            <HashBasedRedirectHandler />
            {/* <AirdropBanner /> */}
            <Header policy={ipfs(policy)} />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toastify />
          </SettingsPopoverProvider>
        </AppKitProvider>
      </body>
    </html>
  );
}
