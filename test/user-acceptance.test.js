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

describe("User Acceptance Tests - Progressive Disclosure", () => {
  it("should prevent spoilers by hiding dependent content", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    // Set up spoiler-sensitive data structure
    app.data = {
      sections: [
        {
          id: "early-game",
          title: "Early Game",
          dependencies: [],
          checkboxes: ["tutorial", "first-boss"],
        },
        {
          id: "mid-game",
          title: "Mid Game (SPOILER SECTION)",
          dependencies: ["first-boss"], // Hidden until first boss is defeated
          checkboxes: ["secret-area", "plot-twist"],
        },
        {
          id: "end-game",
          title: "End Game (MAJOR SPOILERS)",
          dependencies: ["plot-twist"], // Hidden until plot twist is discovered
          checkboxes: ["final-boss", "true-ending"],
        },
      ],
      checkboxes: {
        tutorial: { title: "Complete Tutorial", dependencies: [] },
        "first-boss": {
          title: "Defeat First Boss",
          dependencies: ["tutorial"],
        },
        "secret-area": { title: "Find Secret Area", dependencies: [] },
        "plot-twist": {
          title: "Discover Plot Twist",
          dependencies: ["secret-area"],
        },
        "final-boss": { title: "Defeat Final Boss", dependencies: [] },
        "true-ending": {
          title: "Unlock True Ending",
          dependencies: ["final-boss"],
        },
      },
      information: {},
    };

    // User starts fresh - should only see early game content
    let visibleSections = app.getVisibleSections();
    expect(visibleSections).toHaveLength(1);
    expect(visibleSections[0].title).toBe("Early Game");
    expect(visibleSections[0].title).not.toContain("SPOILER");

    // Complete tutorial
    app.toggleCheckbox("tutorial");

    // First boss becomes available but mid-game still hidden
    let visibleCheckboxes = app.getVisibleCheckboxes([
      "tutorial",
      "first-boss",
    ]);
    expect(visibleCheckboxes).toContain("first-boss");

    visibleSections = app.getVisibleSections();
    expect(visibleSections).toHaveLength(1); // Still only early game

    // Defeat first boss
    app.toggleCheckbox("first-boss");

    // Now mid-game section becomes visible
    visibleSections = app.getVisibleSections();
    expect(visibleSections).toHaveLength(2);
    expect(visibleSections.map((s) => s.title)).toContain(
      "Mid Game (SPOILER SECTION)"
    );

    // But end-game is still hidden
    expect(visibleSections.map((s) => s.title)).not.toContain(
      "End Game (MAJOR SPOILERS)"
    );

    // Complete mid-game progression
    app.toggleCheckbox("secret-area");
    app.toggleCheckbox("plot-twist");

    // Now end-game becomes visible
    visibleSections = app.getVisibleSections();
    expect(visibleSections).toHaveLength(3);
    expect(visibleSections.map((s) => s.title)).toContain(
      "End Game (MAJOR SPOILERS)"
    );
  });

  it("should reveal content progressively without breaking immersion", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    // Set up realistic game progression
    app.data = {
      sections: [
        {
          id: "chapter-1",
          title: "Chapter 1: The Beginning",
          dependencies: [],
          checkboxes: ["meet-companion", "learn-magic"],
          information: ["chapter-1-intro"],
        },
      ],
      checkboxes: {
        "meet-companion": {
          title: "Meet Your Companion",
          hint: "Someone important joins you",
          description:
            "You meet Alex, who becomes your trusted companion throughout the journey.",
          dependencies: [],
        },
        "learn-magic": {
          title: "Learn Basic Magic",
          hint: "Discover your magical abilities",
          description: "You learn to cast Fire Bolt and Healing Light spells.",
          dependencies: ["meet-companion"],
        },
      },
      information: {
        "chapter-1-intro": {
          title: "Chapter Overview",
          description:
            "This chapter introduces the basic mechanics and story elements.",
          dependencies: [],
        },
      },
    };

    // Initially, user sees chapter intro and first checkpoint
    let visibleInfo = app.getVisibleInformation(["chapter-1-intro"]);
    expect(visibleInfo).toContain("chapter-1-intro");

    let visibleCheckboxes = app.getVisibleCheckboxes([
      "meet-companion",
      "learn-magic",
    ]);
    expect(visibleCheckboxes).toContain("meet-companion");
    expect(visibleCheckboxes).not.toContain("learn-magic"); // Hidden due to dependency

    // User completes first objective
    app.toggleCheckbox("meet-companion");

    // Second objective becomes available
    visibleCheckboxes = app.getVisibleCheckboxes([
      "meet-companion",
      "learn-magic",
    ]);
    expect(visibleCheckboxes).toContain("learn-magic");

    // Verify content is revealed appropriately
    expect(app.shouldShowMysteryContent("meet-companion")).toBe(true); // Checked, shows full content
  });
});

