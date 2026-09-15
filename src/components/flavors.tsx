import { filledFlavors, gourmetCoatings, snacks } from "@/lib/site";

function FlavorGrid({
  title,
  script,
  flavors,
}: {
  title: string;
  script: string;
  flavors: readonly { name: string; color: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.32em] text-gold uppercase">{title}</p>
      <h3 className="mt-1 font-script text-4xl text-burgundy">{script}</h3>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {flavors.map((flavor) => (
          <li
            key={flavor.name}
            className="flex items-center gap-3 rounded-2xl border border-burgundy/10 bg-white/50 px-3 py-3"
          >
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-burgundy/15"
              style={{ backgroundColor: flavor.color }}
            />
            <span className="text-sm text-burgundy/85">{flavor.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Flavors() {
  return (
    <section id="sabores" className="bg-cream-soft px-5 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-serif text-4xl text-burgundy md:text-5xl">
          Sabores da casa
        </h2>
        <p className="mt-4 max-w-xl text-burgundy/70">
          Coberturas crocantes, recheios cremosos e petiscos agridoce. Escolha o
          seu e peça no WhatsApp.
        </p>

        <div className="mt-14 grid gap-14 lg:grid-cols-2">
          <FlavorGrid title="Coberturas" script="Gourmet" flavors={gourmetCoatings} />
          <FlavorGrid title="Salgados" script="Agridoce" flavors={snacks} />
        </div>

        <div className="mt-14">
          <FlavorGrid title="Sabores" script="Recheados" flavors={filledFlavors} />
        </div>
      </div>
    </section>
  );
}
