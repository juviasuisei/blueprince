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

describe("Progressive Disclosure System (Requirement 3)", () => {
  describe("Regular Items Progressive Disclosure", () => {
    it("should show hint when unchecked", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "regular-item": {
            title: "Complete This Task",
            hint: "Click to complete this task",
            description: "Full description when completed",
          },
        },
      };

      // Unchecked regular item should show hint
      const title = app.getMysteryTitle("regular-item");
      expect(title).toBe("Click to complete this task");
    });

    it("should show full title when checked", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "regular-item": {
            title: "Complete This Task",
            hint: "Click to complete this task",
            description: "Full description when completed",
          },
        },
      };

      // Check the item
      app.checkedItems = ["regular-item"];

      // Checked regular item should show full title
      const title = app.getMysteryTitle("regular-item");
      expect(title).toBe("Complete This Task");
    });

    it("should not show description when unchecked", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "regular-item": {
            title: "Complete This Task",
            hint: "Click to complete this task",
            description: "Full description when completed",
          },
        },
      };

      // Unchecked regular item should not show description
      const shouldShow = app.shouldShowMysteryDescription("regular-item");
      expect(shouldShow).toBe(false);
    });

    it("should show description when checked", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "regular-item": {
            title: "Complete This Task",
            hint: "Click to complete this task",
            description: "Full description when completed",
          },
        },
      };

      // Check the item
      app.checkedItems = ["regular-item"];

      // Checked regular item should show description
      const shouldShow = app.shouldShowMysteryDescription("regular-item");
      expect(shouldShow).toBe(true);
    });

    it("should handle items without hints gracefully", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "no-hint-item": {
            title: "Item Without Hint",
            description: "Description for item without hint",
          },
        },
      };

      // Item without hint should show title when unchecked
      const uncheckedTitle = app.getMysteryTitle("no-hint-item");
      expect(uncheckedTitle).toBe("Item Without Hint");

      // Check the item
      app.checkedItems = ["no-hint-item"];

      // Item should still show title when checked
      const checkedTitle = app.getMysteryTitle("no-hint-item");
      expect(checkedTitle).toBe("Item Without Hint");
    });
  });

  describe("Mystery Items Progressive Disclosure", () => {
    it("should show ??? when locked", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "mystery-item": {
            title: "Secret Treasure",
            hint: "A mysterious treasure awaits",
            description: "Full description of the treasure",
            unlockKeyword: "treasure",
          },
        },
      };

      // Locked mystery should show ???
      const title = app.getMysteryTitle("mystery-item");
      expect(title).toBe("???");
    });

    it("should show hint when unlocked but unchecked", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "mystery-item": {
            title: "Secret Treasure",
            hint: "A mysterious treasure awaits",
            description: "Full description of the treasure",
            unlockKeyword: "treasure",
          },
        },
      };

      // Unlock the mystery
      app.unlockedMysteries = ["mystery-item"];

      // Unlocked but unchecked mystery should show hint
      const title = app.getMysteryTitle("mystery-item");
      expect(title).toBe("A mysterious treasure awaits");
    });

    it("should show full title when unlocked and checked", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "mystery-item": {
            title: "Secret Treasure",
            hint: "A mysterious treasure awaits",
            description: "Full description of the treasure",
            unlockKeyword: "treasure",
          },
        },
      };

      // Unlock and check the mystery
      app.unlockedMysteries = ["mystery-item"];
      app.checkedItems = ["mystery-item"];

      // Unlocked and checked mystery should show full title
      const title = app.getMysteryTitle("mystery-item");
      expect(title).toBe("Secret Treasure");
    });

    it("should not show description when locked", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "mystery-item": {
            title: "Secret Treasure",
            hint: "A mysterious treasure awaits",
            description: "Full description of the treasure",
            unlockKeyword: "treasure",
          },
        },
      };

      // Locked mystery should not show description
      const shouldShow = app.shouldShowMysteryDescription("mystery-item");
      expect(shouldShow).toBe(false);
    });

    it("should not show description when unlocked but unchecked", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "mystery-item": {
            title: "Secret Treasure",
            hint: "A mysterious treasure awaits",
            description: "Full description of the treasure",
            unlockKeyword: "treasure",
          },
        },
      };

      // Unlock but don't check the mystery
      app.unlockedMysteries = ["mystery-item"];

      // Unlocked but unchecked mystery should not show description
      const shouldShow = app.shouldShowMysteryDescription("mystery-item");
      expect(shouldShow).toBe(false);
    });

    it("should show description when unlocked and checked", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "mystery-item": {
            title: "Secret Treasure",
            hint: "A mysterious treasure awaits",
            description: "Full description of the treasure",
            unlockKeyword: "treasure",
          },
        },
      };

      // Unlock and check the mystery
      app.unlockedMysteries = ["mystery-item"];
      app.checkedItems = ["mystery-item"];

      // Unlocked and checked mystery should show description
      const shouldShow = app.shouldShowMysteryDescription("mystery-item");
      expect(shouldShow).toBe(true);
    });
  });

  describe("Progressive Disclosure Integration", () => {
    it("should handle mixed regular and mystery items correctly", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "regular-item": {
            title: "Regular Task",
            hint: "Complete this task",
            description: "Regular task description",
          },
          "mystery-item": {
            title: "Hidden Secret",
            hint: "Something mysterious",
            description: "Secret description",
            unlockKeyword: "secret",
          },
        },
      };

      // Test initial state
      expect(app.getMysteryTitle("regular-item")).toBe("Complete this task"); // Regular shows hint
      expect(app.getMysteryTitle("mystery-item")).toBe("???"); // Mystery shows ???
      expect(app.shouldShowMysteryDescription("regular-item")).toBe(false);
      expect(app.shouldShowMysteryDescription("mystery-item")).toBe(false);

      // Check regular item
      app.checkedItems = ["regular-item"];
      expect(app.getMysteryTitle("regular-item")).toBe("Regular Task"); // Regular shows title
      expect(app.shouldShowMysteryDescription("regular-item")).toBe(true); // Regular shows description

      // Unlock mystery
      app.unlockedMysteries = ["mystery-item"];
      expect(app.getMysteryTitle("mystery-item")).toBe("Something mysterious"); // Mystery shows hint
      expect(app.shouldShowMysteryDescription("mystery-item")).toBe(false); // Mystery doesn't show description

      // Check mystery
      app.checkedItems = ["regular-item", "mystery-item"];
      expect(app.getMysteryTitle("mystery-item")).toBe("Hidden Secret"); // Mystery shows title
      expect(app.shouldShowMysteryDescription("mystery-item")).toBe(true); // Mystery shows description
    });

    it("should maintain progressive disclosure through state changes", () => {
      const app = checklistApp();
      app.data = {
        checkboxes: {
          "task-item": {
            title: "Important Task",
            hint: "This task needs completion",
            description: "Detailed instructions for the task",
          },
        },
      };

      // Initial state: unchecked
      expect(app.getMysteryTitle("task-item")).toBe(
        "This task needs completion"
      );
      expect(app.shouldShowMysteryDescription("task-item")).toBe(false);

      // Simulate checking the item
      app.checkedItems = ["task-item"];
      expect(app.getMysteryTitle("task-item")).toBe("Important Task");
      expect(app.shouldShowMysteryDescription("task-item")).toBe(true);

      // Simulate unchecking the item
      app.checkedItems = [];
      expect(app.getMysteryTitle("task-item")).toBe(
        "This task needs completion"
      );
      expect(app.shouldShowMysteryDescription("task-item")).toBe(false);
    });
  });
});
