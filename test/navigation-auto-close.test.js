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

  // Mock document event listeners
  global.document = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getElementById: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(),
  };
});

describe("Navigation Auto-Close Functionality", () => {
  describe("Event Listener Management", () => {
    it("should initialize with null event listeners", () => {
      const app = checklistApp();

      expect(app.navigationEventListeners.clickOutside).toBeNull();
      expect(app.navigationEventListeners.escapeKey).toBeNull();
    });

    it("should set up event listeners when navigation opens", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());

      // Initially closed
      expect(app.showNavigation).toBe(false);

      // Toggle open - should set up event listeners
      app.toggleNavigation();

      expect(app.showNavigation).toBe(true);
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        true
      );
      expect(global.document.addEventListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
      expect(app.navigationEventListeners.clickOutside).not.toBeNull();
      expect(app.navigationEventListeners.escapeKey).not.toBeNull();
    });

    it("should clean up event listeners when navigation closes", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());

      // Open navigation first
      app.toggleNavigation();
      expect(app.showNavigation).toBe(true);

      // Close navigation - should clean up event listeners
      app.toggleNavigation();

      expect(app.showNavigation).toBe(false);
      expect(global.document.removeEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
        true
      );
      expect(global.document.removeEventListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
      expect(app.navigationEventListeners.clickOutside).toBeNull();
      expect(app.navigationEventListeners.escapeKey).toBeNull();
    });

    it("should handle multiple open/close cycles without listener conflicts", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());

      // Multiple open/close cycles
      for (let i = 0; i < 3; i++) {
        app.toggleNavigation(); // Open
        expect(app.navigationEventListeners.clickOutside).not.toBeNull();
        expect(app.navigationEventListeners.escapeKey).not.toBeNull();

        app.toggleNavigation(); // Close
        expect(app.navigationEventListeners.clickOutside).toBeNull();
        expect(app.navigationEventListeners.escapeKey).toBeNull();
      }

      // Should have called addEventListener and removeEventListener 3 times each
      expect(global.document.addEventListener).toHaveBeenCalledTimes(6); // 3 cycles * 2 listeners
      expect(global.document.removeEventListener).toHaveBeenCalledTimes(6); // 3 cycles * 2 listeners
    });

    it("should clean up existing listeners before setting up new ones", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();

      // Manually set up listeners first
      app.setupNavigationAutoClose();

      const firstClickListener = app.navigationEventListeners.clickOutside;
      const firstKeyListener = app.navigationEventListeners.escapeKey;

      // Set up again - should clean up first
      app.setupNavigationAutoClose();

      // Should have different listener functions
      expect(app.navigationEventListeners.clickOutside).not.toBe(
        firstClickListener
      );
      expect(app.navigationEventListeners.escapeKey).not.toBe(firstKeyListener);
    });
  });

  describe("Click-Outside Detection", () => {
    beforeEach(() => {
      // Mock DOM elements for click detection
      global.document.querySelector = vi.fn();
    });

    it("should not process click-outside when navigation is closed", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();

      // Navigation is closed
      expect(app.showNavigation).toBe(false);

      // Create mock event
      const mockEvent = {
        target: {
          closest: vi.fn().mockReturnValue(null),
        },
      };

      // Should return early without processing
      app.handleClickOutside(mockEvent);

      expect(app.showNavigation).toBe(false);
      expect(app.announceToScreenReader).not.toHaveBeenCalled();
    });

    it("should not close navigation when clicking inside navigation panel", () => {
      const app = checklistApp();
      app.showNavigation = true;
      app.announceToScreenReader = vi.fn();

      // Mock click inside navigation panel
      const mockNavigationPanel = { id: "nav-panel" };
      const mockEvent = {
        target: {
          closest: vi.fn((selector) => {
            if (
              selector ===
              '[role="navigation"][aria-label="Section navigation"]'
            ) {
              return mockNavigationPanel;
            }
            return null;
          }),
        },
      };

      app.handleClickOutside(mockEvent);

      // Navigation should remain open
      expect(app.showNavigation).toBe(true);
      expect(app.announceToScreenReader).not.toHaveBeenCalled();
    });

    it("should not close navigation when clicking on toggle button", () => {
      const app = checklistApp();
      app.showNavigation = true;
      app.announceToScreenReader = vi.fn();

      // Mock click on toggle button
      const mockToggleButton = { id: "toggle-btn" };
      const mockEvent = {
        target: {
          closest: vi.fn((selector) => {
            if (selector === 'button[aria-label="Toggle navigation menu"]') {
              return mockToggleButton;
            }
            return null;
          }),
        },
      };

      app.handleClickOutside(mockEvent);

      // Navigation should remain open
      expect(app.showNavigation).toBe(true);
      expect(app.announceToScreenReader).not.toHaveBeenCalled();
    });

    it("should close navigation when clicking outside", () => {
      const app = checklistApp();
      app.showNavigation = true;
      app.announceToScreenReader = vi.fn();
      app.cleanupNavigationAutoClose = vi.fn();

      // Mock click outside navigation
      const mockEvent = {
        target: {
          closest: vi.fn().mockReturnValue(null), // Not inside navigation or toggle button
        },
      };

      app.handleClickOutside(mockEvent);

      // Navigation should be closed
      expect(app.showNavigation).toBe(false);
      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigation closed",
        "polite"
      );
      expect(app.cleanupNavigationAutoClose).toHaveBeenCalled();
    });
  });

  describe("Escape Key Handling", () => {
    it("should not process escape key when navigation is closed", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();

      // Navigation is closed
      expect(app.showNavigation).toBe(false);

      const mockEvent = {
        key: "Escape",
        preventDefault: vi.fn(),
      };

      app.handleNavigationEscape(mockEvent);

      // Should not affect navigation state
      expect(app.showNavigation).toBe(false);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(app.announceToScreenReader).not.toHaveBeenCalled();
    });

    it("should close navigation when escape key is pressed and navigation is open", () => {
      const app = checklistApp();
      app.showNavigation = true;
      app.announceToScreenReader = vi.fn();
      app.cleanupNavigationAutoClose = vi.fn();

      const mockEvent = {
        key: "Escape",
        preventDefault: vi.fn(),
      };

      app.handleNavigationEscape(mockEvent);

      // Navigation should be closed
      expect(app.showNavigation).toBe(false);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigation closed",
        "polite"
      );
      expect(app.cleanupNavigationAutoClose).toHaveBeenCalled();
    });

    it("should not process non-escape keys", () => {
      const app = checklistApp();
      app.showNavigation = true;
      app.announceToScreenReader = vi.fn();

      const mockEvent = {
        key: "Enter",
        preventDefault: vi.fn(),
      };

      app.handleNavigationEscape(mockEvent);

      // Navigation should remain open
      expect(app.showNavigation).toBe(true);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(app.announceToScreenReader).not.toHaveBeenCalled();
    });

    it("should handle multiple key events correctly", () => {
      const app = checklistApp();
      app.showNavigation = true;
      app.announceToScreenReader = vi.fn();
      app.cleanupNavigationAutoClose = vi.fn();

      // Test various keys
      const keys = ["Enter", "Space", "Tab", "ArrowDown", "Escape"];

      keys.forEach((key, index) => {
        if (key === "Escape") {
          const mockEvent = {
            key,
            preventDefault: vi.fn(),
          };

          app.handleNavigationEscape(mockEvent);

          expect(app.showNavigation).toBe(false);
          expect(mockEvent.preventDefault).toHaveBeenCalled();
        } else {
          // Reset navigation to open for non-escape keys
          app.showNavigation = true;

          const mockEvent = {
            key,
            preventDefault: vi.fn(),
          };

          app.handleNavigationEscape(mockEvent);

          expect(app.showNavigation).toBe(true);
          expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe("Integration with Existing Navigation", () => {
    it("should maintain existing toggle behavior", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());

      // Test normal toggle behavior
      expect(app.showNavigation).toBe(false);

      app.toggleNavigation();
      expect(app.showNavigation).toBe(true);
      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigation opened",
        "polite"
      );

      app.toggleNavigation();
      expect(app.showNavigation).toBe(false);
      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigation closed",
        "polite"
      );
    });

    it("should set up auto-close when navigation opens via toggle", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());

      app.toggleNavigation();

      expect(app.showNavigation).toBe(true);
      expect(app.navigationEventListeners.clickOutside).not.toBeNull();
      expect(app.navigationEventListeners.escapeKey).not.toBeNull();
    });

    it("should clean up auto-close when navigation closes via toggle", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());

      // Open then close
      app.toggleNavigation();
      app.toggleNavigation();

      expect(app.showNavigation).toBe(false);
      expect(app.navigationEventListeners.clickOutside).toBeNull();
      expect(app.navigationEventListeners.escapeKey).toBeNull();
    });

    it("should not interfere with other navigation functionality", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());

      // Test that other navigation methods still work
      app.toggleNavSection("test-section");
      expect(app.expandedNavSections).toContain("test-section");

      app.toggleNavSection("test-section");
      expect(app.expandedNavSections).not.toContain("test-section");
    });
  });

  describe("Accessibility Integration", () => {
    it("should announce auto-close events to screen readers", () => {
      const app = checklistApp();
      app.showNavigation = true;
      app.announceToScreenReader = vi.fn();
      app.cleanupNavigationAutoClose = vi.fn();

      // Test click-outside announcement
      const mockEvent = {
        target: {
          closest: vi.fn().mockReturnValue(null),
        },
      };

      app.handleClickOutside(mockEvent);

      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigation closed",
        "polite"
      );
    });

    it("should announce escape key close to screen readers", () => {
      const app = checklistApp();
      app.showNavigation = true;
      app.announceToScreenReader = vi.fn();
      app.cleanupNavigationAutoClose = vi.fn();

      const mockEvent = {
        key: "Escape",
        preventDefault: vi.fn(),
      };

      app.handleNavigationEscape(mockEvent);

      expect(app.announceToScreenReader).toHaveBeenCalledWith(
        "Navigation closed",
        "polite"
      );
    });

    it("should use consistent announcement messages", () => {
      const app = checklistApp();
      app.showNavigation = true;
      app.announceToScreenReader = vi.fn();
      app.cleanupNavigationAutoClose = vi.fn();

      // Test both auto-close methods use same message
      const clickEvent = {
        target: {
          closest: vi.fn().mockReturnValue(null),
        },
      };

      const escapeEvent = {
        key: "Escape",
        preventDefault: vi.fn(),
      };

      app.handleClickOutside(clickEvent);
      const clickMessage = app.announceToScreenReader.mock.calls[0];

      app.showNavigation = true; // Reset for second test
      app.handleNavigationEscape(escapeEvent);
      const escapeMessage = app.announceToScreenReader.mock.calls[1];

      expect(clickMessage).toEqual(escapeMessage);
      expect(clickMessage).toEqual(["Navigation closed", "polite"]);
    });
  });

  describe("Performance and Memory Management", () => {
    it("should not have active listeners when navigation is closed", () => {
      const app = checklistApp();

      // Initially closed - no listeners should be active
      expect(app.navigationEventListeners.clickOutside).toBeNull();
      expect(app.navigationEventListeners.escapeKey).toBeNull();
      expect(global.document.addEventListener).not.toHaveBeenCalled();
    });

    it("should properly clean up listeners to prevent memory leaks", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());

      // Open and close navigation multiple times
      for (let i = 0; i < 5; i++) {
        app.toggleNavigation(); // Open
        app.toggleNavigation(); // Close
      }

      // Should have equal number of addEventListener and removeEventListener calls
      const addCalls = global.document.addEventListener.mock.calls.length;
      const removeCalls = global.document.removeEventListener.mock.calls.length;

      expect(addCalls).toBe(removeCalls);
      expect(addCalls).toBe(10); // 5 cycles * 2 listeners per cycle
    });

    it("should handle rapid open/close scenarios", () => {
      const app = checklistApp();
      app.announceToScreenReader = vi.fn();
      app.$nextTick = vi.fn((callback) => callback());

      // Rapid toggle
      app.toggleNavigation();
      app.toggleNavigation();
      app.toggleNavigation();
      app.toggleNavigation();

      // Should end in closed state with no active listeners
      expect(app.showNavigation).toBe(false);
      expect(app.navigationEventListeners.clickOutside).toBeNull();
      expect(app.navigationEventListeners.escapeKey).toBeNull();
    });

    it("should not interfere with other click handlers", () => {
      const app = checklistApp();
      app.showNavigation = true;
      app.announceToScreenReader = vi.fn();
      app.cleanupNavigationAutoClose = vi.fn();

      // Mock event that should not be affected by our handler
      const mockEvent = {
        target: {
          closest: vi.fn().mockReturnValue(null),
        },
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      };

      app.handleClickOutside(mockEvent);

      // Our handler should not call stopPropagation or preventDefault
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle missing DOM elements gracefully", () => {
      const app = checklistApp();
      app.showNavigation = true;
      app.announceToScreenReader = vi.fn();

      // Mock event with target that throws error on closest()
      const mockEvent = {
        target: {
          closest: vi.fn().mockImplementation(() => {
            throw new Error("DOM error");
          }),
        },
      };

      // Should not throw error
      expect(() => app.handleClickOutside(mockEvent)).not.toThrow();
    });

    it("should handle event listener attachment failures gracefully", () => {
      const app = checklistApp();

      // Mock addEventListener to throw error
      global.document.addEventListener = vi.fn().mockImplementation(() => {
        throw new Error("Event listener error");
      });

      // Should not throw error
      expect(() => app.setupNavigationAutoClose()).not.toThrow();
    });

    it("should handle event listener removal failures gracefully", () => {
      const app = checklistApp();
      app.navigationEventListeners.clickOutside = vi.fn();
      app.navigationEventListeners.escapeKey = vi.fn();

      // Mock removeEventListener to throw error
      global.document.removeEventListener = vi.fn().mockImplementation(() => {
        throw new Error("Event listener removal error");
      });

      // Should not throw error and should still clean up references
      expect(() => app.cleanupNavigationAutoClose()).not.toThrow();
      expect(app.navigationEventListeners.clickOutside).toBeNull();
      expect(app.navigationEventListeners.escapeKey).toBeNull();
    });
  });
});