describe("User Acceptance Tests - Mystery Discovery", () => {
  it("should allow mystery discovery through keyword entry", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();
    app.announceToScreenReader = vi.fn();

    app.data = {
      sections: [
        {
          id: "secrets",
          title: "Hidden Secrets",
          checkboxes: ["hidden-treasure", "ancient-rune"],
        },
      ],
      checkboxes: {
        "hidden-treasure": {
          title: "Hidden Treasure Chest",
          hint: "A mysterious treasure",
          unlockKeyword: "treasure",
          dependencies: [],
        },
        "ancient-rune": {
          title: "Ancient Rune Stone",
          hint: "An old magical inscription",
          unlockKeyword: "rune",
          dependencies: [],
        },
      },
      information: {},
    };

    // Initially, mysteries show as "???"
    expect(app.getMysteryTitle("hidden-treasure")).toBe("???");
    expect(app.getMysteryTitle("ancient-rune")).toBe("???");

    // User discovers first mystery through exploration/keyword
    const result1 = app.tryUnlockMystery("treasure", [
      "hidden-treasure",
      "ancient-rune",
    ]);
    expect(result1).toBeTruthy();
    expect(result1.checkboxId).toBe("hidden-treasure");

    // Mystery is now revealed but not completed
    expect(app.getMysteryTitle("hidden-treasure")).toBe(
      "A mysterious treasure"
    );
    expect(app.isMysteryUnlocked("hidden-treasure")).toBe(true);
    expect(app.checkedItems).not.toContain("hidden-treasure");

    // User can now complete the revealed mystery
    app.toggleCheckbox("hidden-treasure");
    expect(app.checkedItems).toContain("hidden-treasure");
    expect(app.shouldShowMysteryContent("hidden-treasure")).toBe(true);

    // Second mystery remains hidden until discovered
    expect(app.getMysteryTitle("ancient-rune")).toBe("???");
  });

  it("should allow mystery discovery through direct clicking", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    app.data = {
      sections: [
        {
          id: "mysteries",
          checkboxes: ["clickable-mystery"],
        },
      ],
      checkboxes: {
        "clickable-mystery": {
          title: "Clickable Mystery",
          hint: "Click to discover",
          unlockKeyword: "click",
          dependencies: [],
        },
      },
      information: {},
    };

    // Initially shows as "???"
    expect(app.getMysteryTitle("clickable-mystery")).toBe("???");
    expect(app.isMysteryUnlocked("clickable-mystery")).toBe(false);
    expect(app.checkedItems).not.toContain("clickable-mystery");

    // User clicks the mystery directly
    app.toggleCheckbox("clickable-mystery");

    // Mystery is both unlocked and checked in one action
    expect(app.isMysteryUnlocked("clickable-mystery")).toBe(true);
    expect(app.checkedItems).toContain("clickable-mystery");
    expect(app.shouldShowMysteryContent("clickable-mystery")).toBe(true);
  });

  it("should handle mystery input display correctly", async () => {
    const app = checklistApp();
    app.data = {
      sections: [
        {
          id: "test-section",
          checkboxes: [
            "normal-checkbox",
            "mystery-checkbox",
            "unlocked-mystery",
          ],
        },
      ],
      checkboxes: {
        "normal-checkbox": { title: "Normal Item", dependencies: [] },
        "mystery-checkbox": {
          title: "Mystery Item",
          unlockKeyword: "secret",
          dependencies: [],
        },
        "unlocked-mystery": {
          title: "Unlocked Mystery",
          unlockKeyword: "unlocked",
          dependencies: [],
        },
      },
      information: {},
    };

    app.unlockedMysteries = ["unlocked-mystery"]; // Pre-unlock one mystery

    const checkboxIds = [
      "normal-checkbox",
      "mystery-checkbox",
      "unlocked-mystery",
    ];

    // Should show mystery input because there's an unrevealed mystery
    expect(app.hasMysteries(checkboxIds)).toBe(true);

    // Unlock the remaining mystery
    app.unlockedMysteries.push("mystery-checkbox");

    // Should not show mystery input anymore (all mysteries revealed)
    expect(app.hasMysteries(checkboxIds)).toBe(false);
  });
});

