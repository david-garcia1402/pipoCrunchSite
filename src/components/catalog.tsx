import { Gift, PartyPopper, Sparkles } from "lucide-react";
import { OrderLineLink } from "@/components/order-line-link";
import {
  gourmetCoatings,
  gourmetSizes,
  potSizes,
  site,
  snackSize,
  snacks,
  type OrderLine,
} from "@/lib/site";

const lines: {
  id: OrderLine;
  kicker: string;
  title: string;
  description: string;
  sizes: readonly { id: string; label: string; price: string }[];
  extras: string;
  image: string;
}[] = [
  {
    id: "gourmet",
    kicker: "Doces",
    title: "Pipocas gourmet",
    description: "Pipoca MUSH caramelizada coberta com camadas irresistíveis.",
    sizes: gourmetSizes,
    extras: gourmetCoatings.map((c) => c.name).join(" · "),
    image: "/images/caramel-corn.jpg",
  },
  {
    id: "recheadas",
    kicker: "Potes",
    title: "Pipocas recheadas",
    description: "Pipoca MUSH caramelizada recheada com muito sabor.",
    sizes: potSizes,
    extras: "12 sabores recheados",
    image: "/images/chocolate.jpg",
  },
  {
    id: "petiscos",
    kicker: "Salgados",
    title: "Petiscos agridoce",
    description: "Aquela crocância que vicia a cada mordida.",
    sizes: [snackSize],
    extras: snacks.map((s) => s.name).join(" · "),
    image: "/images/caramel-bowl.jpg",
  },
];

export function Catalog() {
  return (
    <section id="cardapio" className="grain bg-burgundy px-5 py-24 text-cream md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] tracking-[0.32em] text-gold uppercase">Cardápio</p>
            <h2 className="mt-3 font-serif text-4xl text-gold md:text-5xl">
              Escolha o seu crunch
            </h2>
          </div>
          <a
            href={site.catalog}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] tracking-[0.22em] text-cream/70 uppercase underline-offset-4 hover:text-gold hover:underline"
          >
            Ver catálogo completo
          </a>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {lines.map((line) => (
            <article
              key={line.id}
              className="group overflow-hidden rounded-[1.75rem] border border-gold/20 bg-burgundy-soft/40 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
            >
              <div className="relative h-52 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${line.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy to-burgundy/10" />
                <p className="absolute top-4 left-4 rounded-full border border-gold/30 bg-burgundy/70 px-3 py-1 font-script text-xl text-gold">
                  {line.kicker}
                </p>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl text-gold">{line.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">
                  {line.description}
                </p>
                <div className="mt-5 grid gap-2">
                  {line.sizes.map((size) => (
                    <div
                      key={size.id}
                      className="flex items-center justify-between rounded-2xl border border-gold/20 px-4 py-3"
                    >
                      <span className="text-sm tracking-[0.08em] text-cream/80">
                        {size.label}
                      </span>
                      <span className="font-serif text-lg text-gold">
                        R$ {size.price}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs tracking-[0.08em] text-cream/50">
                  {line.extras}
                </p>
                <OrderLineLink
                  line={line.id}
                  className="mt-6 inline-flex text-[11px] tracking-[0.2em] text-gold uppercase"
                >
                  Montar pedido →
                </OrderLineLink>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Gift,
              title: "Presentes",
              text: "Embalagens que chegam prontas para surpreender.",
            },
            {
              icon: PartyPopper,
              title: "Aniversários",
              text: "Sabores para mesa de festa e momentos em família.",
            },
            {
              icon: Sparkles,
              title: "Eventos especiais",
              text: "Pedidos pensados para ocasiões que merecem crunch.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[1.5rem] border border-gold/15 px-5 py-6"
            >
              <item.icon className="text-gold" size={20} />
              <h3 className="mt-4 font-serif text-xl text-gold">{item.title}</h3>
              <p className="mt-2 text-sm text-cream/65">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
