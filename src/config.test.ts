import assert from "node:assert/strict";
import test from "node:test";
import { validateConfig } from "./config.js";

test("valid config passes validation", () => {
  const result = validateConfig({
    universeId: "123456789",
    gamePasses: [{ name: "VIP", description: "VIP perks", price: 99, icon: "vip.png" }],
    developerProducts: [{ name: "100 Coins", description: "Adds coins", price: 25, icon: "coins.png" }]
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("missing universeId fails validation", () => {
  const result = validateConfig({
    universeId: "",
    gamePasses: []
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /universeId/);
});

test("invalid prices fail validation", () => {
  const result = validateConfig({
    universeId: "123456789",
    developerProducts: [{ name: "Bad Product", price: -1 }]
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /price/);
});
