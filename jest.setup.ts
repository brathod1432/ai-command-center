import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

// Browser-only stubs. Guarded so node-environment tests (e.g. session) skip them.
if (typeof window !== "undefined") {
  // jsdom does not implement matchMedia; stub it for components that use it.
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // jsdom does not implement ResizeObserver; Recharts/Radix need it.
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (global as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;
}
