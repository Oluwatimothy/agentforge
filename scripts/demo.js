#!/usr/bin/env node
/**
 * AgentForge Demo Script
 * Run this to generate live demo data while presenting
 * 
 * Usage: node scripts/demo.js
 */

const BASE_URL = process.env.DEMO_URL || "http://localhost:3000";

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  return res.json();
}

function log(emoji, msg) {
  console.log(`\n${emoji}  ${msg}`);
}

function divider() {
  console.log("\n" + "─".repeat(60));
}

async function main() {
  console.clear();
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║         AGENTFORGE — LIVE DEMO SEQUENCE                ║");
  console.log("║         Autonomous AI Economy on 0G Network            ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  await sleep(1000);

  // ─── STEP 1: Create Agents ───────────────────────────────────
  divider();
  log("🤖", "STEP 1: Creating autonomous AI agents on 0G Network...");

  const agentA = await post("/api/agents", {
    name: "Discovery-1",
    type: "RESEARCH",
  });

  if (agentA.success) {
    log("✅", `Agent created: ${agentA.data.name}`);
    log("📦", `0G Storage ID: ${agentA.zeroG?.storageId?.slice(0, 30)}...`);
    log("⛓️ ", `0G Chain TX:   ${agentA.zeroG?.txHash?.slice(0, 30)}...`);
    log("🧠", `Initial memory stored on 0G`);
  }

  await sleep(1500);

  const agentB = await post("/api/agents", {
    name: "Quant-9",
    type: "MARKET_ANALYST",
  });

  if (agentB.success) {
    log("✅", `Agent created: ${agentB.data.name}`);
    log("📦", `0G Storage ID: ${agentB.zeroG?.storageId?.slice(0, 30)}...`);
  }

  await sleep(1000);

  // ─── STEP 2: Generate Knowledge Asset ────────────────────────
  divider();
  log("🧠", "STEP 2: Agent Discovery-1 generating knowledge asset...");
  log("⏳", "AI generating → uploading to 0G Storage → registering ownership...");

  const asset = await post("/api/assets", {
    agentId: agentA.data.id,
    assetType: "MARKET_ANALYSIS",
    topic: "AI Agent Economy Infrastructure Market Q4 2024",
    price: 35,
  });

  if (asset.success) {
    log("✅", `Asset created: "${asset.data.title}"`);
    log("📦", `0G Storage ID:    ${asset.zeroG?.storageId?.slice(0, 30)}...`);
    log("⛓️ ", `Ownership TX:     ${asset.zeroG?.ownershipTx?.slice(0, 30)}...`);
    log("🌳", `Merkle Root:      ${asset.zeroG?.rootHash?.slice(0, 30)}...`);
    log("⭐", `Reputation gained: +${asset.reputation?.gained} (now ${asset.reputation?.new})`);
  }

  await sleep(1500);

  // ─── STEP 3: Store Memory ────────────────────────────────────
  divider();
  log("🧠", "STEP 3: Storing agent memory on 0G...");

  const memory = await post("/api/memory", {
    agentId: agentA.data.id,
    content: `I completed a market analysis on AI Agent Economy Infrastructure. Quality score 88/100. Asset stored on 0G with ID ${asset.zeroG?.storageId?.slice(0, 20)}...`,
    memoryType: "task_completion",
    importance: 0.9,
  });

  if (memory.success) {
    log("✅", `Memory stored on 0G Network`);
    log("📦", `Memory Storage ID: ${memory.zeroG?.storageId?.slice(0, 30)}...`);
    log("🔗", `Memory TX Hash:    ${memory.zeroG?.txHash?.slice(0, 30)}...`);
    log("💡", `"If you remove 0G now, this memory is gone. Agent wakes up blank."`);
  }

  await sleep(1500);

  // ─── STEP 4: Purchase ────────────────────────────────────────
  divider();
  log("🛒", "STEP 4: Agent Quant-9 discovering and purchasing the asset...");

  const purchase = await post("/api/marketplace", {
    buyerAgentId: agentB.data.id,
    assetId: asset.data.id,
  });

  if (purchase.success) {
    log("✅", `Purchase complete!`);
    log("⛓️ ", `Ownership TX:  ${purchase.zeroG?.ownershipTxHash?.slice(0, 30)}...`);
    log("📦", `Ownership ID:  ${purchase.zeroG?.ownershipStorageId?.slice(0, 30)}...`);
    log("⭐", `Seller rep: +${purchase.reputation?.seller?.gained} | Buyer rep: +${purchase.reputation?.buyer?.gained}`);
    log("💡", `"Ownership is on 0G Chain. No central server holds this record."`);
  }

  await sleep(1500);

  // ─── STEP 5: Check State ─────────────────────────────────────
  divider();
  log("📊", "STEP 5: Verifying economy state...");

  const leaderboard = await get("/api/reputation");
  log("🏆", "Reputation Leaderboard (persisted on 0G):");
  leaderboard.data?.slice(0, 5).forEach((a, i) => {
    console.log(`   ${i + 1}. ${a.name.padEnd(15)} ⭐ ${a.reputation.toFixed(1)}`);
  });

  const stats = await get("/api/stats");
  if (stats.data) {
    log("📈", "Economy Stats:");
    console.log(`   Agents:      ${stats.data.totalAgents}`);
    console.log(`   Assets:      ${stats.data.totalAssets}`);
    console.log(`   Volume:      ${stats.data.totalVolume}Ⓐ`);
    console.log(`   Memories:    ${stats.data.totalMemories}`);
    console.log(`   0G Mode:     ${stats.data.mode}`);
    console.log(`   Network:     ${stats.data.network?.name}`);
  }

  // ─── SUMMARY ─────────────────────────────────────────────────
  divider();
  console.log("\n🎯  DEMO COMPLETE — Key Points for Judges:\n");
  console.log("   1. ✅ Agent memory persists on 0G (not in RAM, not in DB)");
  console.log("   2. ✅ Knowledge assets stored immutably on 0G Storage");
  console.log("   3. ✅ Ownership records on 0G Chain (verifiable, unforgeable)");
  console.log("   4. ✅ Reputation persists across sessions via 0G");
  console.log("   5. ✅ Transaction history auditable on 0G");
  console.log("\n   ❓ Remove 0G? Agents forget. Assets vanish. Economy collapses.");
  console.log("\n   🌐 Open http://localhost:3000 to see the full UI\n");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch(console.error);
