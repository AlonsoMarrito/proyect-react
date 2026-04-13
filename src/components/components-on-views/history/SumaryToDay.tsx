import jsPDF from "jspdf";
import logo from "../../../assets/logoApp.png";

type Props = {
  servicesHistory: any[];
  selectedDate: string;
};

export default function DailySummaryPreview({
  servicesHistory,
  selectedDate,
}: Props) {
  const servicesOfDay = [...servicesHistory].sort((a, b) => a.id - b.id);

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
      const text = cleanText(s.summary);
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
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>PARTES DEL DÍA {selectedDate}</h2>

        {servicesOfDay.length > 0 && (
          <button onClick={generatePDF}>Descargar PDF</button>
        )}
      </div>

      {servicesOfDay.length === 0 && <p>No hay datos</p>}

      {servicesOfDay.map((s) => (
        <div key={s.id} style={styles.card}>
          <h3>Folio {s.id}</h3>
          <p>{s.summary}</p>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "80%",
    margin: "auto",
    padding: "2rem",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  card: {
    marginBottom: "20px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
};