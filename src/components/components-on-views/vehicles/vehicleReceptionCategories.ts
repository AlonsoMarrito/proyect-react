/** Mismas claves que `vehicle-logs-{category}` en backend (Vue `receptionLogsVehicle.vue`). */
export const RECEPTION_CATEGORY_KEYS = [
  "light",
  "bodywork",
  "tools",
  "liquids",
  "tires",
  "engine",
] as const;

export type ReceptionCategoryKey = (typeof RECEPTION_CATEGORY_KEYS)[number];

/** Etiquetas en UI (grid de bitácora de recepción). */
export const RECEPTION_SECTION_LABELS: Record<ReceptionCategoryKey, string> = {
  light: "Luces",
  bodywork: "Carrocería",
  tools: "Herramientas",
  liquids: "Niveles y Tapones",
  tires: "Neumáticos",
  engine: "Motor",
};

/** Botones en información general (orden como en Vue `generalInfoVehicle.vue`). */
export const GENERAL_INSPECTION_BUTTONS: {
  label: string;
  category: ReceptionCategoryKey;
}[] = [
  { label: "Luces", category: "light" },
  { label: "Carrocería", category: "bodywork" },
  { label: "Tapones fluidos", category: "liquids" },
  { label: "Estado de llantas", category: "tires" },
  { label: "Arranque de motor", category: "engine" },
  { label: "Herramientas y equipos", category: "tools" },
];
