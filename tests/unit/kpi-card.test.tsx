import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { KpiCard } from "@/components/patterns/kpi-card";
import type { Kpi } from "@/lib/types";

const kpi: Kpi = {
  id: "mrr",
  label: "Monthly Recurring Revenue",
  value: 486_000,
  unit: "currency",
  deltaPct: 18,
  trend: [360, 372, 388, 401, 420, 447, 468, 486],
  domain: "finance",
  goodDirection: "up",
};

describe("KpiCard", () => {
  it("renders the label, value and delta", () => {
    render(<KpiCard kpi={kpi} />);
    expect(screen.getByText("Monthly Recurring Revenue")).toBeInTheDocument();
    expect(screen.getByText(/\$486(\.0)?K/i)).toBeInTheDocument();
    expect(screen.getByText("+18%")).toBeInTheDocument();
  });

  it("exposes the sparkline as an accessible image", () => {
    render(<KpiCard kpi={kpi} />);
    expect(screen.getByRole("img", { name: /trend/i })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<KpiCard kpi={kpi} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
