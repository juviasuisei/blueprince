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

describe("Integration Tests - Complete User Workflows", () => {
  it("should complete a full user workflow from start to finish", async () => {
    const app = checklistApp();

    // Mock required methods
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();
    app.announceToScreenReader = vi.fn();

    // Initialize the app with data
    await app.loadData();
    app.loadState();

    // Verify initial state
    expect(app.checkedItems).toEqual([]);
    expect(app.expandedSections).toEqual([]);
    expect(app.unlockedMysteries).toEqual([]);

    // Step 1: Check first checkbox (no dependencies)
    app.toggleCheckbox("test-checkbox-1");
    expect(app.checkedItems).toContain("test-checkbox-1");
    expect(app.debouncedSaveState).toHaveBeenCalled();

    // Step 2: Verify dependent checkbox becomes visible
    const visibleCheckboxes = app.getVisibleCheckboxes([
      "test-checkbox-1",
      "test-checkbox-2",
    ]);
    expect(visibleCheckboxes).toContain("test-checkbox-2"); // Now visible due to dependency

    // Step 3: Check dependent checkbox
    app.toggleCheckbox("test-checkbox-2");
    expect(app.checkedItems).toContain("test-checkbox-2");

    // Step 4: Expand section to see progress
    app.toggleSection("test-section");
    expect(app.expandedSections).toContain("test-section");

    // Step 5: Verify progress calculation
    const sectionTotal = app.getSectionTotalCount("test-section");
    const sectionChecked = app.getSectionCheckedCount("test-section");
    expect(sectionTotal).toBe(2);
    expect(sectionChecked).toBe(2);

    // Step 6: Test mystery unlock workflow
    const mysteryResult = app.tryUnlockMystery("secret", ["mystery-checkbox"]);
    expect(mysteryResult).toBeTruthy();
    expect(mysteryResult.checkboxId).toBe("mystery-checkbox");
    expect(app.unlockedMysteries).toContain("mystery-checkbox");

    // Step 7: Check mystery checkbox
    app.toggleCheckbox("mystery-checkbox");
    expect(app.checkedItems).toContain("mystery-checkbox");

    // Step 8: Verify final state
    expect(app.getTotalChecked()).toBe(3);
    expect(app.announceToScreenReader).toHaveBeenCalled();
  });

  it("should handle progressive disclosure correctly", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    // Set up complex dependency data
    app.data = {
      sections: [
        {
          id: "section-1",
          title: "Section 1",
          dependencies: [],
          checkboxes: ["checkbox-1"],
        },
        {
          id: "section-2",
          title: "Section 2",
          dependencies: ["checkbox-1"], // Depends on checkbox-1
          checkboxes: ["checkbox-2"],
        },
        {
          id: "section-3",
          title: "Section 3",
          dependencies: ["checkbox-2"], // Depends on checkbox-2
          checkboxes: ["checkbox-3"],
        },
      ],
      checkboxes: {
        "checkbox-1": { title: "Checkbox 1", dependencies: [] },
        "checkbox-2": { title: "Checkbox 2", dependencies: [] },
        "checkbox-3": { title: "Checkbox 3", dependencies: [] },
      },
      information: {},
    };

    // Initially, only section-1 should be visible
    let visibleSections = app.getVisibleSections();
    expect(visibleSections).toHaveLength(1);
    expect(visibleSections[0].id).toBe("section-1");

    // Check checkbox-1
    app.toggleCheckbox("checkbox-1");

    // Now section-2 should become visible
    visibleSections = app.getVisibleSections();
    expect(visibleSections).toHaveLength(2);
    expect(visibleSections.map((s) => s.id)).toContain("section-2");

    // Check checkbox-2
    app.toggleCheckbox("checkbox-2");

    // Now all sections should be visible
    visibleSections = app.getVisibleSections();
    expect(visibleSections).toHaveLength(3);
    expect(visibleSections.map((s) => s.id)).toContain("section-3");
  });

  it("should handle mystery discovery through both methods", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();
    app.announceToScreenReader = vi.fn();

    app.data = {
      sections: [
        {
          id: "mystery-section",
          checkboxes: ["mystery-1", "mystery-2"],
        },
      ],
      checkboxes: {
        "mystery-1": {
          title: "Mystery 1",
          hint: "First mystery",
          unlockKeyword: "unlock1",
          dependencies: [],
        },
        "mystery-2": {
          title: "Mystery 2",
          hint: "Second mystery",
          unlockKeyword: "unlock2",
          dependencies: [],
        },
      },
      information: {},
    };

    // Method 1: Unlock via keyword
    const result1 = app.tryUnlockMystery("unlock1", ["mystery-1", "mystery-2"]);
    expect(result1).toBeTruthy();
    expect(result1.checkboxId).toBe("mystery-1");
    expect(app.unlockedMysteries).toContain("mystery-1");

    // Method 2: Unlock via direct click (toggleCheckbox)
    expect(app.unlockedMysteries).not.toContain("mystery-2");
    app.toggleCheckbox("mystery-2"); // This should unlock and check
    expect(app.unlockedMysteries).toContain("mystery-2");
    expect(app.checkedItems).toContain("mystery-2");

    // Verify mystery display states
    expect(app.getMysteryTitle("mystery-1")).toBe("First mystery"); // Unlocked, shows hint
    expect(app.getMysteryTitle("mystery-2")).toBe("Mystery 2"); // Unlocked and checked, shows title

    // Check first mystery
    app.toggleCheckbox("mystery-1");
    expect(app.shouldShowMysteryContent("mystery-1")).toBe(true); // Unlocked and checked
    expect(app.shouldShowMysteryContent("mystery-2")).toBe(true); // Unlocked and checked
  });
});

