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

describe("Navigation System", () => {
  describe("Navigation State Management", () => {
    it("should initialize with navigation closed", () => {
      const app = checklistApp();

      expect(app.showNavigation).toBe(false);
      expect(app.expandedNavSections).toEqual([]);
      expect(app.currentActiveSection).toBeNull();
    });

    it("should toggle navigation visibility", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();

      // Initially closed
      expect(app.showNavigation).toBe(false);

      // Toggle open
      app.toggleNavigation();
      expect(app.showNavigation).toBe(true);
      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigation opened",
        "polite"
      );

      // Toggle closed
      app.toggleNavigation();
      expect(app.showNavigation).toBe(false);
      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigation closed",
        "polite"
      );
    });

    it("should toggle navigation section expansion", () => {
      const app = checklistApp();

      // Initially no sections expanded
      expect(app.expandedNavSections).toEqual([]);

      // Expand section
      app.toggleNavSection("test-section");
      expect(app.expandedNavSections).toContain("test-section");

      // Collapse section
      app.toggleNavSection("test-section");
      expect(app.expandedNavSections).not.toContain("test-section");
    });

    it("should handle multiple expanded navigation sections", () => {
      const app = checklistApp();

      // Expand multiple sections
      app.toggleNavSection("section-1");
      app.toggleNavSection("section-2");

      expect(app.expandedNavSections).toContain("section-1");
      expect(app.expandedNavSections).toContain("section-2");
      expect(app.expandedNavSections).toHaveLength(2);

      // Collapse one section
      app.toggleNavSection("section-1");
      expect(app.expandedNavSections).not.toContain("section-1");
      expect(app.expandedNavSections).toContain("section-2");
      expect(app.expandedNavSections).toHaveLength(1);
    });
  });

  describe("Navigation Scrolling", () => {
    beforeEach(() => {
      // Mock DOM elements and scrollIntoView
      global.document = {
        getElementById: vi.fn(),
      };
    });

    it("should scroll to section when section navigation is clicked", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      const mockElement = {
        scrollIntoView: vi.fn(),
      };

      global.document.getElementById.mockReturnValue(mockElement);

      app.scrollToSection("getting-started");

      expect(global.document.getElementById).toHaveBeenCalledWith(
        "section-getting-started"
      );
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
      expect(app.currentActiveSection).toBe("getting-started");
      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigated to Getting Started section",
        "polite"
      );
    });

    it("should auto-expand collapsed section before scrolling", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();
      app.expandedSections = []; // Section is initially collapsed

      const mockElement = {
        scrollIntoView: vi.fn(),
      };

      global.document.getElementById.mockReturnValue(mockElement);

      app.scrollToSection("getting-started");

      // Should auto-expand the section
      expect(app.expandedSections).toContain("getting-started");
      expect(app.debouncedSaveState).toHaveBeenCalled();
      expect(app.$nextTick).toHaveBeenCalled();
    });

    it("should not duplicate section in expandedSections if already expanded", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();
      app.expandedSections = ["getting-started"]; // Section is already expanded

      const mockElement = {
        scrollIntoView: vi.fn(),
      };

      global.document.getElementById.mockReturnValue(mockElement);

      app.scrollToSection("getting-started");

      // Should not duplicate the section
      expect(
        app.expandedSections.filter((id) => id === "getting-started")
      ).toHaveLength(1);
    });

    it("should scroll to subsection when subsection navigation is clicked", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      const mockElement = {
        scrollIntoView: vi.fn(),
      };

      global.document.getElementById.mockReturnValue(mockElement);

      app.scrollToSubsection("basics");

      expect(global.document.getElementById).toHaveBeenCalledWith(
        "subsection-basics"
      );
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      });
      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigated to The Basics subsection",
        "polite"
      );
    });

    it("should auto-expand parent section and subsection before scrolling to subsection", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();
      app.expandedSections = []; // Parent section is collapsed
      app.expandedSubsections = []; // Subsection is collapsed

      const mockElement = {
        scrollIntoView: vi.fn(),
      };

      global.document.getElementById.mockReturnValue(mockElement);

      app.scrollToSubsection("basics");

      // Should auto-expand both parent section and subsection
      expect(app.expandedSections).toContain("getting-started");
      expect(app.expandedSubsections).toContain("basics");
      expect(app.debouncedSaveState).toHaveBeenCalled();
      expect(app.$nextTick).toHaveBeenCalled();
    });

    it("should handle subsection with no parent section gracefully", () => {
      const app = checklistApp();
      app.data = { sections: [] }; // Empty sections
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      const mockElement = {
        scrollIntoView: vi.fn(),
      };

      global.document.getElementById.mockReturnValue(mockElement);

      // Should not throw error
      expect(() =>
        app.scrollToSubsection("non-existent-subsection")
      ).not.toThrow();
      expect(app.debouncedSaveState).toHaveBeenCalled();
    });

    it("should not duplicate subsection in expandedSubsections if already expanded", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();
      app.expandedSections = ["getting-started"]; // Parent section already expanded
      app.expandedSubsections = ["basics"]; // Subsection already expanded

      const mockElement = {
        scrollIntoView: vi.fn(),
      };

      global.document.getElementById.mockReturnValue(mockElement);

      app.scrollToSubsection("basics");

      // Should not duplicate entries
      expect(
        app.expandedSections.filter((id) => id === "getting-started")
      ).toHaveLength(1);
      expect(
        app.expandedSubsections.filter((id) => id === "basics")
      ).toHaveLength(1);
    });

    it("should handle missing section element gracefully", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      global.document.getElementById.mockReturnValue(null);

      // Should not throw error
      expect(() => app.scrollToSection("non-existent-section")).not.toThrow();
      expect(app.currentActiveSection).toBeNull();
    });

    it("should handle missing subsection element gracefully", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      global.document.getElementById.mockReturnValue(null);

      // Should not throw error
      expect(() =>
        app.scrollToSubsection("non-existent-subsection")
      ).not.toThrow();
    });
  });

  describe("Navigation Helper Functions", () => {
    it("should get section title correctly", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;

      const title = app.getSectionTitle("getting-started");
      expect(title).toBe("Getting Started");
    });

    it("should return default title for unknown section", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;

      const title = app.getSectionTitle("non-existent-section");
      expect(title).toBe("Unknown Section");
    });

    it("should get subsection title correctly", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;

      const title = app.getSubsectionTitle("basics");
      expect(title).toBe("The Basics");
    });

    it("should return default title for unknown subsection", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;

      const title = app.getSubsectionTitle("non-existent-subsection");
      expect(title).toBe("Unknown Subsection");
    });

    it("should handle empty data gracefully", () => {
      const app = checklistApp();
      app.data = { sections: null };

      expect(app.getSectionTitle("test")).toBe("Unknown Section");
      expect(app.getSubsectionTitle("test")).toBe("Unknown Subsection");
    });
  });

  describe("Scroll Spy Functionality", () => {
    beforeEach(() => {
      // Mock IntersectionObserver
      global.IntersectionObserver = vi
        .fn()
        .mockImplementation((callback, options) => ({
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn(),
          callback,
          options,
        }));

      // Mock document.querySelectorAll
      global.document = {
        querySelectorAll: vi
          .fn()
          .mockReturnValue([
            { id: "section-getting-started" },
            { id: "section-intermediate" },
          ]),
      };
    });

    it("should set up scroll spy observer", () => {
      const app = checklistApp();
      app.$nextTick = vi.fn((callback) => callback());

      app.setupScrollSpy();

      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          rootMargin: "-20% 0px -70% 0px",
          threshold: 0.1,
        }
      );
    });

    it("should update current active section when section becomes visible", () => {
      const app = checklistApp();
      app.$nextTick = vi.fn((callback) => callback());

      app.setupScrollSpy();

      // Get the callback function from the IntersectionObserver mock
      const observerCallback = global.IntersectionObserver.mock.calls[0][0];

      // Simulate section becoming visible
      const entries = [
        {
          isIntersecting: true,
          target: { id: "section-getting-started" },
        },
      ];

      observerCallback(entries);

      expect(app.currentActiveSection).toBe("getting-started");
    });

    it("should not update active section when section is not intersecting", () => {
      const app = checklistApp();
      app.$nextTick = vi.fn((callback) => callback());
      app.currentActiveSection = "previous-section";

      app.setupScrollSpy();

      const observerCallback = global.IntersectionObserver.mock.calls[0][0];

      // Simulate section not being visible
      const entries = [
        {
          isIntersecting: false,
          target: { id: "section-getting-started" },
        },
      ];

      observerCallback(entries);

      expect(app.currentActiveSection).toBe("previous-section");
    });

    it("should handle missing IntersectionObserver gracefully", () => {
      const app = checklistApp();

      // Store original and set to undefined
      const originalIntersectionObserver = global.IntersectionObserver;
      delete global.IntersectionObserver;

      // Should not throw error
      expect(() => app.setupScrollSpy()).not.toThrow();

      // Restore original
      global.IntersectionObserver = originalIntersectionObserver;
    });
  });

  describe("Navigation Integration", () => {
    it("should only show visible sections in navigation", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.checkedItems = []; // No items checked, so only sections with no dependencies should be visible

      const visibleSections = app.getVisibleSections();

      // Should only include sections with no dependencies or satisfied dependencies
      expect(visibleSections).toHaveLength(1);
      expect(visibleSections[0].id).toBe("getting-started");
    });

    it("should only show visible subsections in navigation", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.checkedItems = ["setup"]; // Check setup to unlock advanced-basics subsection

      const visibleSubsections = app.getVisibleSubsections("getting-started");

      // Should include both basics (no dependencies) and advanced-basics (setup dependency satisfied)
      expect(visibleSubsections).toHaveLength(2);
      expect(visibleSubsections.map((s) => s.id)).toContain("basics");
      expect(visibleSubsections.map((s) => s.id)).toContain("advanced-basics");
    });

    it("should show progress indicators in navigation", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.checkedItems = ["setup", "first-step"];

      const sectionProgress = app.getSectionCheckedCount("getting-started");
      const sectionTotal = app.getSectionTotalCount("getting-started");

      expect(sectionProgress).toBe(2);
      expect(sectionTotal).toBe(6); // Total checkboxes in getting-started section

      const progressPercentage = Math.round(
        (sectionProgress / sectionTotal) * 100
      );
      expect(progressPercentage).toBe(33); // 2/6 = 33%
    });
  });

  describe("Accessibility", () => {
    it("should announce navigation state changes", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();

      app.toggleNavigation();

      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigation opened",
        "polite"
      );
    });

    it("should announce navigation to sections", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      const mockElement = { scrollIntoView: vi.fn() };
      global.document = {
        getElementById: vi.fn().mockReturnValue(mockElement),
      };

      app.scrollToSection("getting-started");

      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigated to Getting Started section",
        "polite"
      );
    });

    it("should announce navigation to subsections", () => {
      const app = checklistApp();
      app.data = global.window.checklistData;
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());
      app.debouncedSaveState = vi.fn();

      const mockElement = { scrollIntoView: vi.fn() };
      global.document = {
        getElementById: vi.fn().mockReturnValue(mockElement),
      };

      app.scrollToSubsection("basics");

      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigated to The Basics subsection",
        "polite"
      );
    });
  });
});
