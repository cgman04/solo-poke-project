import type { Badge } from "../types";

const badgeImageModules = import.meta.glob("../assets/badges/**/*.{png,jpg,jpeg,webp,svg,gif}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const badgeImageLookup: Record<string, string> = {};

function stripExt(p: string): string {
  return p.replace(/\.[^/.]+$/, "");
}

function normalizePath(p: string): string {
  let decoded = p;
  try {
    decoded = decodeURIComponent(p);
  } catch {
    decoded = p;
  }

  return decoded
    .replace(/\\/g, "/")
    .replace(/[?#].*$/, "")
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/^(?:\.\/|\.\.\/)+/g, "");
}

function canonicalize(p: string): string {
  return stripExt(normalizePath(p))
    .replace(/^.*?(?:src\/)?(?:assets\/)?badges\//, "")
    .split("/")
    .map((seg) => seg.replace(/[\s_-]+/g, "")) // "boulder-badge" == "boulder_badge" == "boulder badge"
    .join("/");
}

for (const [moduleKey, url] of Object.entries(badgeImageModules)) {
  const n = normalizePath(moduleKey);
  const rel = n.replace(/^.*?assets\/badges\//, "");
  if (!rel) continue;

  const base = rel.split("/").pop() || rel;

  badgeImageLookup[rel] = url;
  badgeImageLookup[stripExt(rel)] = url;
  badgeImageLookup[base] = url;
  badgeImageLookup[stripExt(base)] = url;
  badgeImageLookup[canonicalize(rel)] = url;
  badgeImageLookup[canonicalize(base)] = url;
}

function toBadgeLookupCandidates(inputPath: string): string[] {
  const n = normalizePath(inputPath);
  const rel = n.replace(/^.*?(?:src\/)?(?:assets\/)?badges\//, "");
  const base = rel.split("/").pop() || rel;

  return Array.from(
    new Set(
      [
        rel,
        stripExt(rel),
        base,
        stripExt(base),
        canonicalize(rel),
        canonicalize(base),
        n,
        stripExt(n),
      ].filter(Boolean)
    )
  );
}

function resolveBadgeImageSrc(imagePath: string): string {
  for (const key of toBadgeLookupCandidates(imagePath)) {
    const hit = badgeImageLookup[key];
    if (hit) return hit;
  }

  // Suffix fallback
  const candidates = toBadgeLookupCandidates(imagePath);
  for (const [k, v] of Object.entries(badgeImageLookup)) {
    if (candidates.some((c) => k.endsWith(c))) return v;
  }

  console.warn("[BadgeRow] image not resolved:", imagePath);

  // Critical: do NOT return empty string; let browser try original path
  return imagePath;
}

type BadgeRowProps = {
  badges: Badge[];
  earnedBadgeIds: string[];
  onToggleBadge: (badgeId: string) => void;
};

function BadgeRow({ badges, earnedBadgeIds, onToggleBadge }: BadgeRowProps) {
  return (
    <div className="panel overlay-panel">
      <h2>Badges</h2>
      <div className="badge-row">
        {badges.map((badge) => {
          const isEarned = earnedBadgeIds.includes(badge.id);
          const src = resolveBadgeImageSrc(badge.image);

          return (
            <div
              key={badge.id}
              className="badge-card"
              onClick={() => onToggleBadge(badge.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleBadge(badge.id);
                }
              }}
            >
              <img
                src={src}
                alt={badge.name}
                className={`badge-image ${isEarned ? "badge-earned" : "badge-locked"}`}
              />
              <span>{badge.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BadgeRow;