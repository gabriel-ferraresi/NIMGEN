# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email: **gabriel@tech86.com.br**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Resolution**: Depends on severity, typically within 30 days

### Disclosure Policy

We follow responsible disclosure:
1. Vulnerability is confirmed
2. Fix is developed and tested
3. Patch is released
4. Public disclosure after 30 days (or sooner if fix is widely deployed)

## Security Best Practices for Users

1. **Never commit your NVIDIA API key** to version control
2. Use environment variables for sensitive credentials
3. Keep NIMGEN updated to the latest version
4. Review generated content before sharing

## Known Security Considerations

- NIMGEN requires `NVIDIA_API_KEY` environment variable
- API keys are sent to NVIDIA's servers via HTTPS
- Generated images are saved locally in `nimgen-output/` directory

Thank you for helping keep NIMGEN secure!
