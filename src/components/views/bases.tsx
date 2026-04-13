import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getPreferences } from "../scripts/preference/getPreference";
import { getAllBases } from "../scripts/bases/getBases";

import TopSearchDataOnComponents from "../common/TopSearchDataOnComponents";
import ModalAddNewBase from "../components-on-views/bases/ModalAddNewBase";

type Base = {
  name: string;
  status: string;
  type_hub: string;
};

export default function Bases() {
  const [statusModal, setStatusModal] = useState(false);
  const [allBases, setAllBases] = useState<Base[]>([]);
  const [styleColor, setStyleColor] = useState(0);
  const [search, setSearch] = useState("");

  const colorApss = [
    {
      primary: "#FF6B6B",
      secondary: "#FFFFFF",
      textColorPrimary: "#2c2c2c",
      bgNormal: "#ffffff",
    },
    {
      primary: "#D32F2F",
      secondary: "#FFFFFF",
      textColorPrimary: "#D32F2F",
      bgNormal: "#fff5f5",
    },
  ];

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);

      const bases = await getAllBases();
      setAllBases(bases || []);
    })();
  }, []);

  const filteredBases = useMemo(() => {
    return allBases.filter((b) => {
      const matchType = b.type_hub === "base";
      const matchSearch = b.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchType && matchSearch;
    });
  }, [allBases, search]);

  return (
    <div style={styles.container}>

      {/* ===================== TOP / FILTROS ===================== */}
      <section style={styles.topSection}>
        <TopSearchDataOnComponents
          buttonText="Agregar Base"
          inputText="Buscar Base"
          onOpen={() => setStatusModal(true)}
          onSearchChange={(value) => setSearch(value)}
        />
      </section>

      {/* ===================== GRID / CARDS ===================== */}
      <section style={styles.gridSection}>
        <div style={styles.grid}>
          {filteredBases.map((value, index) => (
            <Link
              key={index}
              to={`/base-information/${value.name}`}
              style={{
                ...styles.card,
                background: colorApss[styleColor].bgNormal,
                color: colorApss[styleColor].textColorPrimary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-5px) scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 12px 25px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 5px 15px rgba(0,0,0,0.08)";
              }}
            >
              <img
                src="https://res.cloudinary.com/dytw0yx6j/image/upload/v1770251383/base_qazbky.png"
                style={styles.image}
              />

              <p style={styles.text}>
                Base: {value.name.toUpperCase()}
              </p>

              <p style={styles.text}>
                Estatus: {value.status}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ===================== MODAL ===================== */}
      {statusModal && (
        <ModalAddNewBase onClose={() => setStatusModal(false)} />
      )}
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles: Record<string, React.CSSProperties> = {

  container: {
    height: "75vh",
    display: "flex",
    flexDirection: "column",
    background: "#f7f7f7",
  },

  /* TOP */
  topSection: {
    flexShrink: 0,
    padding: "10px 0",
  },

  /* GRID WRAPPER */
  gridSection: {
    flex: 1,
    overflowY: "auto",
    padding: "10px 0",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    margin: "0 auto",
    width: "85vw",
  },

  /* CARD */
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textDecoration: "none",
    padding: "12px",
    borderRadius: "18px",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
    transition: "0.25s ease",
    cursor: "pointer",
  },

  image: {
    width: "45%",
    objectFit: "cover",
    marginBottom: "10px",
  },

  text: {
    margin: 0,
    fontSize: "1.1rem",
    textAlign: "center",
  },
};