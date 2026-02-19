import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelly Pool | Pool Tracker",
  description: "Play Kelly Pool — the classic rotation elimination game",
};

export default function KellyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
