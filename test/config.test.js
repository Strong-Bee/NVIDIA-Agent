import test from "node:test";
import assert from "node:assert/strict";
import { validateConfig } from "../src/config.js";

const valid = {
  apiKey: "test-key",
  baseUrl: "https://integrate.api.nvidia.com/v1",
  model: "meta/llama-3.3-70b-instruct",
  temperature: 0.2,
  maxTokens: 2048,
};

test("accepts a valid NVIDIA configuration", () => {
  assert.deepEqual(validateConfig(valid), []);
});

test("rejects a missing API key", () => {
  assert.match(validateConfig({ ...valid, apiKey: "" }).join(" "), /NVIDIA_API_KEY/);
});

test("rejects invalid temperature and token limit", () => {
  const errors = validateConfig({ ...valid, temperature: 3, maxTokens: 0 });
  assert.equal(errors.length, 2);
});
