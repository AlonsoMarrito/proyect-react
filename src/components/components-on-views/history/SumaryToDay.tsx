import type { CSSProperties } from "react";
import jsPDF from "jspdf";
import logo from "../../../assets/logoApp.png";
import { stripResumenHeading } from "../../../helpers/stripResumenHeading";

type PreviewTheme = {
  textColorPrimary: string;
  panelBg: string;
  panelBorder: string;
  accent: string;
  mutedText: string;
  accentMuted: string;
};

type Props = {
  servicesHistory: any[];
  selectedDate: string;
  theme?: PreviewTheme;
};

export default function DailySummaryPreview({
  servicesHistory,
  selectedDate,
  theme,
}: Props) {
  const servicesOfDay = [...servicesHistory].sort((a, b) => a.id - b.id);

  const th = theme ?? {
    textColorPrimary: "#1a1d21",
    panelBg: "#fafafa",
    panelBorder: "rgba(15, 23, 42, 0.09)",
    accent: "#D32F2F",
    mutedText: "#546e7a",
    accentMuted: "rgba(211, 47, 47, 0.08)",
  };

  const cleanText = (text: string) =>
    (text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{2,}/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim();

  const generatePDF = () => {
    const doc = new jsPDF({ format: "letter" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let y = 65;

    const addHeader = () => {
      doc.addImage(logo, "PNG", 10, 12, 22, 22);
      doc.setFontSize(16);
      doc.text("Bomberos", pageWidth - 10, 25, { align: "right" });

      doc.setFontSize(12);
      doc.text(`PARTES DEL ${selectedDate}`, pageWidth / 2, 55, {
        align: "center",
      });

      y = 65;
    };

    addHeader();

    servicesOfDay.forEach((s) => {
      const text = cleanText(stripResumenHeading(s.summary));
      const lines = doc.splitTextToSize(text, 120);

      doc.text(`Folio ${s.id}`, 20, y);
      y += 10;

      lines.forEach((l: string) => {
        doc.text(l, 20, y);
        y += 6;
      });

      y += 10;

      if (y > pageHeight - 20) {
        doc.addPage();
        addHeader();
      }
    });

    doc.save(`reporte_${selectedDate}.pdf`);
  };

  return (
    <div
      style={{
        ...styles.container,
        color: th.textColorPrimary,
        maxHeight: "100%",
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={styles.header}>
        <h2 style={{ margin: "0 0 8px", fontSize: "1.15rem", fontWeight: 800 }}>
          Partes del periodo
        </h2>
        <p style={{ margin: 0, color: th.mutedText, fontSize: 14 }}>
          {selectedDate}
        </p>
        {servicesOfDay.length > 0 && (
          <button
            type="button"
            onClick={generatePDF}
            style={{
              ...styles.btn,
              background: th.accent,
              marginTop: 12,
            }}
          >
            Descargar PDF
          </button>
        )}
      </div>

      {servicesOfDay.length === 0 && (
        <p style={{ textAlign: "center", color: th.mutedText }}>
          No hay datos en ese rango.
        </p>
      )}

      {servicesOfDay.map((s) => (
        <div
          key={s.id}
          style={{
            ...styles.card,
            background: th.panelBg,
            border: `1px solid ${th.panelBorder}`,
          }}
        >
          <h3 style={{ margin: "0 0 10px", fontSize: "1.12rem", fontWeight: 800 }}>
            Folio {s.id}
          </h3>
          <p
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              lineHeight: 1.55,
              fontSize: "1.05rem",
            }}
          >
            {stripResumenHeading(s.summary) || "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    maxWidth: "720px",
    margin: "0 auto",
    padding: "0.5rem 0",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "1.25rem",
  },
  btn: {
    padding: "10px 18px",
    borderRadius: 12,
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
  },
  card: {
    marginBottom: "18px",
    padding: "16px 18px",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
  },
};
