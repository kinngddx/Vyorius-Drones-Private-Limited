import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

const onMock = vi.fn((event, callback) => {
  if (event === "sync:tasks") {
    callback([]);
  }
});

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: onMock,
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

import KanbanBoard from "../../components/KanbanBoard.jsx";

test("creates a new task from the form", async () => {
  render(<KanbanBoard />);

  await waitFor(() => {
    expect(screen.queryByText(/Loading tasks from server/i)).not.toBeInTheDocument();
  });

  await act(async () => {
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "Test task" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "A sample task for testing." } });
    fireEvent.change(screen.getByLabelText(/Priority/i), { target: { value: "High" } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: "Bug" } });
    fireEvent.click(screen.getByRole("button", { name: /create task/i }));
  });

  expect(await screen.findByText("Test task")).toBeInTheDocument();
  expect(screen.getByText(/A sample task for testing/i)).toBeInTheDocument();
});
