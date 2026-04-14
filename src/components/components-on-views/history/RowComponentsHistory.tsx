import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

import { getPreferences } from "../../scripts/preference/getPreference.js";
import { getAllInformationToVehicle } from "../../scripts/vehicle/generalInfoVehicle/getVehicles";
import { getAllUser } from "../../scripts/user/getUser";
import { getAllTypeToServices } from "../../scripts/typeToServices/getTypeToServices";
import { getAllColognes } from "../../scripts/colognes/getColognes";
import { stripResumenHeading } from "../../../helpers/stripResumenHeading";

export type HistoryCardTheme = {
  textColorPrimary: string;
  panelBg: string;
  panelBorder: string;
  accent: string;
  accentMuted: string;
  tableHeadBg: string;
  mutedText: string;
  inputBorder: string;
};

type Props = {
  servicesHistory: any[];
  theme?: HistoryCardTheme;
};

const FALLBACK_THEME: HistoryCardTheme = {
  textColorPrimary: "#1a1d21",
  panelBg: "#ffffff",
  panelBorder: "rgba(15, 23, 42, 0.09)",
  accent: "#D32F2F",
  accentMuted: "rgba(211, 47, 47, 0.12)",
  tableHeadBg: "#37474f",
  mutedText: "#546e7a",
  inputBorder: "#cfd8dc",
};

function statusStyle(status: string | undefined): {
  bg: string;
  color: string;
  border: string;
} {
  const s = String(status ?? "").toLowerCase();
  if (s.includes("curso"))
    return { bg: "#fff3e0", color: "#e65100", border: "rgba(230, 81, 0, 0.35)" };
  if (s.includes("cerr") || s.includes("final"))
    return { bg: "#e8f5e9", color: "#2e7d32", border: "rgba(46, 125, 50, 0.35)" };
  if (s.includes("cancel") || s.includes("falsa"))
    return { bg: "#eceff1", color: "#546e7a", border: "rgba(84, 110, 122, 0.35)" };
  if (s.includes("pend"))
    return { bg: "#e3f2fd", color: "#1565c0", border: "rgba(21, 101, 192, 0.35)" };
  return { bg: "#fce4ec", color: "#c2185b", border: "rgba(194, 24, 91, 0.25)" };
}

