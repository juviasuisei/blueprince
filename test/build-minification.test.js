import { createRequire } from "module";
import { describe, expect, it } from "vitest";

// Use createRequire to import CommonJS module
const require = createRequire(import.meta.url);
const { minifyJS, validateTemplateReplacement } = require("../build.js");

describe("minifyJS function", () => {
  it("should preserve template literals correctly", () => {
    const code = `
      const element = document.getElementById(\`section-\${sectionId}\`);
      const message = \`Hello \${name}\`;
    `;

    const result = minifyJS(code);

    // Should contain the original template literals
    expect(result).toContain("`section-${sectionId}`");
    expect(result).toContain("`Hello ${name}`");

    // Should not contain any unreplaced placeholders
    expect(result).not.toMatch(/__TEMPLATE_\d+__/);
    expect(result).not.toMatch(/__STRING_\d+__/);
    expect(result).not.toMatch(/__REGEX_\d+__/);
  });

  it("should preserve string literals correctly", () => {
    const code = `
      const message = "Hello world";
      const greeting = 'Hi there';
      const escaped = "He said \\"Hello\\"";
    `;

    const result = minifyJS(code);

    // Should contain the original string literals
    expect(result).toContain('"Hello world"');
    expect(result).toContain("'Hi there'");
    expect(result).toContain('"He said \\"Hello\\""');

    // Should not contain any unreplaced placeholders
    expect(result).not.toMatch(/__TEMPLATE_\d+__/);
    expect(result).not.toMatch(/__STRING_\d+__/);
    expect(result).not.toMatch(/__REGEX_\d+__/);
  });

  it("should preserve regex literals correctly", () => {
    const code = `
      const pattern = /test\\d+/g;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/;
    `;

    const result = minifyJS(code);

    // Should contain the original regex literals
    expect(result).toContain("/test\\d+/g");
    expect(result).toContain(
      "/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/"
    );

    // Should not contain any unreplaced placeholders
    expect(result).not.toMatch(/__TEMPLATE_\d+__/);
    expect(result).not.toMatch(/__STRING_\d+__/);
    expect(result).not.toMatch(/__REGEX_\d+__/);
  });

  it("should handle complex nested expressions", () => {
    const code = `
      this.announceToScreenReader(
        \`Navigated to \${this.getSectionTitle(sectionId)} section\`,
        "polite"
      );
    `;

    const result = minifyJS(code);

    // Should preserve the complex template literal
    expect(result).toContain(
      "`Navigated to ${this.getSectionTitle(sectionId)} section`"
    );
    expect(result).toContain('"polite"');

    // Should not contain any unreplaced placeholders
    expect(result).not.toMatch(/__TEMPLATE_\d+__/);
    expect(result).not.toMatch(/__STRING_\d+__/);
    expect(result).not.toMatch(/__REGEX_\d+__/);
  });

  it("should remove comments correctly", () => {
    const code = `
      // This is a single line comment
      const value = "test"; // Another comment
      /* This is a 
         multi-line comment */
      const result = \`template \${value}\`;
    `;

    const result = minifyJS(code);

    // Should remove comments
    expect(result).not.toContain("// This is a single line comment");
    expect(result).not.toContain("// Another comment");
    expect(result).not.toContain("/* This is a");
    expect(result).not.toContain("multi-line comment */");

    // Should preserve code
    expect(result).toContain('"test"');
    expect(result).toContain("`template ${value}`");
  });

  it("should handle edge cases with escaped quotes", () => {
    const code = `
      const str1 = "He said \\"Hello\\" to me";
      const str2 = 'She replied \\'Hi\\'';
      const template = \`Message: "\${message}"\`;
    `;

    const result = minifyJS(code);

    // Should preserve escaped quotes
    expect(result).toContain('"He said \\"Hello\\" to me"');
    expect(result).toContain("'She replied \\'Hi\\''");
    expect(result).toContain('`Message: "${message}"`');

    // Should not contain any unreplaced placeholders
    expect(result).not.toMatch(/__TEMPLATE_\d+__/);
    expect(result).not.toMatch(/__STRING_\d+__/);
    expect(result).not.toMatch(/__REGEX_\d+__/);
  });

  it("should minify whitespace correctly", () => {
    const code = `
      function   test(  ) {
        const   value   =   "hello"  ;
        return    value   ;
      }
    `;

    const result = minifyJS(code);

    // Should remove extra whitespace
    expect(result).not.toContain("  ");
    expect(result).toContain("function test(){");
    expect(result).toContain('"hello"');

    // Should preserve string content
    expect(result).toContain('"hello"');
  });
});

describe("validateTemplateReplacement function", () => {
  it("should pass validation for clean code", () => {
    const code = `
      const element = document.getElementById(\`section-\${sectionId}\`);
      const message = "Hello world";
    `;

    const result = validateTemplateReplacement(code, "test.js");

    expect(result.isValid).toBe(true);
    expect(result.unreplacedVariables).toHaveLength(0);
    expect(result.errorMessage).toBeNull();
  });

  it("should fail validation for code with unreplaced template variables", () => {
    const code = `
      const element = document.getElementById(__TEMPLATE_10__);
      const message = __STRING_5__;
    `;

    const result = validateTemplateReplacement(code, "test.js");

    expect(result.isValid).toBe(false);
    expect(result.unreplacedVariables).toHaveLength(2);
    expect(result.unreplacedVariables[0].variable).toBe("__TEMPLATE_10__");
    expect(result.unreplacedVariables[1].variable).toBe("__STRING_5__");
    expect(result.errorMessage).toContain(
      "Found 2 unreplaced template variable(s)"
    );
  });

  it("should provide detailed information about unreplaced variables", () => {
    const code = `line 1
line 2
const element = __TEMPLATE_10__;
line 4`;

    const result = validateTemplateReplacement(code, "test.js");

    expect(result.isValid).toBe(false);
    expect(result.unreplacedVariables).toHaveLength(1);
    expect(result.unreplacedVariables[0].line).toBe(3);
    expect(result.unreplacedVariables[0].position).toBeGreaterThan(0);
    expect(result.filename).toBe("test.js");
  });

  it("should handle multiple types of unreplaced variables", () => {
    const code = `
      const template = __TEMPLATE_1__;
      const string = __STRING_2__;
      const regex = __REGEX_3__;
    `;

    const result = validateTemplateReplacement(code, "test.js");

    expect(result.isValid).toBe(false);
    expect(result.unreplacedVariables).toHaveLength(3);

    const variables = result.unreplacedVariables.map((v) => v.variable);
    expect(variables).toContain("__TEMPLATE_1__");
    expect(variables).toContain("__STRING_2__");
    expect(variables).toContain("__REGEX_3__");
  });

  it("should handle empty code", () => {
    const result = validateTemplateReplacement("", "empty.js");

    expect(result.isValid).toBe(true);
    expect(result.unreplacedVariables).toHaveLength(0);
    expect(result.errorMessage).toBeNull();
  });
});
