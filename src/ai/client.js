import { getConfig, validateConfig } from "../config.js";

export class NvidiaApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "NvidiaApiError";
    this.status = status;
  }
}

export async function chat(messages, options = {}) {
  const config = getConfig();
  const errors = validateConfig(config);
  if (errors.length) throw new NvidiaApiError(errors.join("\n"));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 120_000);
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        model: options.model || config.model,
        messages,
        temperature: options.temperature ?? config.temperature,
        max_tokens: options.maxTokens ?? config.maxTokens,
        stream: false,
      }),
      signal: controller.signal,
    });

    const raw = await response.text();
    let payload;
    try { payload = raw ? JSON.parse(raw) : {}; }
    catch { throw new NvidiaApiError(`NVIDIA API mengembalikan respons non-JSON (HTTP ${response.status}). Periksa endpoint dan model.`, response.status); }

    if (!response.ok) {
      const detail = payload?.error?.message || payload?.message || response.statusText;
      throw new NvidiaApiError(`NVIDIA API error (HTTP ${response.status}): ${detail}`, response.status);
    }
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new NvidiaApiError("Format respons NVIDIA API tidak dikenali.");
    return { content, usage: payload.usage ?? null, model: payload.model ?? options.model ?? config.model };
  } catch (error) {
    if (error.name === "AbortError") throw new NvidiaApiError("Permintaan ke NVIDIA API melewati batas waktu.");
    if (error instanceof NvidiaApiError) throw error;
    throw new NvidiaApiError(`Gagal menghubungi NVIDIA API: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }
}
