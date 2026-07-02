import { Planner } from "./agent/planner.js";
import { Logger } from "./utils/logger.js";

export function runCLI(program) {
  program
    .command("ask <query>")
    .description("Kirim instruksi ke AI Agent")
    .action(async (query) => {
      Logger.info(`Menerima instruksi: ${query}`);
      const planner = new Planner();
      await planner.execute(query);
    });

  program.parse(process.argv);
}
