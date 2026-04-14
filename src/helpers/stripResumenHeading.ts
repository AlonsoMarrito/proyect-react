/** Quita una primera línea "Resumen" / "Resumen:" para no duplicar título en UI/PDF. */
export function stripResumenHeading(raw: unknown): string {
  const t = String(raw ?? "")
    .replace(/\r\n/g, "\n")
    .trim();
  if (!t) return "";
  const lines = t.split("\n");
  const first = lines[0]?.trim().toLowerCase();
  if (first === "resumen" || first === "resumen:") {
    return lines.slice(1).join("\n").trim();
  }
  return t;
}
