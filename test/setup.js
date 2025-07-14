// Test setup file
import { afterEach, beforeEach } from "vitest";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.checklistData
const mockData = {
  sections: [
    {
      id: "getting-started",
      title: "Getting Started",
      color: "blue",
      dependencies: [],
      checkboxes: ["setup", "first-step", "second-step"],
      information: ["test-info-1"],
      subsections: [
        {
          id: "basics",
          title: "The Basics",
          dependencies: [],
          checkboxes: ["basic-step-1", "basic-step-2"],
        },
        {
          id: "advanced-basics",
          title: "Advanced Basics",
          dependencies: ["setup"],
          checkboxes: ["advanced-step-1"],
        },
      ],
    },
    {
      id: "test-section",
      title: "Test Section",
      color: "blue",
      dependencies: ["setup"], // Add dependency so it's not visible by default
      checkboxes: ["test-checkbox-1", "test-checkbox-2"],
      information: ["test-info-1"],
    },
  ],
  checkboxes: {
    setup: {
      title: "Setup",
      hint: "Setup hint",
      description: "Setup description",
      dependencies: [],
    },
    "first-step": {
      title: "First Step",
      hint: "First step hint",
      description: "First step description",
      dependencies: [],
    },
    "second-step": {
      title: "Second Step",
      hint: "Second step hint",
      description: "Second step description",
      dependencies: ["first-step"],
    },
    "basic-step-1": {
      title: "Basic Step 1",
      hint: "Basic step 1 hint",
      description: "Basic step 1 description",
      dependencies: [],
    },
    "basic-step-2": {
      title: "Basic Step 2",
      hint: "Basic step 2 hint",
      description: "Basic step 2 description",
      dependencies: [],
    },
    "advanced-step-1": {
      title: "Advanced Step 1",
      hint: "Advanced step 1 hint",
      description: "Advanced step 1 description",
      dependencies: [],
    },
    "test-checkbox-1": {
      title: "Test Checkbox 1",
      hint: "Test hint 1",
      description: "Test description 1",
      dependencies: [],
    },
    "test-checkbox-2": {
      title: "Test Checkbox 2",
      hint: "Test hint 2",
      description: "Test description 2",
      dependencies: ["test-checkbox-1"],
    },
    "mystery-checkbox": {
      title: "Mystery Item",
      hint: "Mystery hint",
      description: "Mystery description",
      dependencies: [],
      unlockKeyword: "secret",
    },
  },
  information: {
    "test-info-1": {
      title: "Test Info",
      description: "Test information description",
      dependencies: [],
    },
  },
};

beforeEach(() => {
  // Reset localStorage mock
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();

  // Setup global mocks
  global.localStorage = localStorageMock;
  global.window = global.window || {};
  global.window.checklistData = mockData;
  global.window.sectionsData = mockData.sections;
  global.window.checkboxesData = mockData.checkboxes;
  global.window.informationData = mockData.information;

  // Mock DOM document with comprehensive API
  global.document = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getElementById: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    querySelector: vi.fn(),
    createElement: vi.fn(() => ({
      id: "",
      className: "",
      style: {},
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  };

  // Mock performance API
  global.performance = {
    mark: vi.fn(),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
    },
    getEntriesByType: vi.fn(() => []),
  };

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

  // Mock MutationObserver
  global.MutationObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    callback,
  }));

  // Mock requestAnimationFrame and related timing functions
  global.requestAnimationFrame = vi.fn((cb) => {
    const id = Math.random();
    process.nextTick(cb);
    return id;
  });
  global.setTimeout = vi.fn((cb, delay) => {
    const id = Math.random();
    process.nextTick(cb);
    return id;
  });
  global.clearTimeout = vi.fn();
  global.setInterval = vi.fn((cb, delay) => {
    const id = Math.random();
    return id;
  });
  global.clearInterval = vi.fn();

  // Mock navigator
  global.navigator = {
    userAgent: "test-user-agent",
  };

  // Mock location
  global.location = {
    href: "http://localhost:3000",
  };

  // Mock console methods to avoid noise in tests
  global.console.warn = vi.fn();
  global.console.error = vi.fn();
  global.console.log = vi.fn();
});

afterEach(() => {
  // Clean up any timers
  vi.clearAllTimers();
  vi.restoreAllMocks();
});
