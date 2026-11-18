#!/usr/bin/env node
/**
 * 从上游 Open Audio Registry 拉一次完整 JSON，原样写入 plugin-registry.json。
 *
 * 用法：`node sync.mjs [--out plugin-registry.json]`
 *
 * - 内容不合法（没有 plugins 对象 / 为空）→ 不覆盖；
 * - 内容没变化 → 不写文件（让 workflow 的 diff 为空）；
 * - 上游不可达 → 退出码 1（workflow 会红，但不会破坏已有文件）。
 */
import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";

const SOURCE = process.env.REGISTRY_SOURCE?.trim() || "https://open-audio-stack.github.io/open-audio-stack-registry/";
const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const OUT = outIndex >= 0 && args[outIndex + 1] ? args[outIndex + 1] : "plugin-registry.json";
const TIMEOUT_MS = 180_000;

function validate(text) {
  const data = JSON.parse(text);
  const plugins = data?.plugins;
  if (!plugins || typeof plugins !== "object" || Array.isArray(plugins)) throw new Error("JSON 里没有 plugins 对象");
  if (Object.keys(plugins).length === 0) throw new Error("plugins 为空");
  return Object.keys(plugins).length;
}

const response = await fetch(SOURCE, {
  redirect: "follow",
  headers: { accept: "application/json" },
  signal: AbortSignal.timeout(TIMEOUT_MS),
});
if (!response.ok) {
  console.error(`上游 HTTP ${response.status}`);
  process.exit(1);
}
const text = await response.text();
const count = validate(text);

const previous = await readFile(OUT, "utf8").catch(() => null);
if (previous === text) {
  console.log(`未变化（${count} 个插件）`);
  process.exit(0);
}

const digest = createHash("sha256").update(text).digest("hex").slice(0, 12);
const tmp = `${OUT}.${digest}.tmp`;
await writeFile(tmp, text, "utf8");
await rename(tmp, OUT);
console.log(`已更新 ${OUT}：${count} 个插件，${(Buffer.byteLength(text) / 1024).toFixed(0)} KB（sha256:${digest}）`);
