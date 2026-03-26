import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageToggle } from "@/components/app/language-toggle";
import { renderWithUser } from "../helpers/render";

const refresh = vi.fn();
const fetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh
  })
}));

describe("LanguageToggle", () => {
  beforeEach(() => {
    refresh.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("posts the selected locale and refreshes the page", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ locale: "bg" }), { status: 200 }));
    const { user } = renderWithUser(<LanguageToggle />, { locale: "en" });

    await user.click(screen.getByTestId("language-toggle-bg"));

    expect(fetchMock).toHaveBeenCalledWith("/api/locale", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ locale: "bg" })
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("does not post when the active locale is clicked again", async () => {
    const { user } = renderWithUser(<LanguageToggle />, { locale: "bg" });

    await user.click(screen.getByTestId("language-toggle-bg"));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
});
