# macOS Setup

Roblox Creator Automator works on macOS because it is a Node.js and TypeScript CLI project.

## Requirements

- macOS 13 or newer recommended
- Node.js 22 or newer
- npm 10 or newer
- Git

## Install Node with Homebrew

If you already have Node 22 or newer, you can skip this section.

```bash
brew install node
node --version
npm --version
```

## Install Node with nvm

This repo includes a `.nvmrc` file so macOS users can install the correct Node version.

```bash
brew install nvm
nvm install
nvm use
node --version
```

## Run the project

```bash
git clone https://github.com/lowkeyjojo/roblox-creator-automator.git
cd roblox-creator-automator
npm install
npm run build
npm test
npm run validate:example
```

## Generate a Luau config file

```bash
npm run export:example
```

This creates `CreatorProducts.lua` in the project folder.

## Common macOS notes

### Permission denied when running the CLI directly

Use Node directly:

```bash
node dist/cli.js validate --config examples/creator.config.example.json --dry-run
```

Or make the compiled CLI executable:

```bash
chmod +x dist/cli.js
./dist/cli.js validate --config examples/creator.config.example.json --dry-run
```

### GitHub folder says permission denied

Make sure you `cd` into a folder you own, such as:

```bash
cd ~/Documents
```

Then clone the repo there.

### npm install fails

Check that Node is version 22 or newer:

```bash
node --version
```

Then delete dependencies and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```
