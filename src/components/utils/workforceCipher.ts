/** Mismo algoritmo que en workForceByGroup (rotación Caesar con desplazamiento 5). */

const ROT = 5;

function mapEncryptChar(code: number): string {
  if (code >= 48 && code <= 57) {
    return String.fromCharCode(((code - 48 + ROT) % 10) + 48);
  }
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((code - 65 + ROT) % 26) + 65);
  }
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((code - 97 + ROT) % 26) + 97);
  }
  return String.fromCharCode(code);
}

function mapDecryptChar(code: number): string {
  if (code >= 48 && code <= 57) {
    return String.fromCharCode(((code - 48 - ROT + 10) % 10) + 48);
  }
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((code - 65 - ROT + 26) % 26) + 65);
  }
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((code - 97 - ROT + 26) % 26) + 97);
  }
  return String.fromCharCode(code);
}

export function encryptEmployeeToken(id: string | number): string {
  const text = String(id);
  const encrypted = text
    .split("")
    .map((char) => mapEncryptChar(char.charCodeAt(0)))
    .join("");
  return encodeURIComponent(encrypted);
}

/** Alias usado en vistas; mismo comportamiento que `encryptEmployeeToken`. */
export const encryptId = encryptEmployeeToken;

export function decryptEmployeeToken(encoded: string): string | null {
  if (!encoded?.trim()) return null;
  try {
    const raw = decodeURIComponent(encoded.trim());
    const out = raw
      .split("")
      .map((char) => mapDecryptChar(char.charCodeAt(0)))
      .join("");
    return out.length ? out : null;
  } catch {
    return null;
  }
}
