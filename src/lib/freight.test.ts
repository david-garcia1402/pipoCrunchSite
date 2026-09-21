import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deliveryOrigin,
  formatBrl,
  formatDeliveryAddress,
  formatKm,
  freightMessageLines,
  haversineMeters,
  maskCep,
  orderTotal,
  quoteFromMeters,
  rankCandidate,
  type CepAddress,
  type GeoCandidate,
} from "./freight.ts";

const jaragua: CepAddress = {
  cep: "89256-000",
  street: "Rua Max Wilhelm",
  neighborhood: "Vila Baependi",
  city: "Jaraguá do Sul",
  state: "SC",
};

function candidate(overrides: Partial<GeoCandidate>): GeoCandidate {
  return {
    latitude: -26.48,
    longitude: -49.07,
    name: "Rua Max Wilhelm",
    city: "Jaraguá do Sul",
    state: "Santa Catarina",
    postcode: "89256-000",
    district: "Vila Baependi",
    countrycode: "BR",
    ...overrides,
  };
}

describe("consulta de frete", () => {
  it("mascara o CEP enquanto a pessoa digita", () => {
    assert.equal(maskCep("89"), "89");
    assert.equal(maskCep("89256000"), "89256-000");
    assert.equal(maskCep("89256-000999"), "89256-000");
  });

  it("cobra 2 reais por km rodado, com uma casa decimal", () => {
    const local = quoteFromMeters(1198.1);
    assert.equal(local.distanceKm, 1.2);
    assert.equal(local.price, 2.4);

    const blumenau = quoteFromMeters(66751.1);
    assert.equal(blumenau.distanceKm, 66.8);
    assert.equal(blumenau.price, 133.6);
  });

  it("soma o frete ao valor do produto", () => {
    assert.equal(orderTotal("15,90", 2.4), 18.3);
    assert.equal(formatBrl(orderTotal("15,90", 2.4)), "18,30");
    assert.equal(formatBrl(1200.8), "1.200,80");
    assert.equal(formatKm(66.8), "66,8");
  });

  it("prefere o logradouro da cidade do CEP", () => {
    const ranked = rankCandidate(jaragua, candidate({}));
    const otherCity = rankCandidate(
      jaragua,
      candidate({ city: "Joinville", state: "Santa Catarina", district: "Centro" }),
    );
    const avenue = rankCandidate(
      { ...jaragua, street: "Av. Getúlio Vargas", neighborhood: "Centro", cep: "89251-000" },
      candidate({
        name: "Avenida Getúlio Vargas",
        district: "Centro",
        postcode: "89251-000",
      }),
    );

    assert.equal(ranked?.precision, "street");
    assert.equal(otherCity, null);
    assert.equal(avenue?.precision, "street");
  });

  it("monta o endereço e as linhas da mensagem", () => {
    assert.equal(
      formatDeliveryAddress(jaragua),
      "Rua Max Wilhelm, Vila Baependi — Jaraguá do Sul/SC",
    );

    const lines = freightMessageLines({
      cep: "89256-000",
      addressLabel: "Rua Max Wilhelm, Vila Baependi — Jaraguá do Sul/SC",
      distanceKm: 1.2,
      price: 2.4,
      distanceKind: "driving",
      precision: "street",
    });

    assert.deepEqual(lines, [
      "• CEP: 89256-000",
      "• Entrega: Rua Max Wilhelm, Vila Baependi — Jaraguá do Sul/SC",
      "• Distância: 1,2 km",
      "• Frete: R$ 2,40 (1,2 km × R$ 2,00)",
    ]);
  });

  it("mede uma distância coerente entre Jaraguá do Sul e Blumenau", () => {
    const meters = haversineMeters(deliveryOrigin, {
      latitude: -26.9250575,
      longitude: -49.0604261,
    });
    assert.ok(meters > 45_000 && meters < 55_000);
  });
});
