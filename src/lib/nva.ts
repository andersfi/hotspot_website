export const NVA_PROJECT_URI = "https://api.nva.unit.no/cristin/project/2769822";
export const NVA_SEARCH_BASE = `https://api.nva.unit.no/search/resources?project=${encodeURIComponent(NVA_PROJECT_URI)}`;

export const FETCH_OPTS = {
  headers: {
    Accept: "application/json",
    "User-Agent": "hotspots-website/1.0 (anders.finstad@ntnu.no)",
  },
  signal: AbortSignal.timeout(4000),
};

export const CRISTIN_FETCH_OPTS = {
  headers: { "User-Agent": "hotspots-website/1.0 (anders.finstad@ntnu.no)" },
  signal: AbortSignal.timeout(4000),
};

/** Pick the best label for a given lang, falling back nb → en */
export function pickLabel(
  labels: Record<string, string> | undefined,
  lang: string
): string {
  if (!labels) return "";
  if (lang === "en") return labels["en"] ?? labels["nb"] ?? "";
  return labels["nb"] ?? labels["nn"] ?? labels["en"] ?? "";
}

export function cristinIdFromUri(uri: string): string {
  return uri.split("/").pop() ?? "";
}

export async function fetchOrcid(cristinId: string): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://api.cristin.no/v2/persons/${cristinId}?format=json`,
      CRISTIN_FETCH_OPTS
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.orcid?.id ?? undefined;
  } catch {
    return undefined;
  }
}
