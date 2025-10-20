#!/usr/bin/env node
import { select, input } from "@inquirer/prompts";
import chalk from "chalk";
import ora from "ora";
import { execa } from "execa";
import degit from "degit";
import path from "path";

const GADGET_REPO = "https://github.com/maddlen/brush-gadget";
const SHOPIFY_REPO = "https://github.com/maddlen/brush-shopify";

async function main() {
  console.clear();
  console.log(chalk.cyan.bold("🖌️  Brush Installer"));
  console.log("");

  const whatToInstall = await select({
    message: "What to install?",
    choices: [
      {
        name: "Backend (for gadget.dev)",
        value: "gadget",
        description: "Use this to install the backend code into an existing gadget.dev project.",
      },
      {
        name: "Frontend (for Shopify theme)",
        value: "yarn",
        description: "Use this to install the frontend code into an existing Shopify theme.",
      },
    ],
  });

  const whereToInstall = await input({
    message: "In which relative directory to install? (Use . for current folder):",
  });

  const spinner = ora("Downloading project...").start();
  const emitter = degit(whatToInstall === "gadget" ? GADGET_REPO : SHOPIFY_REPO, {
    cache: false,
    force: true,
  });
  const target = path.resolve(process.cwd(), whereToInstall);
  await emitter.clone(target);

  if (whatToInstall === "gadget") {
    spinner.succeed("Gadget code installed!");
    return;
  }

  spinner.succeed("Shopify code downloaded!");
  process.chdir(`${whereToInstall}/brush`);
  const installSpinner = ora("Installing dependencies...").start();
  await execa("npm", ["install"], { stdio: "inherit" });
  installSpinner.succeed("Dependencies installed!");

  const buildSpinner = ora("Building project...").start();
  await execa("npm", ["run", "build"], { stdio: "inherit" });
  buildSpinner.succeed("Project built successfully!");

  console.log(chalk.green.bold("\n✅ Installation complete!"));
  console.log(`\nTo get started:\n`);
  console.log(chalk.cyan(`  cd ${whereToInstall}/brush`));
  console.log(chalk.cyan("  npm run dev\n"));
}

main().catch((error) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log("👋 until next time!");
  } else {
    throw error;
  }
});
