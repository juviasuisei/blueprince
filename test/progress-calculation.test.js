import { beforeEach, describe, expect, it } from "vitest";

let checklistApp;

beforeEach(async () => {
  // Load the app.js file content and evaluate it
  const fs = await import("fs");
  const path = await import("path");
  const appContent = fs.readFileSync(path.resolve("app.js"), "utf-8");

  // Create a function context to evaluate the app
  const func = new Function(
    "window",
    "localStorage",
    "console",
    "performance",
    "requestAnimationFrame",
    "setTimeout",
    "clearTimeout",
    "setInterval",
    "clearInterval",
    appContent + "; return checklistApp;"
  );

  checklistApp = func(
    global.window,
    global.localStorage,
    global.console,
    global.performance,
    global.requestAnimationFrame,
    global.setTimeout,
    global.clearTimeout,
    global.setInterval,
    global.clearInterval
  );
});

describe("Progress Calculation", () => {
  it("should calculate total checkboxes correctly", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    // Should count all checkboxes in the data
    const total = app.getTotalCheckboxes();
    expect(total).toBe(3); // test-checkbox-1, test-checkbox-2, mystery-checkbox
  });

  it("should calculate total checked correctly", () => {
    const app = checklistApp();
    app.checkedItems = ["test-checkbox-1", "mystery-checkbox"];

    const totalChecked = app.getTotalChecked();
    expect(totalChecked).toBe(2);
  });

  it("should calculate section total count correctly", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    const sectionTotal = app.getSectionTotalCount("test-section");
    expect(sectionTotal).toBe(2); // test-checkbox-1, test-checkbox-2
  });

  it("should calculate section checked count correctly", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.checkedItems = ["test-checkbox-1"];

    const sectionChecked = app.getSectionCheckedCount("test-section");
    expect(sectionChecked).toBe(1);
  });

  it("should handle section with subsections", () => {
    const app = checklistApp();
    app.data = {
      sections: [
        {
          id: "section-with-subsections",
          subsections: [
            {
              id: "subsection-1",
              checkboxes: ["checkbox-1", "checkbox-2"],
            },
            {
              id: "subsection-2",
              checkboxes: ["checkbox-3"],
            },
          ],
        },
      ],
    };

    const sectionTotal = app.getSectionTotalCount("section-with-subsections");
    expect(sectionTotal).toBe(3); // checkbox-1, checkbox-2, checkbox-3
  });

  it("should handle section with both direct checkboxes and subsections", () => {
    const app = checklistApp();
    app.data = {
      sections: [
        {
          id: "mixed-section",
          checkboxes: ["direct-checkbox-1", "direct-checkbox-2"],
          subsections: [
            {
              id: "subsection-1",
              checkboxes: ["sub-checkbox-1"],
            },
          ],
        },
      ],
    };

    const sectionTotal = app.getSectionTotalCount("mixed-section");
    expect(sectionTotal).toBe(3); // direct-checkbox-1, direct-checkbox-2, sub-checkbox-1
  });

  it("should calculate subsection total count correctly", () => {
    const app = checklistApp();
    app.data = {
      sections: [
        {
          id: "test-section",
          subsections: [
            {
              id: "test-subsection",
              checkboxes: ["checkbox-1", "checkbox-2", "checkbox-3"],
            },
          ],
        },
      ],
    };

    const subsectionTotal = app.getSubsectionTotalCount("test-subsection");
    expect(subsectionTotal).toBe(3);
  });

  it("should calculate subsection checked count correctly", () => {
    const app = checklistApp();
    app.data = {
      sections: [
        {
          id: "test-section",
          subsections: [
            {
              id: "test-subsection",
              checkboxes: ["checkbox-1", "checkbox-2", "checkbox-3"],
            },
          ],
        },
      ],
    };
    app.checkedItems = ["checkbox-1", "checkbox-3"];

    const subsectionChecked = app.getSubsectionCheckedCount("test-subsection");
    expect(subsectionChecked).toBe(2);
  });

  it("should return 0 for non-existent section", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    expect(app.getSectionTotalCount("non-existent")).toBe(0);
    expect(app.getSectionCheckedCount("non-existent")).toBe(0);
  });

  it("should return 0 for non-existent subsection", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    expect(app.getSubsectionTotalCount("non-existent")).toBe(0);
    expect(app.getSubsectionCheckedCount("non-existent")).toBe(0);
  });

  it("should handle empty data gracefully", () => {
    const app = checklistApp();
    app.data = { sections: [], checkboxes: {}, information: {} };

    expect(app.getTotalCheckboxes()).toBe(0);
    expect(app.getTotalChecked()).toBe(0);
    expect(app.getSectionTotalCount("any-section")).toBe(0);
    expect(app.getSectionCheckedCount("any-section")).toBe(0);
  });

  it("should handle null data gracefully", () => {
    const app = checklistApp();
    app.data = { sections: null, checkboxes: null, information: null };

    expect(app.getTotalCheckboxes()).toBe(0);
    expect(app.getTotalChecked()).toBe(0);
    expect(app.getSectionTotalCount("any-section")).toBe(0);
    expect(app.getSectionCheckedCount("any-section")).toBe(0);
  });

  it("should calculate progress percentages correctly", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.checkedItems = ["test-checkbox-1"]; // 1 out of 2 in test-section

    const sectionTotal = app.getSectionTotalCount("test-section");
    const sectionChecked = app.getSectionCheckedCount("test-section");
    const percentage = Math.round((sectionChecked / sectionTotal) * 100);

    expect(percentage).toBe(50); // 1/2 = 50%
  });

  it("should handle division by zero in progress calculation", () => {
    const app = checklistApp();
    app.data = {
      sections: [
        {
          id: "empty-section",
          checkboxes: [],
        },
      ],
    };

    const sectionTotal = app.getSectionTotalCount("empty-section");
    const sectionChecked = app.getSectionCheckedCount("empty-section");

    expect(sectionTotal).toBe(0);
    expect(sectionChecked).toBe(0);

    // In the UI, this would be handled as 100% with hidden percentage
    const percentage =
      sectionTotal === 0
        ? 100
        : Math.round((sectionChecked / sectionTotal) * 100);
    expect(percentage).toBe(100);
  });
});
