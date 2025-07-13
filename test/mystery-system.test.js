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

describe("Mystery System", () => {
  it("should detect mysteries in checkbox list", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    const checkboxIds = ["test-checkbox-1", "mystery-checkbox"];
    expect(app.hasMysteries(checkboxIds)).toBe(true);
  });

  it("should return false when no mysteries exist", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    const checkboxIds = ["test-checkbox-1", "test-checkbox-2"];
    expect(app.hasMysteries(checkboxIds)).toBe(false);
  });

  it("should return false when mysteries are already unlocked", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.unlockedMysteries = ["mystery-checkbox"];

    const checkboxIds = ["mystery-checkbox"];
    expect(app.hasMysteries(checkboxIds)).toBe(false);
  });

  it("should return false for empty or null checkbox list", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    expect(app.hasMysteries([])).toBe(false);
    expect(app.hasMysteries(null)).toBe(false);
  });

  it("should unlock mystery with correct keyword", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.debouncedSaveState = vi.fn();
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["mystery-checkbox"];
    const result = app.tryUnlockMystery("secret", checkboxIds);

    expect(result).toBeTruthy();
    expect(result.checkboxId).toBe("mystery-checkbox");
    expect(result.title).toBe("Mystery Item");
    expect(result.matchedKeyword).toBe("secret");
    expect(app.unlockedMysteries).toContain("mystery-checkbox");
  });

  it("should unlock mystery with array of keywords", () => {
    const app = checklistApp();
    app.data = {
      checkboxes: {
        "multi-keyword-mystery": {
          title: "Multi-Keyword Mystery",
          hint: "Multiple ways to unlock",
          unlockKeyword: ["secret", "password", "key"],
          dependencies: [],
        },
      },
    };
    app.debouncedSaveState = vi.fn();
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["multi-keyword-mystery"];

    // Test first keyword
    let result = app.tryUnlockMystery("secret", checkboxIds);
    expect(result).toBeTruthy();
    expect(result.matchedKeyword).toBe("secret");

    // Reset for next test
    app.unlockedMysteries = [];

    // Test second keyword
    result = app.tryUnlockMystery("password", checkboxIds);
    expect(result).toBeTruthy();
    expect(result.matchedKeyword).toBe("password");

    // Reset for next test
    app.unlockedMysteries = [];

    // Test third keyword
    result = app.tryUnlockMystery("key", checkboxIds);
    expect(result).toBeTruthy();
    expect(result.matchedKeyword).toBe("key");
  });

  it("should unlock mystery with partial match from array of keywords", () => {
    const app = checklistApp();
    app.data = {
      checkboxes: {
        "multi-keyword-mystery": {
          title: "Multi-Keyword Mystery",
          hint: "Multiple ways to unlock",
          unlockKeyword: ["secretword", "password123", "masterkey"],
          dependencies: [],
        },
      },
    };
    app.debouncedSaveState = vi.fn();
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["multi-keyword-mystery"];

    // Test partial match with first keyword
    let result = app.tryUnlockMystery("secret", checkboxIds);
    expect(result).toBeTruthy();
    expect(result.matchedKeyword).toBe("secretword");

    // Reset for next test
    app.unlockedMysteries = [];

    // Test partial match with second keyword
    result = app.tryUnlockMystery("pass", checkboxIds);
    expect(result).toBeTruthy();
    expect(result.matchedKeyword).toBe("password123");
  });

  it("should return null when no keywords in array match", () => {
    const app = checklistApp();
    app.data = {
      checkboxes: {
        "multi-keyword-mystery": {
          title: "Multi-Keyword Mystery",
          hint: "Multiple ways to unlock",
          unlockKeyword: ["secret", "password", "key"],
          dependencies: [],
        },
      },
    };
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["multi-keyword-mystery"];
    const result = app.tryUnlockMystery("wrongword", checkboxIds);

    expect(result).toBeNull();
    expect(app.unlockedMysteries).not.toContain("multi-keyword-mystery");
  });

  it("should unlock mystery with partial keyword match", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.debouncedSaveState = vi.fn();
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["mystery-checkbox"];
    const result = app.tryUnlockMystery("sec", checkboxIds);

    expect(result).toBeTruthy();
    expect(result.checkboxId).toBe("mystery-checkbox");
  });

  it("should be case insensitive for keyword matching", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.debouncedSaveState = vi.fn();
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["mystery-checkbox"];
    const result = app.tryUnlockMystery("SECRET", checkboxIds);

    expect(result).toBeTruthy();
    expect(result.checkboxId).toBe("mystery-checkbox");
  });

  it("should return null for incorrect keyword", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["mystery-checkbox"];
    const result = app.tryUnlockMystery("wrong", checkboxIds);

    expect(result).toBeNull();
    expect(app.unlockedMysteries).not.toContain("mystery-checkbox");
  });

  it("should return null for empty or null input", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;

    const checkboxIds = ["mystery-checkbox"];
    expect(app.tryUnlockMystery("", checkboxIds)).toBeNull();
    expect(app.tryUnlockMystery(null, checkboxIds)).toBeNull();
    expect(app.tryUnlockMystery("secret", [])).toBeNull();
    expect(app.tryUnlockMystery("secret", null)).toBeNull();
  });

  it("should not unlock already unlocked mysteries", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.unlockedMysteries = ["mystery-checkbox"];
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["mystery-checkbox"];
    const result = app.tryUnlockMystery("secret", checkboxIds);

    expect(result).toBeNull();
  });

  it("should not unlock mysteries with unsatisfied dependencies", () => {
    const app = checklistApp();
    app.data = {
      checkboxes: {
        "mystery-with-deps": {
          title: "Mystery with Dependencies",
          unlockKeyword: "unlock",
          dependencies: ["non-existent-checkbox"],
        },
      },
    };
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["mystery-with-deps"];
    const result = app.tryUnlockMystery("unlock", checkboxIds);

    expect(result).toBeNull();
  });

  it("should unlock mysteries with satisfied optional dependencies", () => {
    const app = checklistApp();
    app.checkedItems = ["test-checkbox-1"]; // Only one dependency satisfied
    app.data = {
      checkboxes: {
        "mystery-optional-deps": {
          title: "Mystery with Optional Dependencies",
          unlockKeyword: "unlock",
          dependencies: ["test-checkbox-1", "test-checkbox-2"],
          optionalDependencies: true, // Only one dependency needs to be satisfied
        },
      },
    };
    app.debouncedSaveState = vi.fn();
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["mystery-optional-deps"];
    const result = app.tryUnlockMystery("unlock", checkboxIds);

    expect(result).toBeTruthy();
    expect(result.checkboxId).toBe("mystery-optional-deps");
    expect(app.unlockedMysteries).toContain("mystery-optional-deps");
  });

  it("should not unlock mysteries with unsatisfied optional dependencies", () => {
    const app = checklistApp();
    app.checkedItems = []; // No dependencies satisfied
    app.data = {
      checkboxes: {
        "mystery-optional-deps": {
          title: "Mystery with Optional Dependencies",
          unlockKeyword: "unlock",
          dependencies: ["test-checkbox-1", "test-checkbox-2"],
          optionalDependencies: true,
        },
      },
    };
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["mystery-optional-deps"];
    const result = app.tryUnlockMystery("unlock", checkboxIds);

    expect(result).toBeNull();
  });

  it("should detect mysteries with optional dependencies correctly", () => {
    const app = checklistApp();
    app.checkedItems = ["test-checkbox-1"]; // Only one dependency satisfied
    app.data = {
      checkboxes: {
        "mystery-optional-deps": {
          title: "Mystery with Optional Dependencies",
          unlockKeyword: "unlock",
          dependencies: ["test-checkbox-1", "test-checkbox-2"],
          optionalDependencies: true,
        },
        "mystery-required-deps": {
          title: "Mystery with Required Dependencies",
          unlockKeyword: "unlock2",
          dependencies: ["test-checkbox-1", "test-checkbox-2"],
          optionalDependencies: false,
        },
      },
    };

    // Should detect the optional dependencies mystery but not the required dependencies one
    expect(app.hasMysteries(["mystery-optional-deps"])).toBe(true);
    expect(app.hasMysteries(["mystery-required-deps"])).toBe(false);
    expect(
      app.hasMysteries(["mystery-optional-deps", "mystery-required-deps"])
    ).toBe(true);
  });

  it("should check if mystery is unlocked", () => {
    const app = checklistApp();
    app.unlockedMysteries = ["mystery-checkbox"];

    expect(app.isMysteryUnlocked("mystery-checkbox")).toBe(true);
    expect(app.isMysteryUnlocked("other-mystery")).toBe(false);
  });

  it("should get mystery title correctly", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.unlockedMysteries = ["mystery-checkbox"];

    // Unlocked mystery should show hint
    expect(app.getMysteryTitle("mystery-checkbox")).toBe("Mystery hint");

    // Locked mystery should show "???"
    app.unlockedMysteries = [];
    expect(app.getMysteryTitle("mystery-checkbox")).toBe("???");
  });

  it("should determine if mystery content should be shown", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.checkedItems = ["mystery-checkbox"];
    app.unlockedMysteries = ["mystery-checkbox"];

    // Should show content when checked and unlocked
    expect(app.shouldShowMysteryContent("mystery-checkbox")).toBe(true);

    // Should not show content when not checked
    app.checkedItems = [];
    expect(app.shouldShowMysteryContent("mystery-checkbox")).toBe(false);

    // Should not show content when not unlocked
    app.checkedItems = ["mystery-checkbox"];
    app.unlockedMysteries = [];
    expect(app.shouldShowMysteryContent("mystery-checkbox")).toBe(false);
  });

  it("should announce mystery unlock to screen reader", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.debouncedSaveState = vi.fn();
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["mystery-checkbox"];
    app.tryUnlockMystery("secret", checkboxIds);

    expect(app.announceToScreenReader).toHaveBeenCalledWith(
      "Mystery unlocked: Mystery Item. New item is now available to complete.",
      "assertive"
    );
  });

  it("should announce failed unlock attempt to screen reader", () => {
    const app = checklistApp();
    app.data = global.window.checklistData;
    app.announceToScreenReader = vi.fn();

    const checkboxIds = ["mystery-checkbox"];
    app.tryUnlockMystery("wrong", checkboxIds);

    expect(app.announceToScreenReader).toHaveBeenCalledWith(
      "No matching mystery found for that keyword.",
      "polite"
    );
  });
});
