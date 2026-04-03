<p align="center">
<h1 align="center">🎨 NIMGEN</h1>
<p align="center">
<strong>First MCP Server for NVIDIA NIM FLUX</strong>
</p>
<p align="center">
Generate and edit images using FLUX.1 models with your existing NVIDIA API key.
<br />
No extra subscriptions. No separate API keys. Just NIM.
</p>

<p align="center">
<a href="https://www.npmjs.com/package/nimgen"><img src="https://img.shields.io/npm/v/nimgen.svg?color=blue&label=npm" alt="npm version"></a>
<a href="https://github.com/gabriel-ferraresi/NIMGEN/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"></a>
<a href="https://build.nvidia.com"><img src="https://img.shields.io/badge/Powered%20by-NVIDIA%20NIM-76B900?logo=nvidia" alt="NVIDIA NIM"></a>
</p>

<p align="center">
<a href="#why-nimgen">Why NIMGEN?</a> •
<a href="#quick-start">Quick Start</a> •
<a href="#tools">Tools</a> •
<a href="#models">Models</a> •
<a href="#configuration">Configuration</a>
</p>

---

## Why NIMGEN?

**NIMGEN is the first MCP server specifically built for NVIDIA NIM FLUX models.**

Most image generation MCP servers require separate API keys from providers like Replicate, Stability AI, or OpenAI. **NIMGEN uses your existing NVIDIA API key** — the same one you already use for LLM inference via NIM.

| Feature | NIMGEN | Other MCPs |
|---------|--------|------------|
| Uses existing NVIDIA key | ✅ | ❌ |
| No extra subscription | ✅ | ❌ |
| FLUX.1 models via NIM | ✅ | Some (via Replicate) |
| Image editing (Kontext) | ✅ | Rare |
| Free NIM credits (1000+) | ✅ | Varies |
| Self-hosted option | ✅ | Limited |

---

## Quick Start

### 1. Get your NVIDIA API Key

If you don't have one already, get it free at [build.nvidia.com](https://build.nvidia.com).

### 2. Set the environment variable

```bash
# Windows (PowerShell)
$env:NVIDIA_API_KEY = "nvapi-your-key-here"

# Linux / macOS
export NVIDIA_API_KEY="nvapi-your-key-here"
```

### 3. Add to your MCP client

#### OpenCode / Oh-My-OpenCode

Add to your `opencode.jsonc`:

```jsonc
{
  "mcp": {
    "nimgen": {
      "type": "local",
      "command": ["npx", "-y", "nimgen"],
      "environment": {
        "NVIDIA_API_KEY": "{env:NVIDIA_API_KEY}"
      },
      "enabled": true,
      "timeout": 60000
    }
  }
}
```

#### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nimgen": {
      "command": "npx",
      "args": ["-y", "nimgen"],
      "env": {
        "NVIDIA_API_KEY": "nvapi-your-key-here"
      }
    }
  }
}
```

#### Cursor / VS Code

Add to `.cursor/mcp.json` or `.vscode/mcp.json`:

```json
{
  "servers": {
    "nimgen": {
      "command": "npx",
      "args": ["-y", "nimgen"],
      "env": {
        "NVIDIA_API_KEY": "nvapi-your-key-here"
      }
    }
  }
}
```

---

## Tools

### `generate_image`

Generate an image from a text description using NVIDIA NIM FLUX models.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ✅ | — | Text description of the image |
| `model` | string | — | `flux-1-dev` | Model: `flux-1-dev` or `flux-1-schnell` |
| `aspect_ratio` | string | — | `1:1` | Ratio: `1:1`, `16:9`, `9:16`, `4:3`, etc. |
| `steps` | number | — | auto | Inference steps (more = better quality) |
| `cfg_scale` | number | — | `5` | Prompt adherence (1-20) |
| `negative_prompt` | string | — | — | Things to exclude |
| `seed` | number | — | `0` | Seed for reproducibility |

### `edit_image`

Edit an existing image using text instructions (FLUX.1-Kontext).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | ✅ | — | Edit instructions |
| `image_path` | string | ✅ | — | Path to source image |
| `steps` | number | — | `20` | Inference steps (1-30) |
| `cfg_scale` | number | — | `7` | Prompt adherence (1-20) |
| `seed` | number | — | `0` | Seed for reproducibility |

### `list_models`

List all available FLUX models on NVIDIA NIM and their capabilities.

---

## Models

| Model | Key | Type | Speed | Quality | Best For |
|-------|-----|------|-------|---------|----------|
| **FLUX.1 Dev** | `flux-1-dev` | Text → Image | Medium | ⭐⭐⭐⭐⭐ | Final art, production assets |
| **FLUX.1 Schnell** | `flux-1-schnell` | Text → Image | Fast | ⭐⭐⭐ | Prototyping, quick drafts |
| **FLUX.1 Kontext** | `flux-1-kontext` | Image → Image | Medium | ⭐⭐⭐⭐ | Photo editing, mockups |

---

## Configuration

All configuration is via environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NVIDIA_API_KEY` | ✅ | — | Your NVIDIA API key (`nvapi-...`) |
| `NIMGEN_OUTPUT_DIR` | — | `./nimgen-output` | Directory to save generated images |
| `NIMGEN_BASE_URL` | — | `https://ai.api.nvidia.com/v1/genai` | Custom NIM endpoint |

### Self-Hosted NIM

If you're running NIM locally with Docker, set the base URL:

```bash
export NIMGEN_BASE_URL="http://localhost:8000/v1"
```

---

## Examples

### Social Media Post

```
Generate an image: Professional tech company social media banner
with gradient background from dark blue to purple, abstract
geometric shapes, and clean modern aesthetic. Aspect ratio 16:9.
```

### Product Mockup

```
Edit this image: Add a holographic logo floating above
the laptop screen with volumetric lighting and lens flare.
```

### Tattoo Preview

```
Edit this image: Add a realistic Japanese dragon tattoo
covering the forearm, black and gray style with fine
line work, photorealistic skin texture.
```

### Website Hero Image

```
Generate an image: Futuristic data center with rows of
glowing server racks, blue and green LED lighting,
cinematic perspective, ultra-wide aspect ratio 21:9.
```

---

## Development

```bash
# Clone and install
git clone https://github.com/gabriel-ferraresi/NIMGEN.git
cd NIMGEN
npm install

# Build
npm run build

# Run locally
NVIDIA_API_KEY=nvapi-... node dist/index.js
```

---

## License

Apache-2.0 — see [LICENSE](LICENSE) for details.

---

<p align="center">
Built with 💚 by <a href="https://www.tech86.com.br">Gabriel Ferraresi</a>
<br />
Powered by <a href="https://build.nvidia.com">NVIDIA NIM</a> + <a href="https://modelcontextprotocol.io">Model Context Protocol</a>
</p>
