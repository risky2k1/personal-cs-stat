import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const cursorRulesDir = path.join(rootDir, ".cursor", "rules");
const cursorSkillsDir = path.join(rootDir, ".cursor", "skills");
const docsAgentsDir = path.join(rootDir, "docs", "agents");
const docsSkillsDir = path.join(docsAgentsDir, "skills");
const agentsPath = path.join(rootDir, "AGENTS.md");
const claudePath = path.join(rootDir, "CLAUDE.md");

const AGENT_SYNC_START = "<!-- BEGIN:agent-sync -->";
const AGENT_SYNC_END = "<!-- END:agent-sync -->";

function stripFrontmatter(content) {
  if (!content.startsWith("---\n")) {
    return { attributes: {}, body: content.trim() };
  }

  const endIndex = content.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return { attributes: {}, body: content.trim() };
  }

  const rawFrontmatter = content.slice(4, endIndex).trim();
  const body = content.slice(endIndex + 5).trim();
  const attributes = {};

  for (const line of rawFrontmatter.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    attributes[key] = parseFrontmatterValue(rawValue);
  }

  return { attributes, body };
}

function parseFrontmatterValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function replaceBlock(content, startMarker, endMarker, replacement) {
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`Could not find block markers ${startMarker} / ${endMarker}`);
  }

  const before = content.slice(0, startIndex + startMarker.length);
  const after = content.slice(endIndex);
  return `${before}\n${replacement}\n${after}`;
}

async function listFiles(dir, extension) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function listDirectories(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function syncRules() {
  await mkdir(docsAgentsDir, { recursive: true });
  const ruleFiles = await listFiles(cursorRulesDir, ".mdc");
  const rules = [];

  for (const fileName of ruleFiles) {
    const sourcePath = path.join(cursorRulesDir, fileName);
    const source = await readFile(sourcePath, "utf8");
    const { attributes, body } = stripFrontmatter(source);
    const targetFileName = fileName.replace(/\.mdc$/, ".md");
    const targetPath = path.join(docsAgentsDir, targetFileName);
    const targetContent = [`Source: \`.cursor/rules/${fileName}\``, "", body, ""].join("\n");

    await writeFile(targetPath, targetContent, "utf8");

    rules.push({
      sourceFile: fileName,
      docFile: targetFileName,
      description: String(attributes.description || "").trim() || "No description",
      alwaysApply: attributes.alwaysApply === true,
      globs: typeof attributes.globs === "string" ? attributes.globs : "",
    });
  }

  return rules;
}

async function syncSkills() {
  await mkdir(docsSkillsDir, { recursive: true });
  const skillDirs = await listDirectories(cursorSkillsDir);
  const skills = [];

  for (const dirName of skillDirs) {
    const skillFile = path.join(cursorSkillsDir, dirName, "SKILL.md");
    try {
      await stat(skillFile);
    } catch {
      continue;
    }

    const source = await readFile(skillFile, "utf8");
    const lines = source.split("\n");
    const titleLine = lines.find((line) => line.startsWith("# ")) || `# ${dirName}`;
    const summaryLine =
      lines.find((line) => line.trim() && !line.startsWith("#"))?.trim() ||
      "No summary available.";
    const targetPath = path.join(docsSkillsDir, `${dirName}.md`);
    const targetContent = [`Source: \`.cursor/skills/${dirName}/SKILL.md\``, "", source.trim(), ""].join(
      "\n",
    );

    await writeFile(targetPath, targetContent, "utf8");

    skills.push({
      dirName,
      title: titleLine.replace(/^#\s+/, "").trim(),
      summary: summaryLine,
      docFile: `skills/${dirName}.md`,
    });
  }

  return skills;
}

async function syncDocsReadme(rules, skills) {
  const lines = [
    "# Agent Docs",
    "",
    "Generated by `pnpm sync:agents` from `.cursor/rules` and `.cursor/skills`.",
    "",
    "## Rules",
    "",
    "| Source | Mirror | Notes |",
    "|---|---|---|",
    ...rules.map((rule) => {
      const notes = [
        rule.alwaysApply ? "alwaysApply" : null,
        rule.globs ? `globs: \`${rule.globs}\`` : null,
      ]
        .filter(Boolean)
        .join(", ");
      return `| \`.cursor/rules/${rule.sourceFile}\` | \`docs/agents/${rule.docFile}\` | ${
        notes || "-"
      } |`;
    }),
    "",
    "## Skills",
    "",
    "| Source | Mirror | Summary |",
    "|---|---|---|",
    ...skills.map(
      (skill) =>
        `| \`.cursor/skills/${skill.dirName}/SKILL.md\` | \`docs/agents/${skill.docFile}\` | ${skill.summary.replaceAll(
          "|",
          "\\|",
        )} |`,
    ),
    "",
  ];

  await writeFile(path.join(docsAgentsDir, "README.md"), lines.join("\n"), "utf8");
}

async function syncAgentsFile(rules, skills) {
  const generatedLines = [
    "_Generated by `pnpm sync:agents` from `.cursor/rules` and `.cursor/skills`._",
    "",
    "Codex uses `AGENTS.md` as the repo entrypoint. There is no repo convention here named `.agent`.",
    "",
    "Treat `.cursor/` as the canonical source for repo-local assistant assets in this project.",
    "",
    "`CLAUDE.md` is generated from the same workflow. If you later add `.claude/` assets, extend this sync script instead of maintaining a second source of truth.",
    "",
    "Rules are mirrored to `docs/agents/*.md` so Codex can discover them without relying on Cursor-specific conventions.",
    "",
    "### Rules",
    "",
    "| Source | Codex mirror | Description |",
    "|---|---|---|",
    ...rules.map(
      (rule) =>
        `| \`.cursor/rules/${rule.sourceFile}\` | \`docs/agents/${rule.docFile}\` | ${rule.description.replaceAll(
          "|",
          "\\|",
        )} |`,
    ),
    "",
    "### Skills",
    "",
    "| Source | Codex mirror | Description |",
    "|---|---|---|",
    ...skills.map(
      (skill) =>
        `| \`.cursor/skills/${skill.dirName}/SKILL.md\` | \`docs/agents/${skill.docFile}\` | ${skill.summary.replaceAll(
          "|",
          "\\|",
        )} |`,
    ),
    "",
    "After adding or editing a rule or skill, run `pnpm sync:agents`.",
  ];

  const current = await readFile(agentsPath, "utf8");
  const updated = replaceBlock(current, AGENT_SYNC_START, AGENT_SYNC_END, generatedLines.join("\n"));
  await writeFile(agentsPath, updated, "utf8");
}

async function syncClaudeFile() {
  const content = [
    "# Claude entrypoint",
    "",
    "This file is generated by `pnpm sync:agents`.",
    "",
    "@AGENTS.md",
    "",
  ].join("\n");
  await writeFile(claudePath, content, "utf8");
}

async function main() {
  const rules = await syncRules();
  const skills = await syncSkills();
  await syncDocsReadme(rules, skills);
  await syncAgentsFile(rules, skills);
  await syncClaudeFile();
}

await main();
