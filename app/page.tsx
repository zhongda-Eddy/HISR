import { HisrApp } from "../components/hisr-app";
import { getMode } from "../lib/consult";
import { sources } from "../lib/knowledge";

export const dynamic = "force-dynamic";
export default function Home() {
  return <HisrApp mode={getMode()} sources={sources} />;
}
