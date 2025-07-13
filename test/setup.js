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
      id: "test-section",
      title: "Test Section",
      color: "blue",
      dependencies: [],
      checkboxes: ["test-checkbox-1", "test-checkbox-2"],
      information: ["test-info-1"],
    },
  ],
  checkboxes: {
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

  // Mock performance API
  global.performance = {
    mark: vi.fn(),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
    },
    getEntriesByType: vi.fn(() => []),
  };

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));

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
