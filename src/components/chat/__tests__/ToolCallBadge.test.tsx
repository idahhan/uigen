import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getLabel } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// getLabel tests

test("getLabel: str_replace_editor create", () => {
  const tool = { state: "call", toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "src/components/Button.tsx" } } as ToolInvocation;
  expect(getLabel(tool)).toBe("Creating Button.tsx");
});

test("getLabel: str_replace_editor str_replace", () => {
  const tool = { state: "call", toolCallId: "1", toolName: "str_replace_editor", args: { command: "str_replace", path: "src/App.tsx" } } as ToolInvocation;
  expect(getLabel(tool)).toBe("Editing App.tsx");
});

test("getLabel: str_replace_editor insert", () => {
  const tool = { state: "call", toolCallId: "1", toolName: "str_replace_editor", args: { command: "insert", path: "src/App.tsx" } } as ToolInvocation;
  expect(getLabel(tool)).toBe("Editing App.tsx");
});

test("getLabel: str_replace_editor view", () => {
  const tool = { state: "call", toolCallId: "1", toolName: "str_replace_editor", args: { command: "view", path: "src/index.tsx" } } as ToolInvocation;
  expect(getLabel(tool)).toBe("Reading index.tsx");
});

test("getLabel: str_replace_editor undo_edit", () => {
  const tool = { state: "call", toolCallId: "1", toolName: "str_replace_editor", args: { command: "undo_edit", path: "src/App.tsx" } } as ToolInvocation;
  expect(getLabel(tool)).toBe("Undoing changes to App.tsx");
});

test("getLabel: file_manager rename", () => {
  const tool = { state: "call", toolCallId: "1", toolName: "file_manager", args: { command: "rename", path: "src/Old.tsx", new_path: "src/New.tsx" } } as ToolInvocation;
  expect(getLabel(tool)).toBe("Renaming Old.tsx to New.tsx");
});

test("getLabel: file_manager delete", () => {
  const tool = { state: "call", toolCallId: "1", toolName: "file_manager", args: { command: "delete", path: "src/Unused.tsx" } } as ToolInvocation;
  expect(getLabel(tool)).toBe("Deleting Unused.tsx");
});

test("getLabel: unknown tool falls back to toolName", () => {
  const tool = { state: "call", toolCallId: "1", toolName: "unknown_tool", args: {} } as ToolInvocation;
  expect(getLabel(tool)).toBe("unknown_tool");
});

// ToolCallBadge rendering tests

test("ToolCallBadge shows label and spinner when pending", () => {
  const tool: ToolInvocation = { state: "call", toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "App.jsx" } };
  render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolCallBadge shows label and green dot when done", () => {
  const tool: ToolInvocation = { state: "result", toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "App.jsx" }, result: "ok" };
  const { container } = render(<ToolCallBadge toolInvocation={tool} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
});

test("ToolCallBadge shows spinner when result is null", () => {
  const tool: ToolInvocation = { state: "result", toolCallId: "1", toolName: "str_replace_editor", args: { command: "str_replace", path: "App.jsx" }, result: null };
  const { container } = render(<ToolCallBadge toolInvocation={tool} />);
  expect(container.querySelector(".animate-spin")).toBeTruthy();
});
