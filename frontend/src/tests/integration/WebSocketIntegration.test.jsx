import { act, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

const onMock = vi.fn();

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: onMock,
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

import KanbanBoard from "../../components/KanbanBoard";

test("WebSocket receives task update", async () => {
  render(<KanbanBoard />);
  expect(screen.getByText("Kanban Board")).toBeInTheDocument();

  const syncCall = onMock.mock.calls.find((call) => call[0] === "sync:tasks");
  expect(syncCall).toBeDefined();
  const syncHandler = syncCall[1];

  await act(async () => {
    syncHandler([
      {
        id: "test-1",
        title: "Task from socket",
        description: "Socket sync test",
        priority: "Low",
        category: "Bug",
        column: "todo",
        attachment: null,
      },
    ]);
  });

  await waitFor(() => {
    expect(screen.getByText("Task from socket")).toBeInTheDocument();
  });
});
