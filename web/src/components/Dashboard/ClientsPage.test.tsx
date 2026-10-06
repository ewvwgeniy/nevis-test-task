import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, vi } from "vitest";
import { fixture } from "../../test/fixture";
import { ClientsPage } from "./ClientsPage";

const ok = () => Promise.resolve({ ok: true, json: () => Promise.resolve(fixture) } as Response);
const fail = () => Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) } as Response);

afterEach(() => vi.unstubAllGlobals());

describe("ClientsPage", () => {
  it("shows a loading state, then the dashboard", async () => {
    vi.stubGlobal("fetch", vi.fn(ok));
    render(<ClientsPage />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading clients");

    expect(await screen.findByRole("treegrid")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows an error and recovers on retry", async () => {
    const fetchMock = vi.fn().mockImplementationOnce(fail).mockImplementation(ok);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<ClientsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("couldn’t load");
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("treegrid")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("restacks the chart as rows are expanded", async () => {
    vi.stubGlobal("fetch", vi.fn(ok));
    const user = userEvent.setup();
    render(<ClientsPage />);
    await screen.findByRole("treegrid");
    const legendItems = () => screen.getAllByRole("listitem").map((li) => li.textContent);

    expect(legendItems()).toEqual(["Branch 1", "Branch 2", "Branch 3"]);
    await user.click(screen.getByRole("row", { name: /^Branch 1/ }));
    expect(legendItems()).toContain("Anna Blackwood");
    await user.click(screen.getByRole("row", { name: /^Anna Blackwood/ }));
    expect(legendItems()).toEqual(["Existing clients", "New organic", "New paid"]);
    await user.click(screen.getByRole("row", { name: /^Anna Blackwood/ }));
    expect(legendItems()).toContain("James Walker");
  });
});
