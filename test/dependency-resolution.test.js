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

describe("Dependency Resolution", () => {
  it("should return true for empty dependencies", () => {
    const app = checklistApp();

    expect(app.checkDependencies([])).toBe(true);
    expect(app.checkDependencies(null)).toBe(true);
    expect(app.checkDependencies(undefined)).toBe(true);
  });

  it("should return true when all dependencies are satisfied", () => {
    const app = checklistApp();
    app.checkedItems = ["test-checkbox-1", "test-checkbox-2"];

    expect(app.checkDependencies(["test-checkbox-1"])).toBe(true);
    expect(app.checkDependencies(["test-checkbox-1", "test-checkbox-2"])).toBe(
      true
    );
  });

  it("should return false when dependencies are not satisfied", () => {
    const app = checklistApp();
    app.checkedItems = ["test-checkbox-1"];

    expect(app.checkDependencies(["test-checkbox-2"])).toBe(false);
    expect(app.checkDependencies(["test-checkbox-1", "test-checkbox-2"])).toBe(
      false
    );
  });

  it("should return false for non-existent dependencies", () => {
    const app = checklistApp();
    app.checkedItems = ["test-checkbox-1"];

    expect(app.checkDependencies(["non-existent-checkbox"])).toBe(false);
  });
});

describe("Visibility Logic", () => {
  it("should return visible sections with satisfied dependencies", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    // All sections should be visible since test-section has no dependencies
    const visibleSections = app.getVisibleSections();
    expect(visibleSections).toHaveLength(1);
    expect(visibleSections[0].id).toBe("test-section");
  });

  it("should filter out sections with unsatisfied dependencies", () => {
    const app = checklistApp();
    app.data = {
      sections: [
        {
          id: "visible-section",
          dependencies: [],
        },
        {
          id: "hidden-section",
          dependencies: ["non-existent-checkbox"],
        },
      ],
    };

    const visibleSections = app.getVisibleSections();
    expect(visibleSections).toHaveLength(1);
    expect(visibleSections[0].id).toBe("visible-section");
  });

  it("should return visible checkboxes with satisfied dependencies", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.checkedItems = ["test-checkbox-1"];

    const checkboxIds = ["test-checkbox-1", "test-checkbox-2"];
    const visibleCheckboxes = app.getVisibleCheckboxes(checkboxIds);

    // test-checkbox-1 has no dependencies, test-checkbox-2 depends on test-checkbox-1 (which is checked)
    expect(visibleCheckboxes).toHaveLength(2);
    expect(visibleCheckboxes).toContain("test-checkbox-1");
    expect(visibleCheckboxes).toContain("test-checkbox-2");
  });

  it("should filter out checkboxes with unsatisfied dependencies", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.checkedItems = []; // No checkboxes checked

    const checkboxIds = ["test-checkbox-1", "test-checkbox-2"];
    const visibleCheckboxes = app.getVisibleCheckboxes(checkboxIds);

    // Only test-checkbox-1 should be visible (no dependencies)
    expect(visibleCheckboxes).toHaveLength(1);
    expect(visibleCheckboxes).toContain("test-checkbox-1");
    expect(visibleCheckboxes).not.toContain("test-checkbox-2");
  });

  it("should return visible information items with satisfied dependencies", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    const informationIds = ["test-info-1"];
    const visibleInformation = app.getVisibleInformation(informationIds);

    expect(visibleInformation).toHaveLength(1);
    expect(visibleInformation).toContain("test-info-1");
  });

  it("should handle empty or null input arrays", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    expect(app.getVisibleCheckboxes([])).toEqual([]);
    expect(app.getVisibleCheckboxes(null)).toEqual([]);
    expect(app.getVisibleInformation([])).toEqual([]);
    expect(app.getVisibleInformation(null)).toEqual([]);
  });

  it("should handle missing data gracefully", () => {
    const app = checklistApp();
    app.data = { sections: null, checkboxes: null, information: null };

    expect(app.getVisibleSections()).toEqual([]);
    expect(app.getVisibleCheckboxes(["test"])).toEqual([]);
    expect(app.getVisibleInformation(["test"])).toEqual([]);
  });
});

describe("Subsection Visibility", () => {
  it("should return visible subsections for a section", () => {
    const app = checklistApp();
    app.data = {
      sections: [
        {
          id: "test-section",
          subsections: [
            {
              id: "visible-subsection",
              dependencies: [],
            },
            {
              id: "hidden-subsection",
              dependencies: ["non-existent-checkbox"],
            },
          ],
        },
      ],
    };

    const visibleSubsections = app.getVisibleSubsections("test-section");
    expect(visibleSubsections).toHaveLength(1);
    expect(visibleSubsections[0].id).toBe("visible-subsection");
  });

  it("should return empty array for non-existent section", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    const visibleSubsections = app.getVisibleSubsections(
      "non-existent-section"
    );
    expect(visibleSubsections).toEqual([]);
  });

  it("should return empty array for section without subsections", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    const visibleSubsections = app.getVisibleSubsections("test-section");
    expect(visibleSubsections).toEqual([]);
  });
});
