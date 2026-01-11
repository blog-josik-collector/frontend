
// prettier.config.ts
import type { Config } from "prettier";

const config: Config = {
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  endOfLine: "lf",
  semi: true,
  trailingComma: "all",
  // ⭐ Tailwind CSS 클래스 자동 정렬
  plugins: ["prettier-plugin-tailwindcss"],
  "overrides": [
    {
      "files": ["*.css", "*.scss"],
      "options": {
        "singleQuote": false
      }
    }
  ]
};

export default config;
