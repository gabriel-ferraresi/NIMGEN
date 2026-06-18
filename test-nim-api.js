#!/usr/bin/env node

/**
 * Test script for NVIDIA NIM FLUX API
 * Run: node test-nim-api.js
 */

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const BASE_URL = process.env.NIMGEN_BASE_URL || "https://ai.api.nvidia.com/v1/genai";

if (!NVIDIA_API_KEY) {
  console.error("❌ NVIDIA_API_KEY environment variable is required.");
  console.error("   Set it with: $env:NVIDIA_API_KEY = 'nvapi-your-key'");
  process.exit(1);
}

const MODELS = [
  { id: "black-forest-labs/flux_1-dev", name: "FLUX.1-dev" },
  { id: "black-forest-labs/flux_1-schnell", name: "FLUX.1-schnell" },
  { id: "black-forest-labs/flux_1-kontext-dev", name: "FLUX.1-kontext-dev" },
];

async function testModel(model) {
  const url = `${BASE_URL}/${model.id}`;
  console.log(`\n🧪 Testing: ${model.name}`);
  console.log(`   URL: ${url}`);

  const payload = {
    prompt: "A beautiful sunset over mountains, photorealistic",
    steps: model.id.includes("schnell") ? 4 : 20,
    seed: 0,
  };

  if (!model.id.includes("schnell")) {
    payload.cfg_scale = 5;
  }

  console.log(`   Payload: ${JSON.stringify(payload)}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText.substring(0, 500)}`);
      return false;
    }

    const data = await response.json();
    console.log(`   ✅ Success! Response keys: ${Object.keys(data).join(", ")}`);
    
    // Check for image data
    const hasImage = data.artifacts || data.b64_json || data.image;
    if (hasImage) {
      console.log(`   📷 Image data received (${Object.keys(data).join(", ")})`);
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Exception: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("NVIDIA NIM FLUX API Test");
  console.log("=".repeat(60));
  console.log(`API Key: ${NVIDIA_API_KEY.substring(0, 10)}...`);
  console.log(`Base URL: ${BASE_URL}`);

  const results = [];
  
  for (const model of MODELS) {
    const success = await testModel(model);
    results.push({ name: model.name, success });
  }

  console.log("\n" + "=".repeat(60));
  console.log("Summary:");
  console.log("=".repeat(60));
  
  for (const result of results) {
    const status = result.success ? "✅ PASS" : "❌ FAIL";
    console.log(`   ${result.name}: ${status}`);
  }

  const passed = results.filter(r => r.success).length;
  console.log(`\nTotal: ${passed}/${results.length} passed`);
}

main().catch(console.error);
