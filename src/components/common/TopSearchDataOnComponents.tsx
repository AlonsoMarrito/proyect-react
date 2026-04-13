import { useEffect, useState } from "react";
import { getPreferences } from "../scripts/preference/getPreference";

type Props = {
  buttonText: string;
  inputText: string;
  onOpen?: () => void;

  onSearchChange?: (value: string) => void;
};

export default function TopSearchDataOnComponents({
  buttonText,
  inputText,
  onOpen,
  onSearchChange,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [styleColor, setStyleColor] = useState(0);

  const colorApss = [
    {
      primaryCardsBackground: "#f5f5f5",
    },
    {
      primaryCardsBackground: "#eaeaea",
    },
  ];

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);
    })();
  }, []);

  useEffect(() => {
    onSearchChange?.(searchQuery);
  }, [searchQuery]);

  return (
    <div
      style={{
        ...styles.container,
        background: colorApss[styleColor].primaryCardsBackground,
      }}
    >
      {/* BUTTON */}
      <button style={styles.button} onClick={onOpen}>
        {buttonText}
      </button>

      {/* INPUT */}
      <input
        style={styles.input}
        placeholder={inputText}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "10vh",
    maxHeight: "100px",
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
  },

  button: {
    width: "30%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#D32F2F",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  input: {
    width: "65%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  },
};