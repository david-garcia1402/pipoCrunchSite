/** Saída da entrega: Avenida Getúlio Vargas, Centro, Jaraguá do Sul. */
export const deliveryOrigin = {
  label: "centro de Jaraguá do Sul",
  latitude: -26.4800362,
  longitude: -49.0852261,
} as const;

export const FREIGHT_BRL_PER_KM = 2;

const QUOTE_TIMEOUT_MS = 12000;

const STREET_TYPE =
  /^(rua|avenida|av|travessa|tv|alameda|al|praca|pca|rodovia|rod|estrada|est|servidao|largo|via|beco)\s+/;

const STATE_BY_UF: Record<string, string> = {
  AC: "acre",
  AL: "alagoas",
  AP: "amapa",
  AM: "amazonas",
  BA: "bahia",
  CE: "ceara",
  DF: "distrito federal",
  ES: "espirito santo",
  GO: "goias",
  MA: "maranhao",
  MT: "mato grosso",
  MS: "mato grosso do sul",
  MG: "minas gerais",
  PA: "para",
  PB: "paraiba",
  PR: "parana",
  PE: "pernambuco",
  PI: "piaui",
  RJ: "rio de janeiro",
  RN: "rio grande do norte",
  RS: "rio grande do sul",
  RO: "rondonia",
  RR: "roraima",
  SC: "santa catarina",
  SP: "sao paulo",
  SE: "sergipe",
  TO: "tocantins",
};

const UF_BY_STATE_NAME = Object.fromEntries(
  Object.entries(STATE_BY_UF).map(([uf, name]) => [name, uf]),
);

export class FreightError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FreightError";
  }
}

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type CepAddress = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type GeoPrecision = "street" | "neighborhood" | "city";

export type GeoCandidate = {
  latitude: number;
  longitude: number;
  name: string;
  city: string;
  state: string;
  postcode: string;
  district: string;
  countrycode: string;
};

export type FreightQuote = {
  cep: string;
  addressLabel: string;
  distanceKm: number;
  price: number;
  distanceKind: "driving" | "straight";
  precision: GeoPrecision;
};

type RankedCandidate = {
  candidate: GeoCandidate;
  score: number;
  precision: GeoPrecision;
};

const quoteCache = new Map<string, FreightQuote>();

export function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function maskCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function isCompleteCep(value: string) {
  return onlyDigits(value).length === 8;
}

export function parseBrl(value: string) {
  const amount = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(amount) ? amount : 0;
}

export function addBrl(left: number, right: number) {
  return Math.round((left + right) * 100) / 100;
}

export function orderTotal(productPrice: string, freightPrice = 0) {
  return addBrl(parseBrl(productPrice), freightPrice);
}

export function formatBrl(value: number) {
  const cents = Math.round(value * 100);
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const whole = Math.floor(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, "0");
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${grouped},${fraction}`;
}

export function formatKm(value: number) {
  const tenths = Math.round(value * 10);
  const sign = tenths < 0 ? "-" : "";
  const absolute = Math.abs(tenths);
  const whole = Math.floor(absolute / 10);
  const fraction = absolute % 10;
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${grouped},${fraction}`;
}

export function formatDeliveryAddress(address: Pick<CepAddress, "street" | "neighborhood" | "city" | "state">) {
  const place = [address.street, address.neighborhood].filter(Boolean).join(", ");
  const city = `${address.city}/${address.state}`;
  return place ? `${place} — ${city}` : city;
}

export function quoteFromMeters(distanceMeters: number) {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    throw new FreightError("Não foi possível calcular a distância desse CEP.");
  }

  const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
  const price = Math.round(distanceKm * FREIGHT_BRL_PER_KM * 100) / 100;
  return { distanceKm, price };
}

