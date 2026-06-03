export interface CreatorItem {
  name: string;
  description?: string;
  price: number;
  icon?: string;
  id?: string;
}

export interface CreatorConfig {
  universeId: string;
  gamePasses?: CreatorItem[];
  developerProducts?: CreatorItem[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
