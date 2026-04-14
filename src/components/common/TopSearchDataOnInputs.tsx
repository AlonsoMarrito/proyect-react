import { useEffect, useState, type CSSProperties } from "react";
import { getPreferences } from "../scripts/preference/getPreference.js";

export type HistorySearchFilters = {
  id: string;
  tipoServicio: string;
  telefono: string;
  fecha: string;
  hora: string;
  unidad: string;
  tripulante: string;
};

export type SearchInputsTheme = {
  panelBg: string;
  inputBorder: string;
  labelColor: string;
  inputText: string;
};

type Props = {
  busqueda1: string;
  busqueda2: string;
  busqueda3: string;
  busqueda4: string;
  busqueda5: string;
  busqueda6: string;
  busqueda7: string;
  onFilterChange: (filters: HistorySearchFilters) => void;
  /** Evita carreras y reduce llamadas al filtrar por unidad */
  debounceMs?: number;
  theme?: SearchInputsTheme;
};

export default function TopSearchDataOnInputs({
  busqueda1,
  busqueda2,
  busqueda3,
  busqueda4,
  busqueda5,
  busqueda6,
  busqueda7,
  onFilterChange,
  debounceMs = 280,
  theme,
}: Props) {
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [search3, setSearch3] = useState("");
  const [search4, setSearch4] = useState("");
  const [search5, setSearch5] = useState("");
  const [search6, setSearch6] = useState("");
  const [search7, setSearch7] = useState("");

  const [styleColor, setStyleColor] = useState(0);

  const colorApss = [
    { primaryCardsBackground: "#fff" },
    { primaryCardsBackground: "#fff5f5" },
  ];

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);
    })();
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      onFilterChange({
        id: search1,
        tipoServicio: search2,
        telefono: search3,
        fecha: search4,
        hora: search5,
        unidad: search6,
        tripulante: search7,
      });
    }, debounceMs);
    return () => window.clearTimeout(t);
  }, [
    search1,
    search2,
    search3,
    search4,
    search5,
    search6,
    search7,
    onFilterChange,
    debounceMs,
  ]);

  const fields = [
    { label: busqueda1, value: search1, onChange: setSearch1 },
    { label: busqueda2, value: search2, onChange: setSearch2 },
    { label: busqueda3, value: search3, onChange: setSearch3 },
    { label: busqueda4, value: search4, onChange: setSearch4 },
    { label: busqueda5, value: search5, onChange: setSearch5 },
    { label: busqueda6, value: search6, onChange: setSearch6 },
    { label: busqueda7, value: search7, onChange: setSearch7 },
  ];

  const th = theme ?? {
    panelBg: colorApss[styleColor].primaryCardsBackground,
    inputBorder: "#cfd8dc",
    labelColor: "#546e7a",
    inputText: "#1a1d21",
  };

  return (
    <div
      style={{
        ...styles.container,
        background: th.panelBg,
      }}
    >
      {fields.map((f, i) => (
        <div key={i} style={styles.field}>
          <label style={{ ...styles.label, color: th.labelColor }}>{f.label}</label>
          <input
            placeholder={f.label}
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            style={{
              ...styles.input,
              borderColor: th.inputBorder,
              color: th.inputText,
              background: th.panelBg,
            }}
            autoComplete="off"
          />
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#444",
    letterSpacing: "0.02em",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "13px",
    color: "#1f1f1f",
  },
};