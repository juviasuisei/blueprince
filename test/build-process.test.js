/**
 * Build Process Tests
 *
 * Tests to ensure that the build process works correctly and creates valid files.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

describe("Build Process", () => {
  describe("Build Execution", () => {
    it("should complete build process without errors", () => {
      expect(() => {
        execSync("npm run build", { stdio: "pipe" });
      }).not.toThrow();
    });

    it("should create dist directory with required files", () => {
      const distPath = "dist";
      expect(fs.existsSync(distPath)).toBe(true);

      const requiredFiles = [
        "index.html",
        "app.js",
        "data.js",
        "sections.js",
        "checkboxes.js",
        "information.js",
        "favicon.ico",
      ];

      requiredFiles.forEach((file) => {
        const filePath = path.join(distPath, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it("should create valid JavaScript files", () => {
      const jsFiles = [
        "app.js",
        "data.js",
        "sections.js",
        "checkboxes.js",
        "information.js",
      ];

      jsFiles.forEach((file) => {
        const filePath = path.join("dist", file);
        expect(() => {
          // Check syntax by attempting to parse
          execSync(`node -c ${filePath}`, { stdio: "pipe" });
        }).not.toThrow();
      });
    });
  });

  describe("String Preservation", () => {
    it("should preserve spaces in strings in built files", () => {
      const appJsPath = path.join("dist", "app.js");
      const content = fs.readFileSync(appJsPath, "utf8");

      // Check that strings with spaces are preserved
      expect(content).toContain('"High memory usage detected:"');
      expect(content).toContain('"JavaScript Error"');
      // Check for minified version (spaces around colons are removed in code, but preserved in strings)
      expect(content).toContain("timestamp:new Date().toISOString()");
    });

    it("should preserve x-trap directives in HTML", () => {
      const htmlPath = path.join("dist", "index.html");
      const content = fs.readFileSync(htmlPath, "utf8");

      // Check that x-trap directives are preserved
      expect(content).toContain('x-trap="showResetConfirm"');
      expect(content).toContain('x-trap="showCompleteAllConfirm"');
    });

    it("should preserve Alpine focus plugin import", () => {
      const htmlPath = path.join("dist", "index.html");
      const content = fs.readFileSync(htmlPath, "utf8");

      // Check that Alpine focus plugin is imported
      expect(content).toContain("@alpinejs/focus");
    });
  });
});
