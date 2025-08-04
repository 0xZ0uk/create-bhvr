import path from "node:path";
import { consola } from "consola";
import { execa } from "execa";
import fs from "fs-extra";
import pc from "picocolors";
import yoctoSpinner from "yocto-spinner";
import { honoClientTemplate, honoRpcTemplate } from "@/utils/templates";
import type { ProjectOptions } from "@/types";
import { EXTRAS_DIR } from "@/utils";

export async function rpcInstaller(
	options: Required<ProjectOptions>,
): Promise<boolean> {
	const spinner = yoctoSpinner({ text: "Setting up RPC client..." }).start();

	try {
		const { projectName, rpc, shadcn, tailwind } = options;
		const projectPath = path.resolve(process.cwd(), projectName);

		// 1. Update client package.json to ensure hono client is installed
		const clientPkgPath = path.join(projectPath, "client", "package.json");
		const clientPkg = await fs.readJson(clientPkgPath);

		if (!clientPkg.dependencies.hono) {
			await execa("bun", ["install", "hono"], { cwd: projectPath });
		}

		await fs.writeJson(clientPkgPath, clientPkg, { spaces: 2 });

		// 2. Update server package.json dev script for RPC
		const serverPkgPath = path.join(projectPath, "server", "package.json");
		const serverPkg = await fs.readJson(serverPkgPath);

		// Update the dev script to include TypeScript compilation
		serverPkg.scripts.dev = "bun --watch run src/index.ts && tsc --watch";

		await fs.writeJson(serverPkgPath, serverPkg, { spaces: 2 });

		// 3. Server modification for RPC export type (no client imports)
		const serverIndexPath = path.join(projectPath, "server", "src", "index.ts");
		await fs.writeFile(serverIndexPath, honoRpcTemplate, "utf8");

		// 4. Create separate client helper file
		const clientHelperPath = path.join(
			projectPath,
			"server",
			"src",
			"client.ts",
		);
		await fs.writeFile(clientHelperPath, honoClientTemplate, "utf8");

		// 5. Update App.tsx based on template selection using switch statement
		const selectedTemplate = `App-with${tailwind ? "-tailwind" : ""}${shadcn ? "-shadcn" : ""}${rpc ? "-rpc" : ""}.tsx`;

		const appTsxSrc = path.join(
			EXTRAS_DIR,
			"client",
			"src",
			"App.tsx",
			selectedTemplate,
		);
		const appTsxTarget = path.join(projectPath, "client", "src", "App.tsx");

		fs.copySync(appTsxSrc, appTsxTarget);
		spinner.success("RPC client setup completed");
		return true;
	} catch (err: unknown) {
		spinner.error("Failed to set up RPC client");
		if (err instanceof Error) {
			consola.error(pc.red("Error:"), err.message);
		} else {
			consola.error(pc.red("Error: Unknown error"));
		}
		return false;
	}
}
