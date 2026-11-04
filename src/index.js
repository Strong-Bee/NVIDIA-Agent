#!/usr/bin/env node
import { runCLI } from "./cli.js";

try {
  await runCLI();
} catch (error) {
  console.error(`\nError: ${error.message}\n`);
  process.exitCode = 1;
}
