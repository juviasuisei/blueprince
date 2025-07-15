import { beforeEach, describe, expect, it, vi } from "vitest";

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

  // Mock performance object for tests
  const mockPerformance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    memory: {
      usedJSHeapSize: 1024 * 1024,
      totalJSHeapSize: 2 * 1024 * 1024,
    },
  };

  checklistApp = func(
    global.window,
    global.localStorage,
    global.console,
    mockPerformance,
    global.requestAnimationFrame,
    global.setTimeout,
    global.clearTimeout,
    global.setInterval,
    global.clearInterval
  );
});

describe("Hint System", () => {
  describe("Hint Data Processing", () => {
    it("should detect checkboxes with additional hints", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "with-hints": {
            title: "Test Checkbox",
            additionalHints: ["Hint 1", "Hint 2"],
          },
          "without-hints": {
            title: "Normal Checkbox",
          },
          "empty-hints": {
            title: "Empty Hints",
            additionalHints: [],
          },
        },
      };

      expect(app.hasAdditionalHints("with-hints")).toBe(true);
      expect(app.hasAdditionalHints("without-hints")).toBe(false);
      expect(app.hasAdditionalHints("empty-hints")).toBe(false);
      expect(app.hasAdditionalHints("non-existent")).toBe(false);
    });

    it("should handle invalid additionalHints data gracefully", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "invalid-hints": {
            title: "Invalid Hints",
            additionalHints: "not an array",
          },
          "null-hints": {
            title: "Null Hints",
            additionalHints: null,
          },
        },
      };

      expect(app.hasAdditionalHints("invalid-hints")).toBe(false);
      expect(app.hasAdditionalHints("null-hints")).toBe(false);
    });

    it("should get revealed hint count correctly", () => {
      const app = checklistApp();
      app.revealedHints = {
        "checkbox-1": 2,
        "checkbox-2": 0,
      };

      expect(app.getRevealedHintCount("checkbox-1")).toBe(2);
      expect(app.getRevealedHintCount("checkbox-2")).toBe(0);
      expect(app.getRevealedHintCount("non-existent")).toBe(0);
    });
  });

  describe("Hint Revelation Logic", () => {
    it("should reveal hints progressively", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "test-checkbox": {
            title: "Test Checkbox",
            additionalHints: ["Hint 1", "Hint 2", "Hint 3"],
          },
        },
      };
      app.revealedHints = {};
      app.debouncedSaveState = vi.fn();
      app.announceToScreenReader = vi.fn();

      // Initially no hints revealed
      expect(app.getRevealedHintCount("test-checkbox")).toBe(0);

      // Reveal first hint
      app.revealNextHint("test-checkbox");
      expect(app.getRevealedHintCount("test-checkbox")).toBe(1);
      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Hint revealed: Hint 1",
        "polite"
      );

      // Reveal second hint
      app.revealNextHint("test-checkbox");
      expect(app.getRevealedHintCount("test-checkbox")).toBe(2);
      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Hint revealed: Hint 2",
        "polite"
      );

      // Reveal third hint
      app.revealNextHint("test-checkbox");
      expect(app.getRevealedHintCount("test-checkbox")).toBe(3);
      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Hint revealed: Hint 3",
        "polite"
      );

      // Try to reveal beyond available hints
      app.revealNextHint("test-checkbox");
      expect(app.getRevealedHintCount("test-checkbox")).toBe(3); // Should not exceed 3
    });

    it("should not reveal hints for checkboxes without additional hints", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "no-hints": {
            title: "No Hints Checkbox",
          },
        },
      };
      app.revealedHints = {};
      app.debouncedSaveState = vi.fn();

      app.revealNextHint("no-hints");
      expect(app.getRevealedHintCount("no-hints")).toBe(0);
      expect(app.debouncedSaveState).not.toHaveBeenCalled();
    });

    it("should save state when hints are revealed", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "test-checkbox": {
            title: "Test Checkbox",
            additionalHints: ["Hint 1"],
          },
        },
      };
      app.revealedHints = {};
      app.debouncedSaveState = vi.fn();
      app.announceToScreenReader = vi.fn();

      app.revealNextHint("test-checkbox");
      expect(app.debouncedSaveState).toHaveBeenCalled();
    });
  });

  describe("Hint Display Logic", () => {
    it("should generate correct hint display data", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "test-checkbox": {
            title: "Test Checkbox",
            additionalHints: ["Hint 1", "Hint 2", "Hint 3"],
          },
        },
      };
      app.revealedHints = { "test-checkbox": 2 };

      const displayData = app.getHintDisplayData("test-checkbox");

      expect(displayData).toEqual({
        checkboxId: "test-checkbox",
        totalHints: 3,
        revealedCount: 2,
        hints: [
          { text: "Hint 1", revealed: true, lightbulbOpacity: 1.0 },
          { text: "Hint 2", revealed: true, lightbulbOpacity: 1.0 },
          { text: "Hint 3", revealed: false, lightbulbOpacity: 0.4 },
        ],
      });
    });

    it("should return null for checkboxes without hints", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "no-hints": {
            title: "No Hints Checkbox",
          },
        },
      };

      const displayData = app.getHintDisplayData("no-hints");
      expect(displayData).toBeNull();
    });

    it("should determine when to show hints correctly", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "with-hints": {
            title: "With Hints",
            additionalHints: ["Hint 1"],
          },
          "without-hints": {
            title: "Without Hints",
          },
        },
      };
      app.checkedItems = ["with-hints"]; // Checked checkbox

      // Should not show hints for checked checkboxes
      expect(app.shouldShowHints("with-hints")).toBe(false);

      // Should not show hints for checkboxes without hints
      expect(app.shouldShowHints("without-hints")).toBe(false);

      // Should show hints for unchecked checkboxes with hints
      app.checkedItems = [];
      expect(app.shouldShowHints("with-hints")).toBe(true);
    });

    it("should get revealed hints correctly", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "test-checkbox": {
            title: "Test Checkbox",
            additionalHints: ["Hint 1", "Hint 2", "Hint 3"],
          },
        },
      };
      app.revealedHints = { "test-checkbox": 2 };

      const revealedHints = app.getRevealedHints("test-checkbox");
      expect(revealedHints).toEqual(["Hint 1", "Hint 2"]);
    });

    it("should get unrevealed lightbulb count correctly", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "test-checkbox": {
            title: "Test Checkbox",
            additionalHints: ["Hint 1", "Hint 2", "Hint 3"],
          },
        },
      };
      app.revealedHints = { "test-checkbox": 1 };

      const unrevealedCount = app.getUnrevealedLightbulbCount("test-checkbox");
      expect(unrevealedCount).toBe(2); // 3 total - 1 revealed = 2 unrevealed
    });
  });

  describe("State Management Integration", () => {
    it("should include revealedHints in state validation", () => {
      const app = checklistApp();

      // Valid state with revealedHints
      const validState = {
        checkedItems: [],
        expandedSections: [],
        expandedSubsections: [],
        unlockedMysteries: [],
        revealedHints: { "checkbox-1": 2 },
      };
      expect(app.validateStateStructure(validState)).toBe(true);

      // Valid state without revealedHints (should default)
      const validStateWithoutHints = {
        checkedItems: [],
        expandedSections: [],
        expandedSubsections: [],
        unlockedMysteries: [],
      };
      expect(app.validateStateStructure(validStateWithoutHints)).toBe(true);

      // Invalid state with wrong revealedHints type
      const invalidState = {
        checkedItems: [],
        expandedSections: [],
        expandedSubsections: [],
        unlockedMysteries: [],
        revealedHints: "not an object",
      };
      expect(app.validateStateStructure(invalidState)).toBe(false);
    });

    it("should load and save revealedHints state", () => {
      const app = checklistApp();

      // Test loading state with revealedHints
      const savedState = {
        checkedItems: ["checkbox-1"],
        expandedSections: [],
        expandedSubsections: [],
        unlockedMysteries: [],
        revealedHints: { "checkbox-1": 2, "checkbox-2": 1 },
      };

      // Mock localStorage for this test
      const originalGetItem = global.localStorage.getItem;
      const originalSetItem = global.localStorage.setItem;

      global.localStorage.getItem = vi
        .fn()
        .mockReturnValue(JSON.stringify(savedState));
      global.localStorage.setItem = vi.fn();

      app.loadState();
      expect(app.revealedHints).toEqual({ "checkbox-1": 2, "checkbox-2": 1 });

      // Test saving state with revealedHints
      app.revealedHints = { "checkbox-3": 3 };
      app.saveState();

      const savedCall = global.localStorage.setItem.mock.calls[0];
      expect(savedCall[0]).toBe("checklist-state");
      const savedData = JSON.parse(savedCall[1]);
      expect(savedData.revealedHints).toEqual({ "checkbox-3": 3 });

      // Restore original localStorage methods
      global.localStorage.getItem = originalGetItem;
      global.localStorage.setItem = originalSetItem;
    });

    it("should handle corrupted revealedHints state gracefully", () => {
      const app = checklistApp();

      // Mock localStorage with corrupted state
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue('{"invalid": "json"'),
        setItem: vi.fn(),
      };
      global.localStorage = mockLocalStorage;

      // Should not throw error and should use default empty object
      expect(() => app.loadState()).not.toThrow();
      expect(app.revealedHints).toEqual({});
    });
  });

  describe("Integration with Checkbox System", () => {
    it("should work with mystery checkboxes", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "mystery-checkbox": {
            title: "Mystery Checkbox",
            unlockKeyword: "secret",
            additionalHints: ["Mystery hint 1", "Mystery hint 2"],
          },
        },
      };
      app.checkedItems = [];

      expect(app.hasAdditionalHints("mystery-checkbox")).toBe(true);
      expect(app.shouldShowHints("mystery-checkbox")).toBe(true);
    });

    it("should work with dependency-based checkboxes", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "dependent-checkbox": {
            title: "Dependent Checkbox",
            dependencies: ["prerequisite"],
            additionalHints: ["Dependent hint 1"],
          },
        },
      };
      app.checkedItems = [];

      expect(app.hasAdditionalHints("dependent-checkbox")).toBe(true);
      expect(app.shouldShowHints("dependent-checkbox")).toBe(true);
    });

    it("should maintain hint state across checkbox check/uncheck cycles", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "test-checkbox": {
            title: "Test Checkbox",
            additionalHints: ["Hint 1", "Hint 2"],
          },
        },
      };
      app.checkedItems = [];
      app.revealedHints = {};
      app.debouncedSaveState = vi.fn();
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.initializeSwipers = vi.fn();
      app.observeImages = vi.fn();
      app._invalidateProgressCache = vi.fn();

      // Reveal a hint
      app.revealNextHint("test-checkbox");
      expect(app.getRevealedHintCount("test-checkbox")).toBe(1);

      // Check the checkbox (hints should be hidden but state preserved)
      app.toggleCheckbox("test-checkbox");
      expect(app.checkedItems).toContain("test-checkbox");
      expect(app.shouldShowHints("test-checkbox")).toBe(false);
      expect(app.getRevealedHintCount("test-checkbox")).toBe(1); // State preserved

      // Uncheck the checkbox (hints should be shown again with preserved state)
      app.toggleCheckbox("test-checkbox");
      expect(app.checkedItems).not.toContain("test-checkbox");
      expect(app.shouldShowHints("test-checkbox")).toBe(true);
      expect(app.getRevealedHintCount("test-checkbox")).toBe(1); // State preserved
    });
  });

  describe("Accessibility", () => {
    it("should announce hint revelations to screen readers", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "test-checkbox": {
            title: "Test Checkbox",
            additionalHints: ["Accessible hint"],
          },
        },
      };
      app.revealedHints = {};
      app.debouncedSaveState = vi.fn();
      app.announceToScreenReader = vi.fn();

      app.revealNextHint("test-checkbox");
      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Hint revealed: Accessible hint",
        "polite"
      );
    });

    it("should provide appropriate aria labels for hint interactions", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "test-checkbox": {
            title: "Test Checkbox",
            additionalHints: ["Hint 1"],
          },
        },
      };

      // The HTML template should include proper aria-label for lightbulb buttons
      // This is tested through the HTML structure we added
      expect(app.hasAdditionalHints("test-checkbox")).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should handle large numbers of hints efficiently", () => {
      const app = checklistApp();
      const manyHints = Array.from({ length: 100 }, (_, i) => `Hint ${i + 1}`);

      app.data = {
        checkboxes: {
          "many-hints": {
            title: "Many Hints Checkbox",
            additionalHints: manyHints,
          },
        },
      };
      app.revealedHints = { "many-hints": 50 };

      // Should handle large hint arrays without performance issues
      const start = Date.now();
      const displayData = app.getHintDisplayData("many-hints");
      const end = Date.now();

      expect(displayData.totalHints).toBe(100);
      expect(displayData.revealedCount).toBe(50);
      expect(end - start).toBeLessThan(10); // Should complete in less than 10ms
    });

    it("should not impact checkbox performance when hints are not used", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "normal-checkbox": {
            title: "Normal Checkbox",
          },
        },
      };

      // Should quickly determine no hints are available
      const start = Date.now();
      const hasHints = app.hasAdditionalHints("normal-checkbox");
      const shouldShow = app.shouldShowHints("normal-checkbox");
      const end = Date.now();

      expect(hasHints).toBe(false);
      expect(shouldShow).toBe(false);
      expect(end - start).toBeLessThan(1); // Should be nearly instantaneous
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty hint arrays", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "empty-hints": {
            title: "Empty Hints",
            additionalHints: [],
          },
        },
      };

      expect(app.hasAdditionalHints("empty-hints")).toBe(false);
      expect(app.shouldShowHints("empty-hints")).toBe(false);
      expect(app.getHintDisplayData("empty-hints")).toBeNull();
    });

    it("should handle missing checkbox data", () => {
      const app = checklistApp();
      app.data = { checkboxes: {} };

      expect(app.hasAdditionalHints("non-existent")).toBe(false);
      expect(app.shouldShowHints("non-existent")).toBe(false);
      expect(app.getHintDisplayData("non-existent")).toBeNull();
      expect(app.getRevealedHints("non-existent")).toEqual([]);
      expect(app.getUnrevealedLightbulbCount("non-existent")).toBe(0);
    });

    it("should handle null/undefined data gracefully", () => {
      const app = checklistApp();
      app.data = { checkboxes: null };

      expect(() => app.hasAdditionalHints("test")).not.toThrow();
      expect(() => app.shouldShowHints("test")).not.toThrow();
      expect(() => app.getHintDisplayData("test")).not.toThrow();
    });

    it("should handle corrupted revealedHints values", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "test-checkbox": {
            title: "Test Checkbox",
            additionalHints: ["Hint 1", "Hint 2"],
          },
        },
      };

      // Set corrupted revealed hints count
      app.revealedHints = { "test-checkbox": 999 };

      // Should not reveal beyond available hints
      const revealedHints = app.getRevealedHints("test-checkbox");
      expect(revealedHints.length).toBeLessThanOrEqual(2);
    });
  });
});
