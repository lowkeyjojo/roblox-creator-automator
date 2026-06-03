import { readFile } from "node:fs/promises";
import type { CreatorConfig, CreatorItem, ValidationResult } from "./types.js";

export async function loadConfig(path: string): Promise<CreatorConfig> {
  const raw = await readFile(path, "utf8");
  const parsed: unknown = JSON.parse(raw);
  return parsed as CreatorConfig;
}

export function validateConfig(config: CreatorConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config || typeof config !== "object") {
    return { valid: false, errors: ["Config must be a JSON object."], warnings };
  }

  if (!isNonEmptyString(config.universeId)) {
    errors.push("universeId is required and must be a string.");
  }

  validateItems("gamePasses", config.gamePasses, errors, warnings);
  validateItems("developerProducts", config.developerProducts, errors, warnings);

  if ((config.gamePasses?.length ?? 0) === 0 && (config.developerProducts?.length ?? 0) === 0) {
    warnings.push("No gamePasses or developerProducts were provided.");
  }

  return { valid: errors.length === 0, errors, warnings };
}

function validateItems(
  fieldName: "gamePasses" | "developerProducts",
  items: CreatorItem[] | undefined,
  errors: string[],
  warnings: string[]
): void {
  if (items === undefined) return;

  if (!Array.isArray(items)) {
    errors.push(`${fieldName} must be an array when provided.`);
    return;
  }

  const seenNames = new Set<string>();

  items.forEach((item, index) => {
    const label = `${fieldName}[${index}]`;

    if (!item || typeof item !== "object") {
      errors.push(`${label} must be an object.`);
      return;
    }

    if (!isNonEmptyString(item.name)) {
      errors.push(`${label}.name is required.`);
    } else {
      const normalized = item.name.trim().toLowerCase();
      if (seenNames.has(normalized)) {
        warnings.push(`${label}.name duplicates another ${fieldName} entry: ${item.name}`);
      }
      seenNames.add(normalized);
    }

    if (!Number.isInteger(item.price) || item.price < 0) {
      errors.push(`${label}.price must be a non-negative integer.`);
    }

    if (!isNonEmptyString(item.description)) {
      warnings.push(`${label}.description is empty or missing.`);
    }

    if (!isNonEmptyString(item.icon)) {
      warnings.push(`${label}.icon is empty or missing.`);
    }
  });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
