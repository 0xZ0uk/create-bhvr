import pc from "picocolors";
import { displayBanner } from "@/lib/display-banner";
import type { ProjectOptions } from "@/types";
import { createProject } from "../lib/create-project";

export const create = async (
  projectDirectory: string,
  options: ProjectOptions,
) => {
  try {
    displayBanner();
    const result = await createProject(projectDirectory, options);
    if (result) {
      console.log(pc.green(pc.bold("🎉 Project created successfully!")));
      console.log("\nNext steps:");
      if (!result.dependenciesInstalled) {
        console.log(pc.cyan(`  cd ${result.projectName}`));
        console.log(pc.cyan("  bun install"));
      } else {
        console.log(pc.cyan(`  cd ${result.projectName}`));
      }
      console.log(pc.cyan("  bun run dev:client   # Start the client"));
      console.log(
        pc.cyan(
          "  bun run dev:server   # Start the server in another terminal",
        ),
      );
      console.log(pc.cyan("  bun run dev          # Start all"));
      process.exit(0);
    }
  } catch (err) {
    console.error(pc.red("Error creating project:"), err);
    process.exit(1);
  }
};
