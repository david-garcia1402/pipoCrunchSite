export const site = {
  name: "PIPOCRUNCH",
  tagline: "Sinta o CRUNCH de verdade.",
  description:
    "Pipocas gourmet em Jaraguá do Sul. Caramelizadas, recheadas e petiscos que viciam — feitas para presentear, celebrar e surpreender.",
  city: "Jaraguá do Sul — SC",
  instagram: "https://www.instagram.com/pipocrunch/",
  instagramHandle: "@pipocrunch",
  catalog:
    "https://www.canva.com/design/DAHRiY3Fo1k/E_1_0w1Avv0OOQt0-ToRYA/view?utm_content=DAHRiY3Fo1k&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=he36df30bb4",
  whatsapp: {
    display: "(47) 98446-4292",
    e164: "5547984464292",
  },
} as const;

export type OrderLine = "gourmet" | "recheadas" | "petiscos";

export const ORDER_LINE_EVENT = "pipocrunch:set-order-line";

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${site.whatsapp.e164}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export const gourmetSizes = [
  { id: "150g", label: "150 g", price: "15,90" },
  { id: "220g", label: "220 g", price: "24,90" },
] as const;

export const gourmetCoatings = [
  { name: "Chocolate branco", color: "#F4E6D0" },
  { name: "Avelã", color: "#8B5A2B" },
] as const;

export const potSizes = [
  { id: "250ml", label: "250 ml", price: "17,90" },
  { id: "500ml", label: "500 ml", price: "29,90" },
] as const;

export const filledFlavors = [
  { name: "Ninho", color: "#E8D7C0" },
  { name: "Avelã", color: "#6B3F24" },
  { name: "Bueno", color: "#C9A56A" },
] as const;

export const snacks = [
  { name: "Bacon", color: "#B5523A" },
  { name: "Torta de Cebola", color: "#C9A56A" },
  { name: "Doritos", color: "#E07A2F" },
] as const;

export const snackSize = { id: "60g", label: "Pote 60 g", price: "9,90" } as const;

export const nav = [
  { href: "#cardapio", label: "Cardápio" },
  { href: "#sabores", label: "Sabores" },
  { href: "#eventos", label: "Eventos" },
  { href: "#pedido", label: "Pedir" },
] as const;
