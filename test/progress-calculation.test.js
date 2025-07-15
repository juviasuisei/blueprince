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
    expect(total).toBe(9); // All checkboxes in the enhanced test data
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

describe("Visible Progress Calculation", () => {
  describe("Visible Checkbox Filtering", () => {
    it("should filter checkboxes based on dependencies", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["visible-checkbox", "hidden-checkbox"],
          },
        ],
        checkboxes: {
          "visible-checkbox": {
            title: "Visible Checkbox",
            dependencies: [],
          },
          "hidden-checkbox": {
            title: "Hidden Checkbox",
            dependencies: ["prerequisite"],
          },
        },
      };
      app.checkedItems = []; // No prerequisites satisfied

      const visibleCheckboxes =
        app.getVisibleCheckboxesInSection("test-section");
      expect(visibleCheckboxes).toEqual(["visible-checkbox"]);
      expect(visibleCheckboxes).not.toContain("hidden-checkbox");
    });

    it("should include checkboxes when dependencies are satisfied", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["visible-checkbox", "conditional-checkbox"],
          },
        ],
        checkboxes: {
          "visible-checkbox": {
            title: "Visible Checkbox",
            dependencies: [],
          },
          "conditional-checkbox": {
            title: "Conditional Checkbox",
            dependencies: ["prerequisite"],
          },
        },
      };
      app.checkedItems = ["prerequisite"]; // Prerequisite satisfied

      const visibleCheckboxes =
        app.getVisibleCheckboxesInSection("test-section");
      expect(visibleCheckboxes).toContain("visible-checkbox");
      expect(visibleCheckboxes).toContain("conditional-checkbox");
      expect(visibleCheckboxes).toHaveLength(2);
    });

    it("should handle optional dependencies correctly", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["optional-checkbox"],
          },
        ],
        checkboxes: {
          "optional-checkbox": {
            title: "Optional Checkbox",
            dependencies: ["option-a", "option-b"],
            optionalDependencies: true,
          },
        },
      };
      app.checkedItems = ["option-a"]; // Only one of the optional dependencies satisfied

      const visibleCheckboxes =
        app.getVisibleCheckboxesInSection("test-section");
      expect(visibleCheckboxes).toContain("optional-checkbox");
    });

    it("should handle mystery checkboxes correctly", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["mystery-checkbox"],
          },
        ],
        checkboxes: {
          "mystery-checkbox": {
            title: "Mystery Checkbox",
            unlockKeyword: "secret",
            dependencies: [],
          },
        },
      };
      app.checkedItems = [];

      const visibleCheckboxes =
        app.getVisibleCheckboxesInSection("test-section");
      expect(visibleCheckboxes).toContain("mystery-checkbox"); // Mystery checkboxes are visible if dependencies are met
    });
  });

  describe("Section Visible Progress Calculation", () => {
    it("should calculate visible total count correctly", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["visible-1", "visible-2", "hidden-1"],
          },
        ],
        checkboxes: {
          "visible-1": { dependencies: [] },
          "visible-2": { dependencies: [] },
          "hidden-1": { dependencies: ["prerequisite"] },
        },
      };
      app.checkedItems = []; // No prerequisites satisfied

      const visibleTotal = app.getSectionVisibleTotalCount("test-section");
      expect(visibleTotal).toBe(2); // Only visible-1 and visible-2
    });

    it("should calculate visible checked count correctly", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["visible-1", "visible-2", "hidden-1"],
          },
        ],
        checkboxes: {
          "visible-1": { dependencies: [] },
          "visible-2": { dependencies: [] },
          "hidden-1": { dependencies: ["prerequisite"] },
        },
      };
      app.checkedItems = ["visible-1"]; // Only visible-1 is checked

      const visibleChecked = app.getSectionVisibleCheckedCount("test-section");
      expect(visibleChecked).toBe(1); // Only visible-1 is both visible and checked
    });

    it("should handle sections with subsections", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["direct-visible"],
            subsections: [
              {
                id: "subsection-1",
                checkboxes: ["sub-visible", "sub-hidden"],
              },
            ],
          },
        ],
        checkboxes: {
          "direct-visible": { dependencies: [] },
          "sub-visible": { dependencies: [] },
          "sub-hidden": { dependencies: ["prerequisite"] },
        },
      };
      app.checkedItems = []; // No prerequisites satisfied

      const visibleTotal = app.getSectionVisibleTotalCount("test-section");
      expect(visibleTotal).toBe(2); // direct-visible and sub-visible
    });

    it("should return 0 for non-existent section", () => {
      const app = checklistApp();
      app.data = { sections: [], checkboxes: {} };

      expect(app.getSectionVisibleTotalCount("non-existent")).toBe(0);
      expect(app.getSectionVisibleCheckedCount("non-existent")).toBe(0);
    });
  });

  describe("Subsection Visible Progress Calculation", () => {
    it("should calculate subsection visible total count correctly", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            subsections: [
              {
                id: "test-subsection",
                checkboxes: ["visible-1", "visible-2", "hidden-1"],
              },
            ],
          },
        ],
        checkboxes: {
          "visible-1": { dependencies: [] },
          "visible-2": { dependencies: [] },
          "hidden-1": { dependencies: ["prerequisite"] },
        },
      };
      app.checkedItems = []; // No prerequisites satisfied

      const visibleTotal =
        app.getSubsectionVisibleTotalCount("test-subsection");
      expect(visibleTotal).toBe(2); // Only visible-1 and visible-2
    });

    it("should calculate subsection visible checked count correctly", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            subsections: [
              {
                id: "test-subsection",
                checkboxes: ["visible-1", "visible-2", "hidden-1"],
              },
            ],
          },
        ],
        checkboxes: {
          "visible-1": { dependencies: [] },
          "visible-2": { dependencies: [] },
          "hidden-1": { dependencies: ["prerequisite"] },
        },
      };
      app.checkedItems = ["visible-1", "hidden-1"]; // hidden-1 is checked but not visible

      const visibleChecked =
        app.getSubsectionVisibleCheckedCount("test-subsection");
      expect(visibleChecked).toBe(1); // Only visible-1 is both visible and checked
    });

    it("should return 0 for non-existent subsection", () => {
      const app = checklistApp();
      app.data = { sections: [], checkboxes: {} };

      expect(app.getSubsectionVisibleTotalCount("non-existent")).toBe(0);
      expect(app.getSubsectionVisibleCheckedCount("non-existent")).toBe(0);
    });
  });

  describe("Progress Calculation Consistency", () => {
    it("should maintain consistency between total and visible progress", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["checkbox-1", "checkbox-2"],
          },
        ],
        checkboxes: {
          "checkbox-1": { dependencies: [] },
          "checkbox-2": { dependencies: [] },
        },
      };
      app.checkedItems = ["checkbox-1"];

      // When all checkboxes are visible, visible counts should match total counts
      const totalCount = app.getSectionTotalCount("test-section");
      const visibleCount = app.getSectionVisibleTotalCount("test-section");
      const totalChecked = app.getSectionCheckedCount("test-section");
      const visibleChecked = app.getSectionVisibleCheckedCount("test-section");

      expect(visibleCount).toBe(totalCount);
      expect(visibleChecked).toBe(totalChecked);
    });

    it("should show different counts when some checkboxes are hidden", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["visible-checkbox", "hidden-checkbox"],
          },
        ],
        checkboxes: {
          "visible-checkbox": { dependencies: [] },
          "hidden-checkbox": { dependencies: ["prerequisite"] },
        },
      };
      app.checkedItems = [];

      const totalCount = app.getSectionTotalCount("test-section");
      const visibleCount = app.getSectionVisibleTotalCount("test-section");

      expect(totalCount).toBe(2); // All checkboxes
      expect(visibleCount).toBe(1); // Only visible checkboxes
      expect(visibleCount).toBeLessThan(totalCount);
    });

    it("should preserve overall progress calculation", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["visible-checkbox", "hidden-checkbox"],
          },
        ],
        checkboxes: {
          "visible-checkbox": { dependencies: [] },
          "hidden-checkbox": { dependencies: ["prerequisite"] },
        },
      };
      app.checkedItems = ["visible-checkbox"];

      // Overall progress should count all checkboxes
      const totalCheckboxes = app.getTotalCheckboxes();
      const totalChecked = app.getTotalChecked();

      expect(totalCheckboxes).toBe(2); // All checkboxes regardless of visibility
      expect(totalChecked).toBe(1); // All checked items regardless of visibility
    });
  });

  describe("Performance Optimizations", () => {
    it("should cache progress calculations", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["checkbox-1"],
          },
        ],
        checkboxes: {
          "checkbox-1": { dependencies: [] },
        },
      };
      app.checkedItems = [];

      // First call should calculate and cache
      const firstCall = app.getSectionVisibleTotalCount("test-section");
      expect(firstCall).toBe(1);
      expect(app._progressCache).toBeDefined();

      // Second call should use cache
      const secondCall = app.getSectionVisibleTotalCount("test-section");
      expect(secondCall).toBe(1);
      expect(secondCall).toBe(firstCall);
    });

    it("should invalidate cache when state changes", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["checkbox-1"],
          },
        ],
        checkboxes: {
          "checkbox-1": { dependencies: [] },
        },
      };
      app.checkedItems = [];
      app.debouncedSaveState = () => {}; // Mock save state
      app.$nextTick = (callback) => callback(); // Mock nextTick
      app.initializeSwipers = () => {}; // Mock swipers
      app.observeImages = () => {}; // Mock image observer

      // Initial calculation
      const initialCount = app.getSectionVisibleCheckedCount("test-section");
      expect(initialCount).toBe(0);

      // Change state
      app.toggleCheckbox("checkbox-1");

      // Cache should be invalidated and new calculation should reflect change
      const updatedCount = app.getSectionVisibleCheckedCount("test-section");
      expect(updatedCount).toBe(1);
    });

    it("should handle cache gracefully when not initialized", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "test-section",
            checkboxes: ["checkbox-1"],
          },
        ],
        checkboxes: {
          "checkbox-1": { dependencies: [] },
        },
      };
      app.checkedItems = [];

      // Should work even without cache initialization
      const result = app.getSectionVisibleTotalCount("test-section");
      expect(result).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty sections gracefully", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "empty-section",
            checkboxes: [],
          },
        ],
        checkboxes: {},
      };

      expect(app.getSectionVisibleTotalCount("empty-section")).toBe(0);
      expect(app.getSectionVisibleCheckedCount("empty-section")).toBe(0);
    });

    it("should handle sections with no visible checkboxes", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "hidden-section",
            checkboxes: ["hidden-1", "hidden-2"],
          },
        ],
        checkboxes: {
          "hidden-1": { dependencies: ["prerequisite"] },
          "hidden-2": { dependencies: ["prerequisite"] },
        },
      };
      app.checkedItems = []; // No prerequisites satisfied

      expect(app.getSectionVisibleTotalCount("hidden-section")).toBe(0);
      expect(app.getSectionVisibleCheckedCount("hidden-section")).toBe(0);
    });

    it("should handle complex dependency chains", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "complex-section",
            checkboxes: ["level-1", "level-2", "level-3"],
          },
        ],
        checkboxes: {
          "level-1": { dependencies: [] },
          "level-2": { dependencies: ["level-1"] },
          "level-3": { dependencies: ["level-2"] },
        },
      };
      app.checkedItems = ["level-1"]; // Only first level satisfied

      const visibleTotal = app.getSectionVisibleTotalCount("complex-section");
      expect(visibleTotal).toBe(2); // level-1 and level-2 should be visible
    });

    it("should handle circular dependencies gracefully", () => {
      const app = checklistApp();
      app.data = {
        sections: [
          {
            id: "circular-section",
            checkboxes: ["checkbox-a", "checkbox-b"],
          },
        ],
        checkboxes: {
          "checkbox-a": { dependencies: ["checkbox-b"] },
          "checkbox-b": { dependencies: ["checkbox-a"] },
        },
      };
      app.checkedItems = [];

      // Should not crash and should handle gracefully
      expect(() => {
        app.getSectionVisibleTotalCount("circular-section");
      }).not.toThrow();
    });
  });
});
