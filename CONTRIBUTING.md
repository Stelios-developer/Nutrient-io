# Contributing to NUTRIENT.IO

Thank you for your interest in contributing! Here's everything you need to know.

## Getting Started

1. Fork the repository and clone your fork
2. Follow the setup steps in [README.md](README.md)
3. Create a new branch for your feature or fix

## Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/barcode-scanner` |
| Bug Fix | `fix/description` | `fix/iron-calculation-error` |
| Docs | `docs/description` | `docs/update-api-endpoints` |
| Refactor | `refactor/description` | `refactor/food-search-hook` |

## Commit Messages

Use clear, prefixed commit messages:

```
Add: barcode scanner for food logging
Fix: incorrect RDA calculation for pregnant users
Update: USDA food search to use v2 API
Remove: deprecated nutrient scoring function
```

## Code Standards

- Use **ESLint** and **Prettier** (config included)
- Write meaningful variable names — no `x`, `temp`, `data2`
- Comment complex logic, especially nutrition calculations
- Keep components small and focused (single responsibility)

## Pull Requests

- Open a PR against the `main` branch
- Describe **what** you changed and **why**
- Reference any related issues with `Closes #123`
- At least one passing CI check is required before merge

## Reporting Bugs

Open a GitHub Issue and include:
- Steps to reproduce
- Expected vs actual behaviour
- Your OS, Node.js version, and browser

## Feature Requests

Open a GitHub Issue with the `enhancement` label. Describe the use case and why it would benefit users.

---

*Thanks for helping make NUTRIENT.IO better for everyone!*
