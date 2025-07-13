/**
 * Build Minification Tests
 *
 * Tests to ensure that the build process correctly minifies JavaScript
 * while preserving spaces inside string values.
 */

import { describe, expect, it } from "vitest";
import { minifyJS } from "../build.js";

describe("JavaScript Minification", () => {
  describe("String Preservation", () => {
    it("should preserve spaces after colons in strings", () => {
      const input = `const message = "Time: 5:30 PM";`;
      const result = minifyJS(input);
      expect(result).toContain('"Time: 5:30 PM"');
    });

    it("should preserve spaces after commas in strings", () => {
      const input = `const greeting = "Hello, world!";`;
      const result = minifyJS(input);
      expect(result).toContain('"Hello, world!"');
    });

    it("should preserve multiple spaces in strings", () => {
      const input = `const text = "This  has   multiple    spaces";`;
      const result = minifyJS(input);
      expect(result).toContain('"This  has   multiple    spaces"');
    });

    it("should preserve spaces in single-quoted strings", () => {
      const input = `const message = 'Error: File not found, please try again';`;
      const result = minifyJS(input);
      expect(result).toContain("'Error: File not found, please try again'");
    });

    it("should preserve escaped quotes in strings", () => {
      const input = `const quote = "He said: \\"Hello, world!\\"";`;
      const result = minifyJS(input);
      expect(result).toContain('"He said: \\"Hello, world!\\""');
    });

    it("should preserve complex punctuation in strings", () => {
      const input = `const complex = "Status: OK; Message: Success, data loaded!";`;
      const result = minifyJS(input);
      expect(result).toContain('"Status: OK; Message: Success, data loaded!"');
    });

    it("should handle mixed quotes correctly", () => {
      const input = `
        const single = 'Single: quote, test';
        const double = "Double: quote, test";
      `;
      const result = minifyJS(input);
      expect(result).toContain("'Single: quote, test'");
      expect(result).toContain('"Double: quote, test"');
    });

    it("should preserve template literal-like content in strings", () => {
      const input = `const template = "Template: \${variable}, value: \${other}";`;
      const result = minifyJS(input);
      expect(result).toContain('"Template: ${variable}, value: ${other}"');
    });
  });

  describe("Code Minification", () => {
    it("should remove spaces after colons in object literals", () => {
      const input = `const obj = { key: value, other: data };`;
      const result = minifyJS(input);
      expect(result).toContain("key:value");
      expect(result).toContain("other:data");
    });

    it("should remove spaces after commas in arrays and objects", () => {
      const input = `const arr = [1, 2, 3]; const obj = { a: 1, b: 2 };`;
      const result = minifyJS(input);
      expect(result).toContain("[1,2,3]");
      expect(result).toContain("{a:1,b:2}");
    });

    it("should remove unnecessary spaces around braces", () => {
      const input = `function test() { return true; }`;
      const result = minifyJS(input);
      expect(result).toContain("function test(){return true;}");
    });

    it("should remove comments", () => {
      const input = `
        // This is a comment
        const value = "test"; /* block comment */
        const other = "data";
      `;
      const result = minifyJS(input);
      expect(result).not.toContain("// This is a comment");
      expect(result).not.toContain("/* block comment */");
      expect(result).toContain('"test"');
      expect(result).toContain('"data"');
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle strings with code-like content", () => {
      const input = `
        const codeString = "function test() { return 'Hello, world!'; }";
        const obj = { method: function() { return true; } };
      `;
      const result = minifyJS(input);
      expect(result).toContain(
        "\"function test() { return 'Hello, world!'; }\""
      );
      expect(result).toContain("method:function(){return true;}");
    });

    it("should handle nested quotes correctly", () => {
      const input = `
        const html = "<div class='container'>Hello, world!</div>";
        const json = '{"message": "Hello, world!", "status": "OK"}';
      `;
      const result = minifyJS(input);
      expect(result).toContain(
        "\"<div class='container'>Hello, world!</div>\""
      );
      expect(result).toContain(
        '\'{"message": "Hello, world!", "status": "OK"}\''
      );
    });

    it("should preserve aria-label and other HTML attributes in strings", () => {
      const input = `
        const ariaLabel = "Section progress: 75% complete";
        const htmlContent = '<button aria-label="Close dialog, return to main content">×</button>';
      `;
      const result = minifyJS(input);
      expect(result).toContain('"Section progress: 75% complete"');
      expect(result).toContain(
        "'<button aria-label=\"Close dialog, return to main content\">×</button>'"
      );
    });

    it("should handle real-world data structures", () => {
      const input = `
        const data = {
          sections: [
            {
              title: "Getting Started: Basic Setup",
              description: "Learn the basics, including: installation, configuration, and first steps"
            }
          ]
        };
      `;
      const result = minifyJS(input);
      expect(result).toContain('"Getting Started: Basic Setup"');
      expect(result).toContain(
        '"Learn the basics, including: installation, configuration, and first steps"'
      );
      // But should minify the object structure
      expect(result).toContain("sections:[{title:");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty strings", () => {
      const input = `const empty = ""; const other = '';`;
      const result = minifyJS(input);
      expect(result).toContain('""');
      expect(result).toContain("''");
    });

    it("should handle strings with only punctuation", () => {
      const input = `const punct = ":,;{}"; const other = ':,;{}';`;
      const result = minifyJS(input);
      expect(result).toContain('":,;{}"');
      expect(result).toContain("':,;{}'");
    });

    it("should handle strings with backslashes", () => {
      const input = `const path = "C:\\\\Users\\\\Name: Test, File";`;
      const result = minifyJS(input);
      expect(result).toContain('"C:\\\\Users\\\\Name: Test, File"');
    });

    it("should handle regex-like strings", () => {
      const input = `const pattern = "/test: \\\\d+, value: \\\\w+/g";`;
      const result = minifyJS(input);
      expect(result).toContain('"/test: \\\\d+, value: \\\\w+/g"');
    });
  });
});