describe("Integration Tests - Data Loading and Aggregation", () => {
  it("should load and aggregate data correctly", async () => {
    const app = checklistApp();

    // Test data loading
    await app.loadData();

    expect(app.data).toBeDefined();
    expect(app.data.sections).toBeDefined();
    expect(app.data.checkboxes).toBeDefined();
    expect(app.data.information).toBeDefined();
    expect(app.dataLoadError).toBe(false);
  });

  it("should handle data loading errors gracefully", async () => {
    const app = checklistApp();

    // Simulate missing data
    global.window.checklistData = null;

    await app.loadData();

    expect(app.dataLoadError).toBe(true);
    expect(app.data.sections).toEqual([]);
    expect(app.data.checkboxes).toEqual({});
    expect(app.data.information).toEqual({});
  });

  it("should validate data structure integrity", async () => {
    const app = checklistApp();

    await app.loadData();

    // Verify sections structure
    expect(Array.isArray(app.data.sections)).toBe(true);
    app.data.sections.forEach((section) => {
      expect(section).toHaveProperty("id");
      expect(section).toHaveProperty("title");
      expect(section).toHaveProperty("dependencies");
      expect(Array.isArray(section.dependencies)).toBe(true);
    });

    // Verify checkboxes structure
    expect(typeof app.data.checkboxes).toBe("object");
    Object.values(app.data.checkboxes).forEach((checkbox) => {
      expect(checkbox).toHaveProperty("title");
      expect(checkbox).toHaveProperty("dependencies");
      expect(Array.isArray(checkbox.dependencies)).toBe(true);
    });

    // Verify information structure
    expect(typeof app.data.information).toBe("object");
    Object.values(app.data.information).forEach((info) => {
      expect(info).toHaveProperty("title");
      expect(info).toHaveProperty("dependencies");
      expect(Array.isArray(info.dependencies)).toBe(true);
    });
  });
});

describe("Integration Tests - Administrative Functions", () => {
  it("should reset all progress correctly", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    await app.loadData();

    // Set up some progress
    app.checkedItems = ["test-checkbox-1", "test-checkbox-2"];
    app.expandedSections = ["test-section"];
    app.expandedSubsections = ["test-subsection"];
    app.unlockedMysteries = ["mystery-checkbox"];

    // Reset all progress
    app.resetAllProgress();

    // Verify everything is reset
    expect(app.checkedItems).toEqual([]);
    expect(app.expandedSections).toEqual([]);
    expect(app.expandedSubsections).toEqual([]);
    expect(app.unlockedMysteries).toEqual([]);
    expect(localStorage.removeItem).toHaveBeenCalledWith("checklist-state");
  });

  it("should complete all progress correctly", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    await app.loadData();

    // Initially empty
    expect(app.checkedItems).toEqual([]);
    expect(app.unlockedMysteries).toEqual([]);

    // Complete all progress
    app.completeAllProgress();

    // Verify all checkboxes are checked
    const allCheckboxIds = Object.keys(app.data.checkboxes);
    allCheckboxIds.forEach((id) => {
      expect(app.checkedItems).toContain(id);
    });

    // Verify all mysteries are unlocked
    const mysteryIds = allCheckboxIds.filter(
      (id) => app.data.checkboxes[id].unlockKeyword
    );
    mysteryIds.forEach((id) => {
      expect(app.unlockedMysteries).toContain(id);
    });

    // Verify all sections are expanded
    app.data.sections.forEach((section) => {
      expect(app.expandedSections).toContain(section.id);

      if (section.subsections) {
        section.subsections.forEach((subsection) => {
          expect(app.expandedSubsections).toContain(subsection.id);
        });
      }
    });
  });
});

describe("Integration Tests - State Persistence", () => {
  it("should persist and restore complete application state", async () => {
    const app1 = checklistApp();
    app1.debouncedSaveState = vi.fn();
    app1.$nextTick = vi.fn((cb) => cb());
    app1.initializeSwipers = vi.fn();
    app1.observeImages = vi.fn();

    await app1.loadData();

    // Set up complex state
    app1.checkedItems = ["test-checkbox-1", "mystery-checkbox"];
    app1.expandedSections = ["test-section"];
    app1.expandedSubsections = ["test-subsection"];
    app1.unlockedMysteries = ["mystery-checkbox"];

    // Save state
    app1.saveState();

    // Verify localStorage was called with the correct data
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "checklist-state",
      expect.stringContaining(
        '"checkedItems":["test-checkbox-1","mystery-checkbox"]'
      )
    );

    // Mock the saved state for the second app instance
    const savedState = {
      checkedItems: ["test-checkbox-1", "mystery-checkbox"],
      expandedSections: ["test-section"],
      expandedSubsections: ["test-subsection"],
      unlockedMysteries: ["mystery-checkbox"],
    };
    localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

    // Create new app instance and load state
    const app2 = checklistApp();
    await app2.loadData();
    app2.loadState();

    // Verify state was restored correctly
    expect(app2.checkedItems).toEqual(["test-checkbox-1", "mystery-checkbox"]);
    expect(app2.expandedSections).toEqual(["test-section"]);
    expect(app2.expandedSubsections).toEqual(["test-subsection"]);
    expect(app2.unlockedMysteries).toEqual(["mystery-checkbox"]);
  });

  it("should handle state corruption and recovery", async () => {
    const app = checklistApp();

    // Simulate corrupted state
    localStorage.getItem.mockReturnValue('{"corrupted": "data"}');

    await app.loadData();
    app.loadState();

    // Should use default state when corruption is detected
    expect(app.checkedItems).toEqual([]);
    expect(app.expandedSections).toEqual([]);
    expect(app.expandedSubsections).toEqual([]);
    expect(app.unlockedMysteries).toEqual([]);
  });
});
