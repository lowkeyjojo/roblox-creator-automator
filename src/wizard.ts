import { access, readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { validateConfig } from "./config.js";
import { generateLuauModule } from "./luau.js";
import type { CreatorConfig, CreatorItem } from "./types.js";

interface WizardOptions {
  configPath: string;
}

export async function runWizard(options: WizardOptions): Promise<void> {
  const rl = createInterface({ input, output });

  try {
    console.log("Roblox Creator Automator Wizard");
    console.log("This wizard edits a local config file and generates Luau output.");
    console.log("Official API write actions will be added after the Open Cloud auth layer is implemented.\n");

    const config = await loadOrCreateConfig(rl, options.configPath);

    while (true) {
      console.log("\nWhat do you want to do?");
      console.log("1. Add a game pass to the config");
      console.log("2. Add a developer product to the config");
      console.log("3. Validate the config");
      console.log("4. Generate Luau config file");
      console.log("5. Plan a supported asset upload");
      console.log("6. Exit");

      const choice = (await rl.question("Choose 1-6: ")).trim();

      if (choice === "1") {
        config.gamePasses = config.gamePasses ?? [];
        config.gamePasses.push(await promptCreatorItem(rl, "game pass"));
        await saveConfig(options.configPath, config);
        console.log(`Saved game pass to ${options.configPath}.`);
        continue;
      }

      if (choice === "2") {
        config.developerProducts = config.developerProducts ?? [];
        config.developerProducts.push(await promptCreatorItem(rl, "developer product"));
        await saveConfig(options.configPath, config);
        console.log(`Saved developer product to ${options.configPath}.`);
        continue;
      }

      if (choice === "3") {
        printValidation(config);
        continue;
      }

      if (choice === "4") {
        const outPath = await askWithDefault(rl, "Output Luau file", "CreatorProducts.lua");
        const result = validateConfig(config);
        if (!result.valid) {
          printValidation(config);
          console.log("Fix the errors before generating Luau output.");
          continue;
        }

        await writeFile(outPath, generateLuauModule(config), "utf8");
        console.log(`Generated ${outPath}.`);
        continue;
      }

      if (choice === "5") {
        console.log("\nSupported asset upload planning");
        console.log("For now, this wizard can help you track planned uploads, but it does not upload files yet.");
        console.log("Use official Roblox APIs where supported. Do not collect or store Roblox session cookies.");
        const filePath = await askRequired(rl, "Local asset file path");
        const displayName = await askRequired(rl, "Display name");
        const assetType = await askWithDefault(rl, "Asset type", "Image");
        console.log("\nPlanned upload:");
        console.log(`- Type: ${assetType}`);
        console.log(`- Name: ${displayName}`);
        console.log(`- File: ${filePath}`);
        continue;
      }

      if (choice === "6") {
        await saveConfig(options.configPath, config);
        console.log(`Saved ${options.configPath}.`);
        return;
      }

      console.log("Please choose a number from 1 to 6.");
    }
  } finally {
    rl.close();
  }
}

async function loadOrCreateConfig(rl: ReturnType<typeof createInterface>, path: string): Promise<CreatorConfig> {
  if (await exists(path)) {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw) as CreatorConfig;
  }

  console.log(`No config found at ${path}. Creating one.`);
  const universeId = await askRequired(rl, "Roblox universeId");
  const config: CreatorConfig = {
    universeId,
    gamePasses: [],
    developerProducts: []
  };

  await saveConfig(path, config);
  return config;
}

async function promptCreatorItem(
  rl: ReturnType<typeof createInterface>,
  itemType: "game pass" | "developer product"
): Promise<CreatorItem> {
  console.log(`\nNew ${itemType}`);
  const name = await askRequired(rl, "Name");
  const description = await askWithDefault(rl, "Description", "");
  const price = await askPrice(rl);
  const icon = await askWithDefault(rl, "Icon path", "");

  return { name, description, price, icon };
}

async function askPrice(rl: ReturnType<typeof createInterface>): Promise<number> {
  while (true) {
    const raw = await askRequired(rl, "Price in Robux");
    const price = Number(raw);
    if (Number.isInteger(price) && price >= 0) {
      return price;
    }
    console.log("Price must be a non-negative whole number.");
  }
}

async function askRequired(rl: ReturnType<typeof createInterface>, label: string): Promise<string> {
  while (true) {
    const answer = (await rl.question(`${label}: `)).trim();
    if (answer.length > 0) return answer;
    console.log(`${label} is required.`);
  }
}

async function askWithDefault(
  rl: ReturnType<typeof createInterface>,
  label: string,
  defaultValue: string
): Promise<string> {
  const answer = (await rl.question(`${label}${defaultValue ? ` (${defaultValue})` : ""}: `)).trim();
  return answer.length > 0 ? answer : defaultValue;
}

function printValidation(config: CreatorConfig): void {
  const result = validateConfig(config);

  if (result.errors.length > 0) {
    console.log("\nErrors:");
    result.errors.forEach((error) => console.log(`- ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log("\nWarnings:");
    result.warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (result.valid) {
    console.log("\nConfig is valid.");
    console.log(`Game passes: ${config.gamePasses?.length ?? 0}`);
    console.log(`Developer products: ${config.developerProducts?.length ?? 0}`);
  }
}

async function saveConfig(path: string, config: CreatorConfig): Promise<void> {
  await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
