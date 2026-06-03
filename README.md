# Roblox Creator Automator

Roblox Creator Automator is an open-source CLI tool for Roblox developers who want to automate repetitive creator workflows using official Roblox Open Cloud APIs.

The goal is to help developers save time when setting up games, products, passes, assets, metadata, and config files across multiple Roblox experiences.

## Planned Features

- Create and update Roblox game passes from a config file
- Create and update developer products from a config file
- Generate a Roblox-ready Lua config module with created IDs
- Validate product names, prices, descriptions, and icons before upload
- Support dry-run mode before making real API changes
- Track failed operations and moderation/status results
- Help developers organize supported assets and metadata
- Safe rate limiting to avoid spammy API behavior

## Why This Exists

Roblox developers often repeat the same Creator Dashboard setup across many games. Manually creating game passes, developer products, icons, descriptions, and config values is slow and easy to mess up.

This project gives Roblox creators a safer open-source automation tool built around official APIs instead of sketchy browser bots or cookie-based automation.

## Example Config

```json
{
  "universeId": "123456789",
  "gamePasses": [
    {
      "name": "VIP",
      "description": "Unlocks VIP benefits in-game.",
      "price": 99,
      "icon": "./assets/vip.png"
    }
  ],
  "developerProducts": [
    {
      "name": "100 Coins",
      "description": "Grants 100 coins.",
      "price": 25,
      "icon": "./assets/coins-100.png"
    }
  ]
}
