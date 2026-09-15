import { About } from "@/components/about";
import { Catalog } from "@/components/catalog";
import { Events } from "@/components/events";
import { FlavorMarquee } from "@/components/flavor-marquee";
import { Flavors } from "@/components/flavors";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Order } from "@/components/order";
import { WhatsappFloat } from "@/components/whatsapp-float";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FlavorMarquee />
        <About />
        <Catalog />
        <Flavors />
        <Events />
        <Order />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
