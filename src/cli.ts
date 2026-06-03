#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { loadConfig, validateConfig } from "./config.js";
import { generateLuauModule } from "./luau.js";

interface CliOptions {
  command: string;
  configPath: string;
  outPath?: string;
  dryRun: boolean;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (options.command !== "validate") {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const config = await loadConfig(options.configPath);
  const result = validateConfig(config);

  console.log("Roblox Creator Automator");
  console.log(`Config: ${options.configPath}`);
  console.log(`Mode: ${options.dryRun ? "dry run" : "validate"}`);

  if (result.errors.length > 0) {
    console.log("\nErrors:");
    result.errors.forEach((error) => console.log(`- ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log("\nWarnings:");
    result.warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (!result.valid) {
    process.exitCode = 1;
    return;
  }

  console.log("\nConfig is valid.");
  console.log(`Game passes: ${config.gamePasses?.length ?? 0}`);
  console.log(`Developer products: ${config.developerProducts?.length ?? 0}`);

  if (options.outPath) {
    const luau = generateLuauModule(config);
    await writeFile(options.outPath, luau, "utf8");
    console.log(`Generated Luau config: ${options.outPath}`);
  }
}

function parseArgs(args: string[]): CliOptions {
  const command = args[0] ?? "help";
  let configPath = "creator.config.json";
  let outPath: string | undefined;
  let dryRun = false;

  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--config" || arg === "-c") {
      configPath = requireValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--out" || arg === "-o") {
      outPath = requireValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      return { command: "help", configPath, outPath, dryRun };
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return { command, configPath, outPath, dryRun };
}

function requireValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith("-")) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}

function printHelp(): void {
  console.log(`Roblox Creator Automator

Usage:
  rba validate --config creator.config.json --dry-run
  rba validate --config creator.config.json --out CreatorProducts.lua

Commands:
  validate    Validate a creator config and optionally export Luau config

Options:
  -c, --config <path>    Path to creator config JSON
  -o, --out <path>       Write generated Luau module to this path
      --dry-run          Preview validation without write actions
  -h, --help             Show this help message`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
