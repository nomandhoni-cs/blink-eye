import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Header } from "./header";

describe("<Header />", () => {
  render(<Header />);

  test("Should have title", () => {
    expect(screen.getByText(/blink eye/i)).toBeDefined();
  });
});
