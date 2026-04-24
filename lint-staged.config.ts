import type { Configuration } from "lint-staged";

const config: Configuration = {
  "*.{js,jsx,ts,tsx,json,jsonc,css}": ["ultracite fix"],
};

export default config;