export default function RowHistory({ servicesHistory, theme: themeProp }: Props) {
  const theme = themeProp ?? FALLBACK_THEME;
  const [styleColor, setStyleColor] = useState(0);
  const [vehicles, setVehicles] = useState<any>({});
  const [typeService, setTypeService] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});
  const [colognes, setColognes] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const pref = await getPreferences();
      setStyleColor(pref?.color ?? 0);

      const types = await getAllTypeToServices();
      setTypeService(Array.isArray(types) ? types : []);

      const col = await getAllColognes();
      setColognes(Array.isArray(col) ? col : []);

      const users = await getAllUser();
      const map: any = {};
      if (Array.isArray(users)) {
        users.forEach((u: any) => {
          map[u.id] = `${u.first_name} ${u.last_name}`;
        });
      }
      setUsersMap(map);
    })();

    (async () => {
      const v = await getAllInformationToVehicle();
      const map: any = {};
      if (Array.isArray(v)) {
        v.forEach((x: any) => (map[x.id] = x));
      }
      setVehicles(map);
    })();
  }, []);

  const getTypeServiceName = (id: number) =>
    typeService.find((t) => t.id === id)?.name ?? "—";

  const getCologneName = (id: number) =>
    colognes.find((c) => Number(c.id) === Number(id))?.name ?? "—";

  const getOperator = (arr: any[]) => {
    if (!arr?.length) return "—";
    const chofer = arr.find((p) => p.position_on_service === "chofer");
    return usersMap[chofer?.id_user] ?? "—";
  };

  const tint =
    styleColor === 1
      ? "linear-gradient(135deg, rgba(198,40,40,0.05) 0%, rgba(255,255,255,0.96) 100%)"
      : "linear-gradient(135deg, rgba(211,47,47,0.04) 0%, rgba(255,255,255,0.98) 100%)";

  return (
    <>
      {servicesHistory.map((item, index) => {
        const st = statusStyle(item.status);
        return (
          <Link
            key={`${item.id}-${index}`}
            to={`/sumary-service/${item.id}`}
            style={{
              ...styles.card,
              background: tint,
              border: `1px solid ${theme.panelBorder}`,
              color: theme.textColorPrimary,
            }}
          >
            <div
              style={{
                ...styles.accentPin,
                background: `linear-gradient(180deg, ${theme.accent}, ${theme.tableHeadBg})`,
              }}
            />
            <div style={styles.cardBody}>
              <div style={styles.topRow}>
                <span
                  style={{
                    ...styles.folioBadge,
                    background: theme.accentMuted,
                    color: theme.accent,
                    border: `1px solid ${theme.inputBorder}`,
                  }}
                >
                  #{item.id}
                </span>
                <span style={{ ...styles.metaStrong, color: theme.textColorPrimary }}>
                  {getTypeServiceName(item.id_type_service)}
                </span>
                <span style={{ color: theme.mutedText, fontSize: 18 }}>
                  U-{vehicles[item.vehicle_id]?.number_unit ?? "—"}
                </span>
                <span style={{ color: theme.mutedText, fontSize: 18 }}>
                  {getCologneName(item.id_cologne)}
                </span>
                <span style={{ color: theme.mutedText, fontSize: 18 }}>
                  {item.date_to_open?.slice(0, 10) ?? "—"}
                </span>
              </div>
              <div style={styles.bottomRow}>
                <span
                  style={{
                    ...styles.chip,
                    background: st.bg,
                    color: st.color,
                    border: `1px solid ${st.border}`,
                  }}
                >
                  {String(item.status ?? "—").toUpperCase()}
                </span>
                <span
                  style={{
                    ...styles.chipLight,
                    border: `1px solid ${theme.inputBorder}`,
                    color: theme.textColorPrimary,
                  }}
                >
                  Op.: {getOperator(item.personal_on_a_service)}
                </span>
                <span
                  style={{
                    ...styles.chipLight,
                    border: `1px solid ${theme.inputBorder}`,
                    color: theme.mutedText,
                  }}
                >
                  {item.time_to_open?.slice(11, 19) ?? "—"}
                </span>
              </div>
              <div
                style={{
                  ...styles.summaryBox,
                  border: `1px solid ${theme.inputBorder}`,
                  background: theme.panelBg,
                  color: theme.textColorPrimary,
                }}
              >
                {stripResumenHeading(item.summary) || "—"}
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    position: "relative",
    display: "block",
    borderRadius: 16,
    marginBottom: 16,
    paddingLeft: 14,
    textDecoration: "none",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  accentPin: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 12,
    borderRadius: "16px 0 0 16px",
  },
  cardBody: {
    padding: "22px 24px 22px 16px",
  },
  topRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "12px 16px",
    marginBottom: 12,
  },
  folioBadge: {
    fontSize: 18,
    fontWeight: 800,
    padding: "6px 14px",
    borderRadius: 9,
  },
  metaStrong: {
    fontSize: 19,
    fontWeight: 700,
  },
  bottomRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  chip: {
    fontSize: 14,
    fontWeight: 800,
    padding: "7px 14px",
    borderRadius: 999,
    letterSpacing: "0.02em",
  },
  chipLight: {
    fontSize: 14,
    fontWeight: 700,
    padding: "7px 14px",
    borderRadius: 999,
    background: "rgba(15, 23, 42, 0.04)",
  },
  summaryBox: {
    marginTop: 12,
    padding: "12px 14px",
    borderRadius: 10,
    fontSize: 15,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxHeight: "6.75rem",
    overflow: "hidden",
    boxSizing: "border-box",
  },
};
