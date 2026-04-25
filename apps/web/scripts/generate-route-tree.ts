import { fileURLToPath } from "node:url";
import { Generator, getConfig } from "@tanstack/router-generator";

const root = fileURLToPath(new URL("../", import.meta.url));
const config = getConfig({}, root);
const generator = new Generator({ config, root });

await generator.run();
