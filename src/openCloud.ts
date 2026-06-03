import type { CreatorItem } from "./types.js";

export interface OpenCloudClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface OpenCloudCreateResponse {
  id?: string;
  path?: string;
  displayName?: string;
  [key: string]: unknown;
}

export class OpenCloudClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: OpenCloudClientOptions) {
    this.apiKey = normalizeCredential(options.apiKey);
    this.baseUrl = options.baseUrl ?? "https://apis.roblox.com";
  }

  async createGamePass(universeId: string, item: CreatorItem): Promise<OpenCloudCreateResponse> {
    return this.post(`/cloud/v2/universes/${encodeURIComponent(universeId)}/game-passes`, buildCreatePayload(item));
  }

  async createDeveloperProduct(universeId: string, item: CreatorItem): Promise<OpenCloudCreateResponse> {
    return this.post(
      `/cloud/v2/universes/${encodeURIComponent(universeId)}/developer-products`,
      buildCreatePayload(item)
    );
  }

  private async post(path: string, body: unknown): Promise<OpenCloudCreateResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    const parsed = text.length > 0 ? safeJsonParse(text) : {};

    if (!response.ok) {
      const message = getErrorMessage(parsed) ?? text ?? response.statusText;
      throw new Error(`Open Cloud request failed (${response.status}): ${message}`);
    }

    return parsed as OpenCloudCreateResponse;
  }
}

export function getCreatedId(response: OpenCloudCreateResponse): string | undefined {
  if (typeof response.id === "string" && response.id.length > 0) {
    return response.id;
  }

  if (typeof response.path === "string" && response.path.length > 0) {
    return response.path.split("/").at(-1);
  }

  return undefined;
}

function normalizeCredential(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Open Cloud credential is required.");
  }

  const hasStraightQuotes =
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));

  const unwrapped = hasStraightQuotes ? trimmed.slice(1, -1).trim() : trimmed;
  const invalid = [...unwrapped].find((char) => char.charCodeAt(0) > 255);

  if (invalid) {
    throw new Error(
      "Open Cloud credential contains a smart quote or another invalid character. Re-copy it using plain straight quotes in Terminal."
    );
  }

  return unwrapped;
}

function buildCreatePayload(item: CreatorItem): Record<string, unknown> {
  return {
    displayName: item.name,
    description: item.description ?? "",
    price: item.price
  };
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getErrorMessage(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  const record = value as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;
  if (typeof record.error === "string") return record.error;

  return undefined;
}