export function normalizePlace(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function streetCore(value: string) {
  return normalizePlace(value).replace(STREET_TYPE, "");
}

export function rankCandidate(address: CepAddress, candidate: GeoCandidate): RankedCandidate | null {
  if (candidate.countrycode && candidate.countrycode.toUpperCase() !== "BR") return null;
  if (!Number.isFinite(candidate.latitude) || !Number.isFinite(candidate.longitude)) return null;

  const stateOk = sameState(address.state, candidate.state);
  const cityOk = samePlace(address.city, candidate.city);
  const streetOk = Boolean(address.street) && streetsMatch(address.street, candidate.name);
  const districtOk = Boolean(address.neighborhood) && samePlace(address.neighborhood, candidate.district);
  const postcodeOk =
    Boolean(address.cep) &&
    Boolean(candidate.postcode) &&
    onlyDigits(address.cep) === onlyDigits(candidate.postcode);

  if (candidate.state && !stateOk) return null;
  if (candidate.city && !cityOk) return null;

  let score = 0;
  if (stateOk) score += 4;
  if (cityOk) score += 4;
  if (streetOk) score += 6;
  if (districtOk) score += 2;
  if (postcodeOk) score += 3;
  if (score < 4) return null;

  let precision: GeoPrecision = "city";
  if (streetOk) precision = "street";
  else if (districtOk) precision = "neighborhood";

  return { candidate, score, precision };
}

export function freightMessageLines(quote: FreightQuote) {
  const notes: string[] = [];
  if (quote.distanceKind === "straight") notes.push("linha reta");
  if (quote.precision === "neighborhood") notes.push("estimativa pelo bairro");
  if (quote.precision === "city") notes.push("estimativa pela cidade");
  const suffix = notes.length > 0 ? ` (${notes.join(", ")})` : "";

  return [
    `• CEP: ${quote.cep}`,
    `• Entrega: ${quote.addressLabel}`,
    `• Distância: ${formatKm(quote.distanceKm)} km${suffix}`,
    `• Frete: R$ ${formatBrl(quote.price)} (${formatKm(quote.distanceKm)} km × R$ ${formatBrl(FREIGHT_BRL_PER_KM)})`,
  ];
}

export async function fetchFreightQuote(cepInput: string, signal?: AbortSignal) {
  const cep = onlyDigits(cepInput);
  if (cep.length !== 8) {
    throw new FreightError("Informe o CEP com 8 números.");
  }

  const cached = quoteCache.get(cep);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), QUOTE_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener("abort", abortFromCaller);

  try {
    const quote = await quoteCep(cep, controller.signal);
    quoteCache.set(cep, quote);
    return quote;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (isAbortError(error)) {
      throw new FreightError("A consulta de frete demorou demais. Tente de novo.");
    }
    if (error instanceof FreightError) throw error;
    throw new FreightError("Não foi possível consultar o frete agora. Tente de novo.");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

async function quoteCep(cep: string, signal: AbortSignal): Promise<FreightQuote> {
  const address = await lookupAddress(cep, signal);
  const located = await geocodeAddress(address, signal);
  const distance = await measureDistance(deliveryOrigin, located.coordinates, signal);
  const priced = quoteFromMeters(distance.meters);

  return {
    cep: address.cep,
    addressLabel: formatDeliveryAddress(address),
    distanceKm: priced.distanceKm,
    price: priced.price,
    distanceKind: distance.kind,
    precision: located.precision,
  };
}

async function lookupAddress(cep: string, signal: AbortSignal) {
  let sawNotFound = false;

  try {
    const found = await lookupBrasilApi(cep, signal);
    if (found) return found;
    sawNotFound = true;
  } catch (error) {
    if (signal.aborted) throw error;
  }

  try {
    const found = await lookupViaCep(cep, signal);
    if (found) return found;
    sawNotFound = true;
  } catch (error) {
    if (signal.aborted) throw error;
    if (sawNotFound) {
      throw new FreightError("Não encontramos esse CEP. Confira os números e tente de novo.");
    }
    throw new FreightError("Não foi possível consultar esse CEP agora. Tente de novo.");
  }

  throw new FreightError("Não encontramos esse CEP. Confira os números e tente de novo.");
}

async function lookupBrasilApi(cep: string, signal: AbortSignal) {
  const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("brasilapi");

  const data = (await response.json()) as {
    cep?: string;
    state?: string;
    city?: string;
    neighborhood?: string;
    street?: string;
  };

  if (!data.city || !data.state) return null;

  return {
    cep: maskCep(data.cep || cep),
    street: data.street?.trim() ?? "",
    neighborhood: data.neighborhood?.trim() ?? "",
    city: data.city.trim(),
    state: data.state.trim(),
  } satisfies CepAddress;
}

async function lookupViaCep(cep: string, signal: AbortSignal) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal });
  if (!response.ok) throw new Error("viacep");

  const data = (await response.json()) as {
    erro?: boolean | string;
    cep?: string;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
  };

  if (data.erro || !data.localidade || !data.uf) return null;

  return {
    cep: data.cep || maskCep(cep),
    street: data.logradouro?.trim() ?? "",
    neighborhood: data.bairro?.trim() ?? "",
    city: data.localidade.trim(),
    state: data.uf.trim(),
  } satisfies CepAddress;
}

async function geocodeAddress(address: CepAddress, signal: AbortSignal) {
  let best: RankedCandidate | null = null;

  for (const query of searchQueries(address)) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const candidates = await photonSearch(query, signal);
    best = preferCandidate(address, candidates, best);
    if (best?.precision === "street") break;
  }

  if (!best || (address.street && best.precision !== "street")) {
    const candidates = await nominatimSearch(address, signal);
    best = preferCandidate(address, candidates, best);
  }

  if (!best) {
    throw new FreightError(
      "Encontramos o CEP, mas não deu para localizar o endereço e calcular a distância.",
    );
  }

  return {
    coordinates: {
      latitude: best.candidate.latitude,
      longitude: best.candidate.longitude,
    },
    precision: best.precision,
  };
}

