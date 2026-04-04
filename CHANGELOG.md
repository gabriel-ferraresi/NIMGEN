# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepchangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-04-03

### Fixed
- **Critical**: Removed `aspect_ratio` parameter - NVIDIA NIM API does not support this parameter
  - This was causing 422 API errors on all image generation requests
  - Removed from all model configurations, input schema, and response output
- Corrected email address from `gabriel@tech86.com` to `gabriel@tech86.com.br` in all project files

### Removed
- `supportsAspectRatio` property from model interface
- `ASPECT_RATIOS` constant and `AspectRatio` type
- `aspect_ratio` from tool parameters

## [1.1.0] - 2026-04-03

### Fixed
- **Critical**: Corrected FLUX.1-schnell model ID from `flux.1-schnell` to `flux_1-schnell` (API compatibility)
- **Security**: Added path traversal validation in `edit_image` to prevent arbitrary file reads
- **Security**: Added API key format validation (must start with `nvapi-`)

### Added
- **Security**: Image magic number validation (PNG, JPEG, WebP, GIF only)
- **Security**: Maximum image size limit (50MB) for input files
- **Security**: Maximum prompt length validation (2000 characters)
- **UX**: Improved error messages with helpful suggestions for common issues
- **Docs**: Comprehensive glossary explaining MCP, NIM, FLUX, and technical terms
- **Docs**: Detailed FAQ section covering common questions
- **Docs**: Complete troubleshooting guide with error table
- **Docs**: Step-by-step guide for obtaining NVIDIA API key
- **Docs**: Limitations section with rate limits and technical constraints

### Changed
- Error messages now provide actionable solutions instead of raw API errors
- README restructured for better accessibility to new users

### Security
- Fixed path traversal vulnerability in `loadImageAsBase64`
- Added input validation for all user-provided parameters
- Restricted file access to allowed directories only

## [1.0.1] - 2026-04-03

### Changed
- Removed internal PUBLISHING.md from package
- Updated .npmignore to exclude internal documentation

## [1.0.0] - 2026-04-03

### Added
- **First release of NIMGEN** - First MCP server for NVIDIA NIM FLUX models
- `generate_image` tool for text-to-image generation
- Support for FLUX.1-dev (high quality)
- Support for FLUX.1-schnell (fast generation)
- Configurable steps, cfg_scale, seed, negative_prompt
- `edit_image` tool for image editing via FLUX.1-Kontext
- Contextual image editing with text instructions
- Support for image path input
- `list_models` tool to display available FLUX models
- Environment variable configuration:
  - `NVIDIA_API_KEY` (required)
  - `NIMGEN_OUTPUT_DIR` (optional)
  - `NIMGEN_BASE_URL` (optional, for self-hosted NIM)
- Self-hosted NIM support via custom base URL
- Automatic output directory creation
- Timestamped output files with UUID suffix
- Cross-platform support (Windows, Linux, macOS)
- Integration with:
  - OpenCode / Oh-My-OpenCode
  - Claude Desktop
  - Cursor
  - VS Code

### Technical Details
- Built with TypeScript 5.7+
- Uses @modelcontextprotocol/sdk v1.12.0
- Apache-2.0 licensed
- Node.js 18+ required

### Pioneer Status
- **First MCP server** specifically built for NVIDIA NIM FLUX API
- Uses existing NVIDIA API key (no separate subscription)
- Direct integration with NVIDIA NIM microservices

---

## Future Roadmap

### [1.2.0] - Planned
- FLUX.2 models support when available on NIM
- Image upscaling capabilities
- Batch generation support
- Progress callbacks for long generations

### [1.3.0] - Planned
- Image-to-image with multiple input formats
- Style presets for common use cases
- Integration tests suite
- Performance benchmarks

---

[1.1.1]: https://github.com/gabriel-ferraresi/NIMGEN/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/gabriel-ferraresi/NIMGEN/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/gabriel-ferraresi/NIMGEN/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/gabriel-ferraresi/NIMGEN/releases/tag/v1.0.0
