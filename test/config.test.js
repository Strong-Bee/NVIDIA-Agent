import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { validateConfig } from "../src/config.js";
import { collectWorkspaceContext } from "../src/workspace/context.js";

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

test("workspace context excludes env files and redacts credential values", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "nvidia-agent-test-"));
  try {
    await fs.writeFile(path.join(dir, ".env"), "NVIDIA_API_KEY=nvapi-super-secret-token-value");
    await fs.writeFile(path.join(dir, "config.json"), JSON.stringify({ api_key: "nvapi-another-secret-token" }));
    await fs.writeFile(path.join(dir, "README.md"), "Project documentation");
    const result = await collectWorkspaceContext(dir);
    assert.equal(result.files, 2);
    assert.equal(result.text.includes("super-secret-token-value"), false);
    assert.equal(result.text.includes("another-secret-token"), false);
    assert.match(result.text, /REDACTED/);
    assert.match(result.text, /Project documentation/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
