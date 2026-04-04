# Contributing to NIMGEN

Thank you for your interest in contributing to NIMGEN! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please be considerate of others.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include detailed reproduction steps
4. Provide environment information

### Suggesting Features

1. Use the feature request template
2. Describe the use case clearly
3. Explain why it would be useful

### Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/NIMGEN.git
cd NIMGEN

# Install dependencies
npm install

# Build
npm run build

# Test locally
export NVIDIA_API_KEY="nvapi-your-key"
node dist/index.js
```

## Pull Request Process

1. **Update documentation** if you change functionality
2. **Update CHANGELOG.md** with your changes
3. **Follow coding standards** (see below)
4. **Test your changes** before submitting

## Coding Standards

### TypeScript

- Use strict mode (already configured in tsconfig.json)
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public functions

### Code Style

- Use 2-space indentation
- Maximum line length: 100 characters
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays

### Commits

- Write clear commit messages
- Use present tense ("Add feature" not "Added feature")
- Reference issues when applicable

## Questions?

Feel free to open an issue or email gabriel@tech86.com.br

Thank you for contributing! 🎨
