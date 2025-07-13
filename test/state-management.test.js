import { beforeEach, describe, expect, it, vi } from "vitest";

// Import the app function - we need to load it as a module
// Since app.js is not a module, we'll need to evaluate it in the test context
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

describe("State Management", () => {
  it("should initialize with empty state", () => {
    const app = checklistApp();

    expect(app.checkedItems).toEqual([]);
    expect(app.expandedSections).toEqual([]);
    expect(app.expandedSubsections).toEqual([]);
    expect(app.unlockedMysteries).toEqual([]);
  });

  it("should validate state structure correctly", () => {
    const app = checklistApp();

    // Valid state
    const validState = {
      checkedItems: ["item1"],
      expandedSections: ["section1"],
      expandedSubsections: ["subsection1"],
      unlockedMysteries: ["mystery1"],
    };
    expect(app.validateStateStructure(validState)).toBe(true);

    // Invalid states - the function returns falsy values for invalid states
    expect(app.validateStateStructure(null)).toBeFalsy();
    expect(app.validateStateStructure({})).toBeFalsy();
    expect(
      app.validateStateStructure({ checkedItems: "not-array" })
    ).toBeFalsy();
  });

  it("should save state to localStorage", () => {
    const app = checklistApp();
    app.checkedItems = ["test-checkbox-1"];
    app.expandedSections = ["test-section"];

    app.saveState();

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "checklist-state",
      expect.stringContaining('"checkedItems":["test-checkbox-1"]')
    );
  });

  it("should load state from localStorage", () => {
    const savedState = {
      checkedItems: ["test-checkbox-1"],
      expandedSections: ["test-section"],
      expandedSubsections: [],
      unlockedMysteries: ["mystery-checkbox"],
    };

    localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

    const app = checklistApp();
    app.loadState();

    expect(app.checkedItems).toEqual(["test-checkbox-1"]);
    expect(app.expandedSections).toEqual(["test-section"]);
    expect(app.unlockedMysteries).toEqual(["mystery-checkbox"]);
  });

  it("should handle corrupted localStorage gracefully", () => {
    localStorage.getItem.mockReturnValue("invalid-json");

    const app = checklistApp();
    app.loadState();

    // Should use default empty state
    expect(app.checkedItems).toEqual([]);
    expect(app.expandedSections).toEqual([]);
  });

  it("should handle localStorage errors gracefully", () => {
    localStorage.setItem.mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });

    const app = checklistApp();
    app.checkedItems = ["test-item"];

    // Should not throw
    expect(() => app.saveState()).not.toThrow();
  });
});

describe("Checkbox State Management", () => {
  it("should toggle checkbox state correctly", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    // Initially unchecked
    expect(app.checkedItems).not.toContain("test-checkbox-1");

    // Check the checkbox
    app.toggleCheckbox("test-checkbox-1");
    expect(app.checkedItems).toContain("test-checkbox-1");

    // Uncheck the checkbox
    app.toggleCheckbox("test-checkbox-1");
    expect(app.checkedItems).not.toContain("test-checkbox-1");
  });

  it("should unlock mystery when checking mystery checkbox", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    // Initially not unlocked
    expect(app.unlockedMysteries).not.toContain("mystery-checkbox");

    // Check mystery checkbox
    app.toggleCheckbox("mystery-checkbox");

    expect(app.checkedItems).toContain("mystery-checkbox");
    expect(app.unlockedMysteries).toContain("mystery-checkbox");
  });

  it("should save state after checkbox toggle", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    app.toggleCheckbox("test-checkbox-1");

    expect(app.debouncedSaveState).toHaveBeenCalled();
  });
});

describe("Section State Management", () => {
  it("should toggle section expansion", () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();

    // Initially collapsed
    expect(app.expandedSections).not.toContain("test-section");

    // Expand section
    app.toggleSection("test-section");
    expect(app.expandedSections).toContain("test-section");

    // Collapse section
    app.toggleSection("test-section");
    expect(app.expandedSections).not.toContain("test-section");
  });

  it("should toggle subsection expansion", () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    // Initially collapsed
    expect(app.expandedSubsections).not.toContain("test-subsection");

    // Expand subsection
    app.toggleSubsection("test-subsection");
    expect(app.expandedSubsections).toContain("test-subsection");

    // Collapse subsection
    app.toggleSubsection("test-subsection");
    expect(app.expandedSubsections).not.toContain("test-subsection");
  });
});
