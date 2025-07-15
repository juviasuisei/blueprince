import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// Use createRequire to import CommonJS modules
const require = createRequire(import.meta.url);
const fs = require("fs");
const path = require("path");
const {
  createProductionBuild,
  validateTemplateReplacement,
} = require("../build.js");

describe("Build Process Integration", () => {
  const testDistDir = "test-dist";

  beforeEach(() => {
    // Clean up any existing test dist directory
    if (fs.existsSync(testDistDir)) {
      fs.rmSync(testDistDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test dist directory
    if (fs.existsSync(testDistDir)) {
      fs.rmSync(testDistDir, { recursive: true, force: true });
    }
  });

  it("should build successfully without template variable errors", () => {
    // This test runs the actual build process
    expect(() => {
      createProductionBuild();
    }).not.toThrow();

    // Verify dist directory was created
    expect(fs.existsSync("dist")).toBe(true);
  });

  it("should produce minified files without unreplaced template variables", () => {
    // Run the build
    createProductionBuild();

    // Check each JavaScript file in dist
    const jsFiles = [
      "app.js",
      "data.js",
      "sections.js",
      "checkboxes.js",
      "information.js",
    ];

    jsFiles.forEach((file) => {
      const filePath = path.join("dist", file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");

        // Validate that no template variables remain
        const validation = validateTemplateReplacement(content, file);

        expect(validation.isValid).toBe(true);
        expect(validation.unreplacedVariables).toHaveLength(0);
        expect(validation.errorMessage).toBeNull();

        // Additional checks for specific patterns
        expect(content).not.toMatch(/__TEMPLATE_\d+__/);
        expect(content).not.toMatch(/__STRING_\d+__/);
        expect(content).not.toMatch(/__REGEX_\d+__/);
      }
    });
  });

  it("should create all expected build artifacts", () => {
    createProductionBuild();

    // Check that all expected files are created
    const expectedFiles = [
      "dist/app.js",
      "dist/data.js",
      "dist/sections.js",
      "dist/checkboxes.js",
      "dist/information.js",
      "dist/index.html",
      "dist/sw.js",
      "dist/.htaccess",
      "dist/nginx.conf",
    ];

    expectedFiles.forEach((file) => {
      if (fs.existsSync(file.replace("dist/", ""))) {
        expect(fs.existsSync(file)).toBe(true);
      }
    });
  });

  it("should produce smaller minified files", () => {
    createProductionBuild();

    const jsFiles = [
      "app.js",
      "data.js",
      "sections.js",
      "checkboxes.js",
      "information.js",
    ];

    jsFiles.forEach((file) => {
      const originalPath = file;
      const minifiedPath = path.join("dist", file);

      if (fs.existsSync(originalPath) && fs.existsSync(minifiedPath)) {
        const originalSize = fs.statSync(originalPath).size;
        const minifiedSize = fs.statSync(minifiedPath).size;

        // Minified file should be smaller than original
        expect(minifiedSize).toBeLessThan(originalSize);

        // Should achieve at least some reduction (allowing for very small files)
        const reductionRatio = (originalSize - minifiedSize) / originalSize;
        expect(reductionRatio).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it("should handle build failure when template variables cannot be replaced", () => {
    // Create a temporary file with unreplaced template variables
    const testFile = "test-broken.js";
    const brokenContent = `
      const element = document.getElementById(__TEMPLATE_999__);
      const message = __STRING_888__;
    `;

    fs.writeFileSync(testFile, brokenContent);

    try {
      // Mock the jsFiles array to include our test file
      const originalConsoleError = console.error;
      const originalProcessExit = process.exit;
      let exitCalled = false;
      let errorMessages = [];

      console.error = (...args) => {
        errorMessages.push(args.join(" "));
      };

      process.exit = (code) => {
        exitCalled = true;
        throw new Error(`Process exit called with code ${code}`);
      };

      // This should fail due to unreplaced variables
      expect(() => {
        // We can't easily test the full build failure without modifying the build function
        // So we'll test the validation function directly
        const validation = validateTemplateReplacement(brokenContent, testFile);

        if (!validation.isValid) {
          console.error(`❌ Build failed: ${validation.errorMessage}`);
          console.error("Unreplaced variables found:");
          validation.unreplacedVariables.forEach((v) => {
            console.error(
              `  - ${v.variable} at line ${v.line}, position ${v.position}`
            );
          });
          process.exit(1);
        }
      }).toThrow("Process exit called with code 1");

      expect(exitCalled).toBe(true);
      expect(errorMessages.some((msg) => msg.includes("Build failed"))).toBe(
        true
      );

      // Restore original functions
      console.error = originalConsoleError;
      process.exit = originalProcessExit;
    } finally {
      // Clean up test file
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  it("should preserve JavaScript functionality after minification", () => {
    createProductionBuild();

    // Read the minified app.js file
    const minifiedPath = path.join("dist", "app.js");
    if (fs.existsSync(minifiedPath)) {
      const content = fs.readFileSync(minifiedPath, "utf8");

      // Check that key function signatures are preserved
      expect(content).toContain("checklistApp");
      expect(content).toContain("function");

      // Check that template literals are properly formatted
      const templateLiterals = content.match(/`[^`]*`/g) || [];
      templateLiterals.forEach((template) => {
        // Should not contain unreplaced placeholders
        expect(template).not.toMatch(/__TEMPLATE_\d+__/);
        expect(template).not.toMatch(/__STRING_\d+__/);
        expect(template).not.toMatch(/__REGEX_\d+__/);
      });

      // Check that the code is syntactically valid by attempting to parse it
      expect(() => {
        new Function(content);
      }).not.toThrow();
    }
  });
});
