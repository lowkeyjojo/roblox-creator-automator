#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { loadConfig, validateConfig } from "./config.js";
import { generateLuauModule } from "./luau.js";
import { syncConfig } from "./sync.js";
import { runWizard } from "./wizard.js";

const args = process.argv.slice(2);
const command = args[0] ?? "help";

let configPath = "creator.config.json";
let outPath: string | undefined;
let dryRun = false;
let apply = false;

for (let index = 1; index < args.length; index += 1) {
  const arg = args[index];
  if ((arg === "--config" || arg === "-c") && args[index + 1]) {
    configPath = args[index + 1];
    index += 1;
  } else if ((arg === "--out" || arg === "-o") && args[index + 1]) {
    outPath = args[index + 1];
    index += 1;
  } else if (arg === "--dry-run") {
    dryRun = true;
  } else if (arg === "--apply") {
    apply = true;
  }
}

try {
  if (command === "wizard") {
    await runWizard({ configPath });
  } else if (command === "sync") {
    await syncConfig({ configPath, outPath, apply });
  } else if (command === "validate") {
    const config = await loadConfig(configPath);
    const result = validateConfig(config);

    console.log("Roblox Creator Automator");
    console.log(`Config: ${configPath}`);
    console.log(`Mode: ${dryRun ? "dry run" : "validate"}`);

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
    } else {
      console.log("\nConfig is valid.");
      console.log(`Game passes: ${config.gamePasses?.length ?? 0}`);
      console.log(`Developer products: ${config.developerProducts?.length ?? 0}`);

      if (outPath) {
        await writeFile(outPath, generateLuauModule(config), "utf8");
        console.log(`Generated Luau config: ${outPath}`);
      }
    }
  } else {
    console.log("Usage: rba wizard|validate|sync --config creator.config.json [--dry-run] [--apply] [--out CreatorProducts.lua]");
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
