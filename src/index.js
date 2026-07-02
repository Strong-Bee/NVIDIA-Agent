#!/usr/bin/env node
import { Command } from "commander";
import dotenv from "dotenv";
import { showBanner } from "./banner.js";
import { runCLI } from "./cli.js";

dotenv.config();

const program = new Command();

program
  .name("nvidia-agent")
  .description("CLI tool for AI Agent automation and backtesting")
  .version("1.0.0");

showBanner();
runCLI(program);
