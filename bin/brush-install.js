#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompts_1 = require("@inquirer/prompts");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const execa_1 = require("execa");
const degit_1 = __importDefault(require("degit"));
const path_1 = __importDefault(require("path"));
const GADGET_REPO = "https://github.com/maddlen/brush-gadget";
const SHOPIFY_REPO = "https://github.com/maddlen/brush-shopify";
async function main() {
    console.clear();
    console.log(chalk_1.default.cyan.bold("🖌️  Brush Installer"));
    console.log("");
    const whatToInstall = await (0, prompts_1.select)({
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
    const whereToInstall = await (0, prompts_1.input)({
        message: "In which relative directory to install? (Use . for current folder):",
    });
    const spinner = (0, ora_1.default)("Downloading project...").start();
    const emitter = (0, degit_1.default)(whatToInstall === "gadget" ? GADGET_REPO : SHOPIFY_REPO, {
        cache: false,
        force: true,
    });
    const target = path_1.default.resolve(process.cwd(), whereToInstall);
    await emitter.clone(target);
    if (whatToInstall === "gadget") {
        spinner.succeed("Gadget code installed!");
        return;
    }
    spinner.succeed("Shopify code downloaded!");
    process.chdir(`${whereToInstall}/brush`);
    const installSpinner = (0, ora_1.default)("Installing dependencies...").start();
    await (0, execa_1.execa)("npm", ["install"], { stdio: "inherit" });
    installSpinner.succeed("Dependencies installed!");
    const buildSpinner = (0, ora_1.default)("Building project...").start();
    await (0, execa_1.execa)("npm", ["run", "build"], { stdio: "inherit" });
    buildSpinner.succeed("Project built successfully!");
    console.log(chalk_1.default.green.bold("\n✅ Installation complete!"));
    console.log(`\nTo get started:\n`);
    console.log(chalk_1.default.cyan(`  cd ${whereToInstall}/brush`));
    console.log(chalk_1.default.cyan("  npm run dev\n"));
}
main().catch((error) => {
    if (error instanceof Error && error.name === "ExitPromptError") {
        console.log("👋 until next time!");
    }
    else {
        throw error;
    }
});
