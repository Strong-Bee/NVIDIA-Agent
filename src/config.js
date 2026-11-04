import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath = path.resolve(process.cwd(), ".env")) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

export function getConfig() {
  loadEnvFile();
  return {
    apiKey: process.env.NVIDIA_API_KEY?.trim() || "",
    baseUrl: (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/+$/, ""),
    model: process.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct",
    temperature: Number(process.env.NVIDIA_TEMPERATURE ?? 0.2),
    maxTokens: Number.parseInt(process.env.NVIDIA_MAX_TOKENS ?? "2048", 10),
    workspaceDir: path.resolve(process.cwd(), process.env.WORKSPACE_DIR || "."),
  };
}

export function validateConfig(config) {
  const errors = [];
  if (!config.apiKey) errors.push("NVIDIA_API_KEY belum diatur. Isi file .env atau environment variable.");
  if (!/^https?:\/\//i.test(config.baseUrl)) errors.push("NVIDIA_BASE_URL harus berupa URL HTTP/HTTPS yang valid.");
  if (!config.model.trim()) errors.push("NVIDIA_MODEL tidak boleh kosong.");
  if (!Number.isFinite(config.temperature) || config.temperature < 0 || config.temperature > 2) errors.push("NVIDIA_TEMPERATURE harus berada pada rentang 0–2.");
  if (!Number.isInteger(config.maxTokens) || config.maxTokens < 1) errors.push("NVIDIA_MAX_TOKENS harus berupa bilangan bulat positif.");
  return errors;
}

export { loadEnvFile };
