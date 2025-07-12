import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";
import { tailwindcssExtension } from "../tailwindcss";

export async function addShadcnUi(projectPath: string): Promise<void> {
	const spinner = yoctoSpinner({
		text: "Setting up shadcn/ui...",
	}).start();

	try {
		const clientPath = path.join(projectPath, "client");

		// Check if tailwindcss is installed
		const packageJsonPath = path.join(clientPath, "package.json");
		const packageJson = await fs.readJson(packageJsonPath);

		if (!packageJson.devDependencies.tailwindcss) {
			spinner.text = "TailwindCSS not found. Installing...";
			await tailwindcssExtension.add(projectPath);
		}

		// Install dependencies
		spinner.text = "Installing dependencies...";
		await execa(
			"bun",
			[
				"add",
				"tailwindcss-animate",
				"class-variance-authority",
				"clsx",
				"tailwind-merge",
				"lucide-react",
			],
			{
				cwd: clientPath,
			},
		);
		// Create components.json
		spinner.text = "Creating components.json...";
		const componentsJsonPath = path.join(clientPath, "components.json");
		const componentsJson = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}`;
		await fs.writeFile(componentsJsonPath, componentsJson);

		// Create lib/utils.ts
		spinner.text = "Creating lib/utils.ts...";
		const utilsPath = path.join(clientPath, "src", "lib");
		await fs.ensureDir(utilsPath);
		const utilsTsPath = path.join(utilsPath, "utils.ts");
		const utilsTs = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;
		await fs.writeFile(utilsTsPath, utilsTs);

		// Update tsconfig.json
		spinner.text = "Updating tsconfig.json...";
		const tsconfigPath = path.join(clientPath, "tsconfig.json");

		const tsconfig = await fs.readJson(tsconfigPath);
		if (!tsconfig.compilerOptions) {
			tsconfig.compilerOptions = {};
		}
		tsconfig.compilerOptions.baseUrl = ".";
		tsconfig.compilerOptions.paths = {
			"@/*": ["./src/*"],
		};
		await fs.writeJson(tsconfigPath, tsconfig, { spaces: 2 });

		// Update index.css
		spinner.text = "Updating index.css...";
		const globalsCssPath = path.join(clientPath, "src", "index.css");
		const globalsCss = `
    @import "tailwindcss";
    @import "tw-animate-css";

    @custom-variant dark (&:is(.dark *));

    @theme inline {
      --radius-sm: calc(var(--radius) - 4px);
      --radius-md: calc(var(--radius) - 2px);
      --radius-lg: var(--radius);
      --radius-xl: calc(var(--radius) + 4px);
      --color-background: var(--background);
      --color-foreground: var(--foreground);
      --color-card: var(--card);
      --color-card-foreground: var(--card-foreground);
      --color-popover: var(--popover);
      --color-popover-foreground: var(--popover-foreground);
      --color-primary: var(--primary);
      --color-primary-foreground: var(--primary-foreground);
      --color-secondary: var(--secondary);
      --color-secondary-foreground: var(--secondary-foreground);
      --color-muted: var(--muted);
      --color-muted-foreground: var(--muted-foreground);
      --color-accent: var(--accent);
      --color-accent-foreground: var(--accent-foreground);
      --color-destructive: var(--destructive);
      --color-border: var(--border);
      --color-input: var(--input);
      --color-ring: var(--ring);
      --color-chart-1: var(--chart-1);
      --color-chart-2: var(--chart-2);
      --color-chart-3: var(--chart-3);
      --color-chart-4: var(--chart-4);
      --color-chart-5: var(--chart-5);
      --color-sidebar: var(--sidebar);
      --color-sidebar-foreground: var(--sidebar-foreground);
      --color-sidebar-primary: var(--sidebar-primary);
      --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
      --color-sidebar-accent: var(--sidebar-accent);
      --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
      --color-sidebar-border: var(--sidebar-border);
      --color-sidebar-ring: var(--sidebar-ring);
    }

    :root {
      --radius: 0.625rem;
      --background: oklch(1 0 0);
      --foreground: oklch(0.145 0 0);
      --card: oklch(1 0 0);
      --card-foreground: oklch(0.145 0 0);
      --popover: oklch(1 0 0);
      --popover-foreground: oklch(0.145 0 0);
      --primary: oklch(0.205 0 0);
      --primary-foreground: oklch(0.985 0 0);
      --secondary: oklch(0.97 0 0);
      --secondary-foreground: oklch(0.205 0 0);
      --muted: oklch(0.97 0 0);
      --muted-foreground: oklch(0.556 0 0);
      --accent: oklch(0.97 0 0);
      --accent-foreground: oklch(0.205 0 0);
      --destructive: oklch(0.577 0.245 27.325);
      --border: oklch(0.922 0 0);
      --input: oklch(0.922 0 0);
      --ring: oklch(0.708 0 0);
      --chart-1: oklch(0.646 0.222 41.116);
      --chart-2: oklch(0.6 0.118 184.704);
      --chart-3: oklch(0.398 0.07 227.392);
      --chart-4: oklch(0.828 0.189 84.429);
      --chart-5: oklch(0.769 0.188 70.08);
      --sidebar: oklch(0.985 0 0);
      --sidebar-foreground: oklch(0.145 0 0);
      --sidebar-primary: oklch(0.205 0 0);
      --sidebar-primary-foreground: oklch(0.985 0 0);
      --sidebar-accent: oklch(0.97 0 0);
      --sidebar-accent-foreground: oklch(0.205 0 0);
      --sidebar-border: oklch(0.922 0 0);
      --sidebar-ring: oklch(0.708 0 0);
    }

    .dark {
      --background: oklch(0.145 0 0);
      --foreground: oklch(0.985 0 0);
      --card: oklch(0.205 0 0);
      --card-foreground: oklch(0.985 0 0);
      --popover: oklch(0.205 0 0);
      --popover-foreground: oklch(0.985 0 0);
      --primary: oklch(0.922 0 0);
      --primary-foreground: oklch(0.205 0 0);
      --secondary: oklch(0.269 0 0);
      --secondary-foreground: oklch(0.985 0 0);
      --muted: oklch(0.269 0 0);
      --muted-foreground: oklch(0.708 0 0);
      --accent: oklch(0.269 0 0);
      --accent-foreground: oklch(0.985 0 0);
      --destructive: oklch(0.704 0.191 22.216);
      --border: oklch(1 0 0 / 10%);
      --input: oklch(1 0 0 / 15%);
      --ring: oklch(0.556 0 0);
      --chart-1: oklch(0.488 0.243 264.376);
      --chart-2: oklch(0.696 0.17 162.48);
      --chart-3: oklch(0.769 0.188 70.08);
      --chart-4: oklch(0.627 0.265 303.9);
      --chart-5: oklch(0.645 0.246 16.439);
      --sidebar: oklch(0.205 0 0);
      --sidebar-foreground: oklch(0.985 0 0);
      --sidebar-primary: oklch(0.488 0.243 264.376);
      --sidebar-primary-foreground: oklch(0.985 0 0);
      --sidebar-accent: oklch(0.269 0 0);
      --sidebar-accent-foreground: oklch(0.985 0 0);
      --sidebar-border: oklch(1 0 0 / 10%);
      --sidebar-ring: oklch(0.556 0 0);
    }

    @layer base {
      * {
        @apply border-border outline-ring/50;
      }
      body {
        @apply bg-background text-foreground;
      }
    }`;

		await fs.writeFile(globalsCssPath, globalsCss);

		spinner.success("shadcn/ui setup complete.");
	} catch (error) {
		if (error instanceof Error) {
			console.error(pc.red("\nError:"), error.message);
		} else {
			console.error(pc.red("\nError: Unknown error during shadcn/ui setup."));
		}
	}
}