describe("User Acceptance Tests - Progress Tracking", () => {
  it("should accurately track progress at all levels", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    // Set up multi-level structure
    app.data = {
      sections: [
        {
          id: "main-story",
          title: "Main Story",
          dependencies: [],
          subsections: [
            {
              id: "act-1",
              title: "Act 1",
              dependencies: [],
              checkboxes: ["intro", "first-quest"],
            },
            {
              id: "act-2",
              title: "Act 2",
              dependencies: ["first-quest"],
              checkboxes: ["mid-quest", "boss-fight"],
            },
          ],
        },
        {
          id: "side-quests",
          title: "Side Quests",
          dependencies: [],
          checkboxes: ["side-quest-1", "side-quest-2"],
        },
      ],
      checkboxes: {
        intro: { title: "Introduction", dependencies: [] },
        "first-quest": { title: "First Quest", dependencies: ["intro"] },
        "mid-quest": { title: "Mid Quest", dependencies: [] },
        "boss-fight": { title: "Boss Fight", dependencies: ["mid-quest"] },
        "side-quest-1": { title: "Side Quest 1", dependencies: [] },
        "side-quest-2": {
          title: "Side Quest 2",
          dependencies: ["side-quest-1"],
        },
      },
      information: {},
    };

    // Initial state - no progress
    expect(app.getTotalCheckboxes()).toBe(6);
    expect(app.getTotalChecked()).toBe(0);

    // Section progress - main story (4 checkboxes total)
    expect(app.getSectionTotalCount("main-story")).toBe(4);
    expect(app.getSectionCheckedCount("main-story")).toBe(0);

    // Subsection progress - act 1 (2 checkboxes)
    expect(app.getSubsectionTotalCount("act-1")).toBe(2);
    expect(app.getSubsectionCheckedCount("act-1")).toBe(0);

    // Complete some items
    app.toggleCheckbox("intro");
    app.toggleCheckbox("side-quest-1");

    // Verify progress updates
    expect(app.getTotalChecked()).toBe(2);
    expect(app.getSectionCheckedCount("main-story")).toBe(1);
    expect(app.getSectionCheckedCount("side-quests")).toBe(1);
    expect(app.getSubsectionCheckedCount("act-1")).toBe(1);

    // Complete more items
    app.toggleCheckbox("first-quest");
    app.toggleCheckbox("mid-quest");

    // Verify cascading progress
    expect(app.getTotalChecked()).toBe(4);
    expect(app.getSectionCheckedCount("main-story")).toBe(3);
    expect(app.getSubsectionCheckedCount("act-1")).toBe(2); // Both act-1 items done
    expect(app.getSubsectionCheckedCount("act-2")).toBe(1); // One act-2 item done

    // Calculate percentages
    const overallProgress = Math.round(
      (app.getTotalChecked() / app.getTotalCheckboxes()) * 100
    );
    expect(overallProgress).toBe(67); // 4/6 = 66.67% rounded to 67%

    const act1Progress = Math.round(
      (app.getSubsectionCheckedCount("act-1") /
        app.getSubsectionTotalCount("act-1")) *
        100
    );
    expect(act1Progress).toBe(100); // 2/2 = 100%
  });

  it("should handle empty sections correctly in progress calculation", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    app.data = {
      sections: [
        {
          id: "empty-section",
          title: "Empty Section",
          dependencies: [],
          checkboxes: [],
        },
        {
          id: "normal-section",
          title: "Normal Section",
          dependencies: [],
          checkboxes: ["item-1"],
        },
      ],
      checkboxes: {
        "item-1": { title: "Item 1", dependencies: [] },
      },
      information: {},
    };

    // Empty section should show 0 total, 0 checked
    expect(app.getSectionTotalCount("empty-section")).toBe(0);
    expect(app.getSectionCheckedCount("empty-section")).toBe(0);

    // In UI, this would be displayed as 100% progress with hidden percentage
    const emptyProgress =
      app.getSectionTotalCount("empty-section") === 0
        ? 100
        : Math.round(
            (app.getSectionCheckedCount("empty-section") /
              app.getSectionTotalCount("empty-section")) *
              100
          );
    expect(emptyProgress).toBe(100);

    // Normal section should work as expected
    expect(app.getSectionTotalCount("normal-section")).toBe(1);
    expect(app.getSectionCheckedCount("normal-section")).toBe(0);

    app.toggleCheckbox("item-1");
    expect(app.getSectionCheckedCount("normal-section")).toBe(1);
  });
});

