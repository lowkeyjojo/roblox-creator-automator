# Contributing

Thanks for helping improve Roblox Creator Automator.

## Good first contributions

- Improve examples
- Add validation rules
- Improve CLI messages
- Write tests
- Improve documentation

## Local setup

```bash
npm install
npm run build
npm test
```

## Pull request checklist

Before opening a pull request, please make sure:

- The project builds with `npm run build`
- Tests pass with `npm test`
- New behavior is documented when needed
- Write actions remain previewable through dry-run behavior

## Project direction

This project should focus on safe Roblox creator tooling that uses official APIs where supported. Avoid features that depend on private endpoints, browser scraping, or insecure credential handling.
