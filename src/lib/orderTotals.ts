import type { OrderLine } from "./types";

/** Total recalculé depuis les lignes (évite les écarts après hébergement ou édition manuelle) */
export function computeLinesTotal(lines: OrderLine[]): number {
  return lines.reduce(
    (sum, line) => sum + (line.unitPrice || 0) * (line.quantity || 0),
    0
  );
}