describe("User Acceptance Tests - Responsive Design Simulation", () => {
  it("should handle different screen size scenarios", async () => {
    const app = checklistApp();

    // Mock different viewport scenarios
    const mockViewports = [
      { width: 320, height: 568, name: "Mobile Portrait" },
      { width: 768, height: 1024, name: "Tablet Portrait" },
      { width: 1920, height: 1080, name: "Desktop" },
    ];

    // Simulate responsive behavior by testing data structure flexibility
    await app.loadData();

    mockViewports.forEach((viewport) => {
      // Test that data structure supports responsive display
      const sections = app.getVisibleSections();
      expect(sections).toBeDefined();
      expect(Array.isArray(sections)).toBe(true);

      // Test that progress calculations work regardless of viewport
      const totalCheckboxes = app.getTotalCheckboxes();
      expect(typeof totalCheckboxes).toBe("number");
      expect(totalCheckboxes).toBeGreaterThanOrEqual(0);

      // Test that mystery system works on all screen sizes
      const hasMysteries = app.hasMysteries(["mystery-checkbox"]);
      expect(typeof hasMysteries).toBe("boolean");
    });
  });

  it("should support touch interactions through API design", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();

    await app.loadData();

    // Test that all interactive functions work with single calls (touch-friendly)

    // Toggle checkbox (single tap)
    const initialChecked = app.checkedItems.length;
    app.toggleCheckbox("test-checkbox-1");
    expect(app.checkedItems.length).toBe(initialChecked + 1);

    // Toggle section (single tap)
    const initialExpanded = app.expandedSections.length;
    app.toggleSection("test-section");
    expect(app.expandedSections.length).toBe(initialExpanded + 1);

    // Mystery unlock (single input + button press)
    const mysteryResult = app.tryUnlockMystery("secret", ["mystery-checkbox"]);
    expect(mysteryResult).toBeTruthy();

    // All functions should work without requiring hover states or complex gestures
  });
});

describe("User Acceptance Tests - Accessibility Validation", () => {
  it("should provide screen reader announcements for key actions", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();
    app.announceToScreenReader = vi.fn();

    await app.loadData();

    // Test checkbox toggle with announcement
    app.toggleCheckboxWithAnnouncement("test-checkbox-1");
    expect(app.announceToScreenReader).toHaveBeenCalledWith(
      "Test Checkbox 1 completed"
    );

    // Test mystery unlock announcement
    app.tryUnlockMystery("secret", ["mystery-checkbox"]);
    expect(app.announceToScreenReader).toHaveBeenCalledWith(
      expect.stringContaining("Mystery unlocked"),
      "assertive"
    );

    // Test failed mystery attempt announcement
    app.tryUnlockMystery("wrong", ["mystery-checkbox"]);
    expect(app.announceToScreenReader).toHaveBeenCalledWith(
      "No matching mystery found for that keyword.",
      "polite"
    );
  });

  it("should support keyboard navigation patterns", async () => {
    const app = checklistApp();
    app.debouncedSaveState = vi.fn();
    app.$nextTick = vi.fn((cb) => cb());
    app.initializeSwipers = vi.fn();
    app.observeImages = vi.fn();
    app.announceToScreenReader = vi.fn();

    await app.loadData();

    // Test keyboard event handlers
    const mockKeyboardEvent = (key, target = "section") => ({
      key,
      preventDefault: vi.fn(),
      target: { getAttribute: vi.fn(() => target) },
    });

    // Test section keyboard navigation
    const enterEvent = mockKeyboardEvent("Enter");
    app.handleSectionKeydown(enterEvent, "test-section");
    expect(enterEvent.preventDefault).toHaveBeenCalled();
    expect(app.expandedSections).toContain("test-section");

    // Test space key for section
    const spaceEvent = mockKeyboardEvent(" ");
    app.handleSectionKeydown(spaceEvent, "test-section");
    expect(spaceEvent.preventDefault).toHaveBeenCalled();
    expect(app.expandedSections).not.toContain("test-section"); // Toggled back

    // Test checkbox keyboard navigation
    const checkboxEnterEvent = mockKeyboardEvent("Enter");
    app.handleCheckboxKeydown(checkboxEnterEvent, "test-checkbox-1");
    expect(checkboxEnterEvent.preventDefault).toHaveBeenCalled();
    expect(app.checkedItems).toContain("test-checkbox-1");
  });

  it("should handle global keyboard shortcuts", async () => {
    const app = checklistApp();
    app.showResetConfirm = true;
    app.showCompleteAllConfirm = false;

    // Test escape key handling
    const escapeEvent = {
      key: "Escape",
      preventDefault: vi.fn(),
    };

    app.handleGlobalKeydown(escapeEvent);
    expect(app.showResetConfirm).toBe(false);
    expect(escapeEvent.preventDefault).toHaveBeenCalled();

    // Test escape with complete all modal
    app.showCompleteAllConfirm = true;
    app.handleGlobalKeydown(escapeEvent);
    expect(app.showCompleteAllConfirm).toBe(false);
  });
});
