import { Metadata } from "next";

const { title, description, baseURL } = {
  title: "Dashboard | SolixDB",
  description: "Manage your SolixDB API keys, monitor usage, and access Solana blockchain data.",
  baseURL: "https://dashboard.solixdb.xyz",
};

export const siteConfig: Metadata = {
  title,
  description,
  metadataBase: new URL(baseURL),
  icons: {
    icon: "/favicon.ico",
  },
  applicationName: "SolixDB Dashboard",
  keywords: [
    "SolixDB",
    "Solana API",
    "API Dashboard",
    "Blockchain Data",
  ],
};