function searchQueries(address: CepAddress) {
  const full = [address.street, address.neighborhood, address.city, address.state, "Brasil"]
    .filter(Boolean)
    .join(", ");
  const streetCity = [address.street, address.city, address.state, "Brasil"].filter(Boolean).join(", ");
  const area = [address.neighborhood, address.city, address.state, "Brasil"].filter(Boolean).join(", ");
  return [...new Set([full, streetCity, area].filter((query) => query.length > 0))];
}

function preferCandidate(address: CepAddress, candidates: GeoCandidate[], current: RankedCandidate | null) {
  let best = current;

  for (const candidate of candidates) {
    const ranked = rankCandidate(address, candidate);
    if (!ranked) continue;
    if (!best || ranked.score > best.score || (ranked.score === best.score && precisionWeight(ranked.precision) > precisionWeight(best.precision))) {
      best = ranked;
    }
  }

  return best;
}

function precisionWeight(precision: GeoPrecision) {
  if (precision === "street") return 3;
  if (precision === "neighborhood") return 2;
  return 1;
}

async function photonSearch(query: string, signal: AbortSignal) {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");
  url.searchParams.set("lang", "default");

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) return [];
    const data = (await response.json()) as {
      features?: {
        geometry?: { coordinates?: number[] };
        properties?: {
          name?: string;
          street?: string;
          district?: string;
          locality?: string;
          city?: string;
          county?: string;
          state?: string;
          postcode?: string;
          countrycode?: string;
        };
      }[];
    };

    return (data.features ?? []).flatMap((feature) => {
      const [longitude, latitude] = feature.geometry?.coordinates ?? [];
      const props = feature.properties ?? {};
      return toCandidate({
        latitude,
        longitude,
        name: props.name || props.street || "",
        city: props.city || props.county || "",
        state: props.state || "",
        postcode: props.postcode || "",
        district: props.district || props.locality || "",
        countrycode: props.countrycode || "",
      });
    });
  } catch (error) {
    if (signal.aborted) throw error;
    return [];
  }
}

async function nominatimSearch(address: CepAddress, signal: AbortSignal) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "br");
  url.searchParams.set("q", searchQueries(address)[0] ?? "");

  try {
    const response = await fetch(url, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];

    const data = (await response.json()) as {
      lat?: string;
      lon?: string;
      name?: string;
      address?: {
        road?: string;
        suburb?: string;
        neighbourhood?: string;
        city?: string;
        town?: string;
        municipality?: string;
        state?: string;
        postcode?: string;
        country_code?: string;
      };
    }[];

    return data.flatMap((item) => {
      const place = item.address ?? {};
      return toCandidate({
        latitude: Number(item.lat),
        longitude: Number(item.lon),
        name: item.name || place.road || "",
        city: place.city || place.town || place.municipality || "",
        state: place.state || "",
        postcode: place.postcode || "",
        district: place.suburb || place.neighbourhood || "",
        countrycode: (place.country_code || "").toUpperCase(),
      });
    });
  } catch (error) {
    if (signal.aborted) throw error;
    return [];
  }
}

function toCandidate(candidate: GeoCandidate) {
  if (!Number.isFinite(candidate.latitude) || !Number.isFinite(candidate.longitude)) return [];
  if (Math.abs(candidate.latitude) > 90 || Math.abs(candidate.longitude) > 180) return [];
  return [candidate];
}

async function measureDistance(from: Coordinates, to: Coordinates, signal: AbortSignal) {
  try {
    const meters = await drivingMeters(from, to, signal);
    return { meters, kind: "driving" as const };
  } catch (error) {
    if (signal.aborted) throw error;
    return { meters: haversineMeters(from, to), kind: "straight" as const };
  }
}

async function drivingMeters(from: Coordinates, to: Coordinates, signal: AbortSignal) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=false`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("osrm");

  const data = (await response.json()) as {
    code?: string;
    routes?: { distance?: number }[];
  };
  const meters = data.routes?.[0]?.distance;
  if (data.code !== "Ok" || typeof meters !== "number" || !Number.isFinite(meters)) {
    throw new Error("osrm");
  }
  return meters;
}

export function haversineMeters(from: Coordinates, to: Coordinates) {
  const earth = 6_371_000;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function sameState(left: string, right: string) {
  const from = canonicalState(left);
  const to = canonicalState(right);
  return Boolean(from) && from === to;
}

function canonicalState(value: string) {
  const normalized = normalizePlace(value);
  if (!normalized) return "";
  const upper = normalized.toUpperCase();
  if (STATE_BY_UF[upper]) return upper;
  return UF_BY_STATE_NAME[normalized] ?? "";
}

function samePlace(left: string, right: string) {
  const from = normalizePlace(left);
  const to = normalizePlace(right);
  return Boolean(from) && from === to;
}

function streetsMatch(left: string, right: string) {
  const from = streetCore(left);
  const to = streetCore(right);
  if (from.length < 4 || to.length < 4) return false;
  return from === to || from.includes(to) || to.includes(from);
}
