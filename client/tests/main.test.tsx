import { render, screen } from "@testing-library/react";

vi.mock("react-dom/client", () => {
  const mockRoot = { render: vi.fn((element) => render(element)) };
  return { createRoot: vi.fn(() => mockRoot) };
});
vi.mock("../src/App", () => ({
  default: () => <div>Mocked App</div>,
}));

describe("main.tsx", () => {
  it("renders App content into the DOM", async () => {
    const mockElement = document.createElement("div");
    mockElement.id = "root";
    document.body.appendChild(mockElement);
    vi.spyOn(document, "getElementById").mockReturnValue(mockElement);

    await import("../src/main.tsx");

    expect(screen.getByText("Mocked App")).toBeInTheDocument();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });
});
