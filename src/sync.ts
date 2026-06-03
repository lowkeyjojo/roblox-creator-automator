import { writeFile } from "node:fs/promises";
import { loadConfig, validateConfig } from "./config.js";
import { generateLuauModule } from "./luau.js";
import { getCreatedId, OpenCloudClient } from "./openCloud.js";
import type { CreatorConfig, CreatorItem } from "./types.js";

export interface SyncOptions {
  configPath: string;
  outPath?: string;
  apply: boolean;
}

export async function syncConfig(options: SyncOptions): Promise<void> {
  const config = await loadConfig(options.configPath);
  const result = validateConfig(config);

  if (!result.valid) {
    printProblems(result.errors, result.warnings);
    throw new Error("Config has errors. Fix them before syncing.");
  }

  printProblems([], result.warnings);

  console.log("Roblox Creator Automator Sync");
  console.log(`Config: ${options.configPath}`);
  console.log(`Mode: ${options.apply ? "apply" : "dry run"}`);

  if (!options.apply) {
    printDryRun(config);
    return;
  }

  const apiKey = process.env.ROBLOX_OPEN_CLOUD_API_KEY;
  if (!apiKey) {
    throw new Error("Set ROBLOX_OPEN_CLOUD_API_KEY before using --apply.");
  }

  const client = new OpenCloudClient({ apiKey });
  const updatedConfig: CreatorConfig = structuredClone(config);

  updatedConfig.gamePasses = await createMissingItems(
    "game pass",
    config.universeId,
    updatedConfig.gamePasses ?? [],
    (item) => client.createGamePass(config.universeId, item)
  );

  updatedConfig.developerProducts = await createMissingItems(
    "developer product",
    config.universeId,
    updatedConfig.developerProducts ?? [],
    (item) => client.createDeveloperProduct(config.universeId, item)
  );

  await writeFile(options.configPath, `${JSON.stringify(updatedConfig, null, 2)}\n`, "utf8");
  console.log(`Updated IDs in ${options.configPath}.`);

  if (options.outPath) {
    await writeFile(options.outPath, generateLuauModule(updatedConfig), "utf8");
    console.log(`Generated Luau config: ${options.outPath}`);
  }
}

async function createMissingItems(
  itemType: string,
  universeId: string,
  items: CreatorItem[],
  create: (item: CreatorItem) => Promise<unknown>
): Promise<CreatorItem[]> {
  const updated: CreatorItem[] = [];

  for (const item of items) {
    if (item.id) {
      console.log(`Skipping ${itemType} with existing ID: ${item.name}`);
      updated.push(item);
      continue;
    }

    console.log(`Creating ${itemType}: ${item.name}`);
    const response = await create(item);
    const id = getCreatedId(response as never);

    if (!id) {
      throw new Error(`Created ${itemType} ${item.name}, but no ID was returned.`);
    }

    updated.push({ ...item, id });
    console.log(`Created ${itemType}: ${item.name} (${id}) for universe ${universeId}`);
  }

  return updated;
}

function printDryRun(config: CreatorConfig): void {
  const gamePasses = config.gamePasses ?? [];
  const developerProducts = config.developerProducts ?? [];

  console.log("\nDry run only. No Roblox changes were made.");
  console.log("\nGame passes to create:");
  printItems(gamePasses.filter((item) => !item.id));

  console.log("\nDeveloper products to create:");
  printItems(developerProducts.filter((item) => !item.id));

  console.log("\nTo apply these changes, set ROBLOX_OPEN_CLOUD_API_KEY and run sync with --apply.");
}

function printItems(items: CreatorItem[]): void {
  if (items.length === 0) {
    console.log("- None");
    return;
  }

  items.forEach((item) => {
    console.log(`- ${item.name} (${item.price} Robux)`);
  });
}

function printProblems(errors: string[], warnings: string[]): void {
  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((error) => console.log(`- ${error}`));
  }

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }
}
