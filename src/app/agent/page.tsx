import type { Metadata } from "next";
import NetworkerPage from "@/app/networker/page";

export const metadata: Metadata = {
  title: "Luma. Agente Nova SBE Alumni",
  description: "Luma, a agente IA da rede Nova SBE Alumni. Pede uma intro sem perder uma tarde.",
};

export default function AgentPage() {
  return <NetworkerPage />;
}
