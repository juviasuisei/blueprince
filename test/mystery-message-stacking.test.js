import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Alpine.js
global.Alpine = {
  data: vi.fn(),
  nextTick: vi.fn((callback) => callback()),
};

describe("Mystery Message Stacking", () => {
  let messageModel;

  beforeEach(() => {
    // Mock Date.now() to return a consistent timestamp for testing
    vi.spyOn(Date, "now").mockImplementation(() => 1625097600000); // July 1, 2021

    // Create the message model
    messageModel = {
      mysteryInput: "",
      lastUnlock: null,
      messages: [],
      nextMessageId: 1,

      addMessage(type, text) {
        const id = this.nextMessageId++;
        this.messages.push({
          id: id,
          type: type,
          text: text,
          timestamp: Date.now(),
        });

        // Set timeout to remove this specific message
        setTimeout(() => {
          this.messages = this.messages.filter((msg) => msg.id !== id);
        }, 5000);

        return id; // Return ID for testing
      },
    };
  });

  it("should add success message to the stack", () => {
    const messageId = messageModel.addMessage(
      "success",
      "Mystery unlocked: Test Mystery!"
    );

    expect(messageModel.messages.length).toBe(1);
    expect(messageModel.messages[0].id).toBe(messageId);
    expect(messageModel.messages[0].type).toBe("success");
    expect(messageModel.messages[0].text).toBe(
      "Mystery unlocked: Test Mystery!"
    );
  });

  it("should add error message to the stack", () => {
    const messageId = messageModel.addMessage(
      "error",
      "Not a valid unlock keyword. Keep exploring!"
    );

    expect(messageModel.messages.length).toBe(1);
    expect(messageModel.messages[0].id).toBe(messageId);
    expect(messageModel.messages[0].type).toBe("error");
    expect(messageModel.messages[0].text).toBe(
      "Not a valid unlock keyword. Keep exploring!"
    );
  });

  it("should stack multiple messages", () => {
    messageModel.addMessage("success", "First message");
    messageModel.addMessage("error", "Second message");
    messageModel.addMessage("success", "Third message");

    expect(messageModel.messages.length).toBe(3);
    expect(messageModel.messages[0].text).toBe("First message");
    expect(messageModel.messages[1].text).toBe("Second message");
    expect(messageModel.messages[2].text).toBe("Third message");
  });

  it("should assign unique IDs to messages", () => {
    const id1 = messageModel.addMessage("success", "First message");
    const id2 = messageModel.addMessage("error", "Second message");
    const id3 = messageModel.addMessage("success", "Third message");

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it("should remove messages after timeout", () => {
    vi.useFakeTimers();

    messageModel.addMessage("success", "Test message");
    expect(messageModel.messages.length).toBe(1);

    // Fast-forward time
    vi.advanceTimersByTime(5000);

    expect(messageModel.messages.length).toBe(0);

    vi.useRealTimers();
  });

  it("should remove specific message by ID", () => {
    // For this test, we need to modify the addMessage function to use different timeouts
    const originalAddMessage = messageModel.addMessage;

    // Override the addMessage function to create custom timeouts
    messageModel.addMessage = function (type, text, customTimeout = 5000) {
      const id = this.nextMessageId++;
      this.messages.push({
        id: id,
        type: type,
        text: text,
        timestamp: Date.now(),
      });

      // Set timeout to remove this specific message with custom timeout
      setTimeout(() => {
        this.messages = this.messages.filter((msg) => msg.id !== id);
      }, customTimeout);

      return id;
    };

    vi.useFakeTimers();

    // Add messages with different timeouts
    const id1 = messageModel.addMessage("success", "First message", 1000); // 1 second timeout
    const id2 = messageModel.addMessage("error", "Second message", 10000); // 10 second timeout
    const id3 = messageModel.addMessage("success", "Third message", 10000); // 10 second timeout

    expect(messageModel.messages.length).toBe(3);

    // Fast-forward time to remove only the first message
    vi.advanceTimersByTime(5000);

    expect(messageModel.messages.length).toBe(2);
    expect(messageModel.messages.find((msg) => msg.id === id1)).toBeUndefined();
    expect(messageModel.messages.find((msg) => msg.id === id2)).toBeDefined();
    expect(messageModel.messages.find((msg) => msg.id === id3)).toBeDefined();

    // Restore the original function
    messageModel.addMessage = originalAddMessage;

    vi.useRealTimers();
  });
});
