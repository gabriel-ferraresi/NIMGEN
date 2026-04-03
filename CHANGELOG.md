# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### [1.1.0] - Planned
- FLUX.2 models support when available on NIM
- Image upscaling capabilities
- Batch generation support
- Progress callbacks for long generations

### [1.2.0] - Planned
- Image-to-image with multiple input formats
- Style presets for common use cases
- Integration tests suite

---

[1.0.0]: https://github.com/gabriel-ferraresi/NIMGEN/releases/tag/v1.0.0
