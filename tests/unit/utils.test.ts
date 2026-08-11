import { clamp, formatCurrency, formatDelta, formatPercent, seededRandom } from "@/lib/utils";

describe("utils", () => {
  it("formats compact currency for large values", () => {
    expect(formatCurrency(486_000)).toMatch(/\$486(\.0)?K/i);
    expect(formatCurrency(500)).toBe("$500");
  });

  it("formats signed deltas", () => {
    expect(formatDelta(18)).toBe("+18%");
    expect(formatDelta(-5)).toBe("-5%");
    expect(formatDelta(0)).toBe("0%");
  });

  it("formats percentages", () => {
    expect(formatPercent(0.5)).toBe("50%");
    expect(formatPercent(0.1234, 1)).toBe("12.3%");
  });

  it("clamps values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it("produces deterministic seeded randomness", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect(a()).toBeCloseTo(b());
  });
});
