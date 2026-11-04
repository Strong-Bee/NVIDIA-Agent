import { Planner } from "./agent/planner.js";
import { getConfig, validateConfig } from "./config.js";

const HELP = `
NVIDIA Agent CLI

Usage:
  nvidia-agent ask <prompt>    Kirim prompt ke NVIDIA NIM
  nvidia-agent models          Tampilkan model yang dikonfigurasi
  nvidia-agent config          Periksa konfigurasi (tanpa menampilkan API key)
  nvidia-agent help            Tampilkan bantuan

Options:
  -h, --help                   Tampilkan bantuan
  -v, --version                Tampilkan versi

Environment:
  NVIDIA_API_KEY               API key NVIDIA NIM (wajib untuk ask)
  NVIDIA_BASE_URL              Default: https://integrate.api.nvidia.com/v1
  NVIDIA_MODEL                 Default: meta/llama-3.3-70b-instruct
  NVIDIA_TEMPERATURE           Default: 0.2
  NVIDIA_MAX_TOKENS             Default: 2048
  WORKSPACE_DIR                Folder project yang dianalisis secara read-only

Catatan: versi ini menyediakan chat dan pembacaan konteks workspace. Eksekusi shell,
perubahan file, browser automation, dan GitHub tools belum tersedia.
`;

export async function runCLI(argv = process.argv.slice(2)) {
  const [command, ...args] = argv;
  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(HELP);
    return;
  }
  if (command === "--version" || command === "-v") {
    console.log("1.1.0");
    return;
  }
  if (command === "config") {
    const config = getConfig();
    console.log(JSON.stringify({
      apiKeyConfigured: Boolean(config.apiKey),
      baseUrl: config.baseUrl,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      workspaceDir: config.workspaceDir,
      valid: validateConfig(config).length === 0,
      errors: validateConfig(config),
    }, null, 2));
    return;
  }
  if (command === "models") {
    console.log(`Configured model: ${getConfig().model}`);
    console.log("Untuk daftar model terbaru, lihat https://build.nvidia.com/ atau endpoint model provider Anda.");
    return;
  }
  if (command === "ask") {
    const query = args.join(" ").trim();
    if (!query) throw new Error("Masukkan prompt. Contoh: nvidia-agent ask \"Jelaskan struktur project ini\"");
    await new Planner().execute(query);
    return;
  }
  throw new Error(`Perintah tidak dikenal: ${command}\\nJalankan nvidia-agent help untuk bantuan.`);
}
