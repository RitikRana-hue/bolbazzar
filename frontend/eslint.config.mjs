import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default defineConfig([
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        ignores: [
            ".next/**",
            "node_modules/**",
            "out/**",
            "dist/**",
            "build/**",
            "*.config.js",
            "*.config.mjs",
            "*.config.ts"
        ],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            "@typescript-eslint": typescriptEslint,
            "react": reactPlugin,
            "react-hooks": reactHooksPlugin,
        },
        rules: {
            ...nextCoreWebVitals.rules,
            "@typescript-eslint/no-unused-vars": ["warn", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "prefer-const": "warn",
            "no-var": "error",
            "no-console": ["warn", { "allow": ["warn", "error"] }],
            "eqeqeq": ["error", "always"],
            "no-debugger": "error",
            "no-alert": "warn",
            "react/jsx-key": "error",
            "react/no-unescaped-entities": "warn",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
        },
    },
]);