import { useEffect, useState } from "react";
import { getPreferences } from "../scripts/preference/getPreference.js";

type Props = {
  busqueda1: string;
  busqueda2: string;
  busqueda3: string;
  busqueda4: string;
  busqueda5: string;
  busqueda6: string;
  busqueda7: string;
  onFilterChange: (filters: {
    id: string;
    tipoServicio: string;
    unidad: string;
  }) => void;
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
    onFilterChange({
      id: search1,
      tipoServicio: search2,
      unidad: search6,
    });
  }, [search1, search2, search6]);

  return (
    <div
      style={{
        ...styles.container,
        background: colorApss[styleColor].primaryCardsBackground,
      }}
    >
      <input placeholder={busqueda1} value={search1} onChange={(e) => setSearch1(e.target.value)} style={styles.input} />
      <input placeholder={busqueda2} value={search2} onChange={(e) => setSearch2(e.target.value)} style={styles.input} />
      <input placeholder={busqueda3} value={search3} onChange={(e) => setSearch3(e.target.value)} style={styles.input} />
      <input placeholder={busqueda4} value={search4} onChange={(e) => setSearch4(e.target.value)} style={styles.input} />
      <input placeholder={busqueda5} value={search5} onChange={(e) => setSearch5(e.target.value)} style={styles.input} />
      <input placeholder={busqueda6} value={search6} onChange={(e) => setSearch6(e.target.value)} style={styles.input} />
      <input placeholder={busqueda7} value={search7} onChange={(e) => setSearch7(e.target.value)} style={styles.input} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "15vw",
    maxWidth: "150px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  input: {
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "12px",
  },
};