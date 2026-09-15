import { filledFlavors, gourmetCoatings, snacks } from "@/lib/site";

const items = [
  ...gourmetCoatings.map((f) => f.name),
  ...filledFlavors.map((f) => f.name),
  ...snacks.map((f) => f.name),
];

export function FlavorMarquee() {
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-gold/20 bg-burgundy-deep py-3">
      <div className="marquee-track flex w-max gap-10">
        {loop.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="text-[11px] tracking-[0.32em] text-gold/80 uppercase"
          >
            {name}
            <span className="ml-10 text-gold/40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
