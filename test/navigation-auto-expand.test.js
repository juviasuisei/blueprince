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

describe("Navigation Auto-Expand Feature", () => {
  describe("Section Auto-Expand", () => {
    it("should auto-expand collapsed section when navigating to it", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      // Mock DOM element
      const mockElement = { scrollIntoView: vi.fn() };
      global.document = {
        getElementById: vi.fn().mockReturnValue(mockElement),
      };

      // Initially, section is collapsed
      app.expandedSections = [];
      expect(app.expandedSections).not.toContain("getting-started");

      // Navigate to the section
      app.scrollToSection("getting-started");

      // Verify section was auto-expanded
      expect(app.expandedSections).toContain("getting-started");
      expect(app.debouncedSaveState).toHaveBeenCalled();
      expect(app.$nextTick).toHaveBeenCalled();
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
    });

    it("should not affect already expanded sections", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      // Mock DOM element
      const mockElement = { scrollIntoView: vi.fn() };
      global.document = {
        getElementById: vi.fn().mockReturnValue(mockElement),
      };

      // Section is already expanded
      app.expandedSections = ["getting-started"];
      const originalLength = app.expandedSections.length;

      // Navigate to the section
      app.scrollToSection("getting-started");

      // Verify no duplicate entries were added
      expect(app.expandedSections).toHaveLength(originalLength);
      expect(
        app.expandedSections.filter((id) => id === "getting-started")
      ).toHaveLength(1);
    });
  });

  describe("Subsection Auto-Expand", () => {
    it("should auto-expand both parent section and subsection when navigating to subsection", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      // Mock DOM element
      const mockElement = { scrollIntoView: vi.fn() };
      global.document = {
        getElementById: vi.fn().mockReturnValue(mockElement),
      };

      // Initially, both parent section and subsection are collapsed
      app.expandedSections = [];
      app.expandedSubsections = [];

      // Navigate to the subsection
      app.scrollToSubsection("basics");

      // Verify both parent section and subsection were auto-expanded
      expect(app.expandedSections).toContain("getting-started");
      expect(app.expandedSubsections).toContain("basics");
      expect(app.debouncedSaveState).toHaveBeenCalled();
      expect(app.$nextTick).toHaveBeenCalled();
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
    });

    it("should only expand what needs to be expanded", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      // Mock DOM element
      const mockElement = { scrollIntoView: vi.fn() };
      global.document = {
        getElementById: vi.fn().mockReturnValue(mockElement),
      };

      // Parent section is already expanded, but subsection is collapsed
      app.expandedSections = ["getting-started"];
      app.expandedSubsections = [];

      // Navigate to the subsection
      app.scrollToSubsection("basics");

      // Verify only subsection was added (parent was already expanded)
      expect(app.expandedSections).toContain("getting-started");
      expect(app.expandedSubsections).toContain("basics");
      expect(
        app.expandedSections.filter((id) => id === "getting-started")
      ).toHaveLength(1);
    });

    it("should handle subsection navigation when both are already expanded", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      // Mock DOM element
      const mockElement = { scrollIntoView: vi.fn() };
      global.document = {
        getElementById: vi.fn().mockReturnValue(mockElement),
      };

      // Both parent section and subsection are already expanded
      app.expandedSections = ["getting-started"];
      app.expandedSubsections = ["basics"];
      const originalSectionLength = app.expandedSections.length;
      const originalSubsectionLength = app.expandedSubsections.length;

      // Navigate to the subsection
      app.scrollToSubsection("basics");

      // Verify no duplicate entries were added
      expect(app.expandedSections).toHaveLength(originalSectionLength);
      expect(app.expandedSubsections).toHaveLength(originalSubsectionLength);
      expect(
        app.expandedSections.filter((id) => id === "getting-started")
      ).toHaveLength(1);
      expect(
        app.expandedSubsections.filter((id) => id === "basics")
      ).toHaveLength(1);
    });
  });

  describe("State Persistence", () => {
    it("should save state after auto-expanding sections", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      // Mock DOM element
      const mockElement = { scrollIntoView: vi.fn() };
      global.document = {
        getElementById: vi.fn().mockReturnValue(mockElement),
      };

      // Navigate to collapsed section
      app.expandedSections = [];
      app.scrollToSection("getting-started");

      // Verify state was saved
      expect(app.debouncedSaveState).toHaveBeenCalled();
    });

    it("should save state after auto-expanding subsections", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      // Mock DOM element
      const mockElement = { scrollIntoView: vi.fn() };
      global.document = {
        getElementById: vi.fn().mockReturnValue(mockElement),
      };

      // Navigate to collapsed subsection
      app.expandedSections = [];
      app.expandedSubsections = [];
      app.scrollToSubsection("basics");

      // Verify state was saved
      expect(app.debouncedSaveState).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle navigation to non-existent section gracefully", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      global.document = {
        getElementById: vi.fn().mockReturnValue(null),
      };

      // Should not throw error
      expect(() => app.scrollToSection("non-existent-section")).not.toThrow();

      // Should still attempt to expand (even though section doesn't exist)
      expect(app.expandedSections).toContain("non-existent-section");
      expect(app.debouncedSaveState).toHaveBeenCalled();
    });

    it("should handle navigation to subsection with no parent gracefully", () => {
      const app = checklistApp();
      app.data = { sections: [] }; // Empty sections
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      global.document = {
        getElementById: vi.fn().mockReturnValue(null),
      };

      // Should not throw error
      expect(() => app.scrollToSubsection("orphan-subsection")).not.toThrow();

      // Should still attempt to expand subsection
      expect(app.expandedSubsections).toContain("orphan-subsection");
      expect(app.debouncedSaveState).toHaveBeenCalled();
    });
  });

  describe("Integration with Existing Navigation", () => {
    it("should work with existing navigation toggle functionality", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      // Mock DOM element
      const mockElement = { scrollIntoView: vi.fn() };
      global.document = {
        getElementById: vi.fn().mockReturnValue(mockElement),
      };

      // Test navigation panel toggle
      expect(app.showNavigation).toBe(false);
      app.toggleNavigation();
      expect(app.showNavigation).toBe(true);

      // Test navigation section toggle
      app.toggleNavSection("getting-started");
      expect(app.expandedNavSections).toContain("getting-started");

      // Test auto-expand navigation
      app.expandedSections = [];
      app.scrollToSection("getting-started");
      expect(app.expandedSections).toContain("getting-started");

      // All functionality should work together
      expect(app.showNavigation).toBe(true);
      expect(app.expandedNavSections).toContain("getting-started");
      expect(app.expandedSections).toContain("getting-started");
    });
  });
});
