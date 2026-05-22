/** Fuseau du restaurant (Abidjan) — montants « du jour » corrects en local comme en hébergement */
export const VENUE_TIMEZONE = "Africa/Abidjan";

/** Date locale YYYY-MM-DD (Abidjan) */
export function localDateStr(date = new Date()): string {
  return date.toLocaleDateString("en-CA", { timeZone: VENUE_TIMEZONE });
}

/** true si l’ISO UTC correspond au jour local donné */
export function isOnLocalDay(iso: string, day = localDateStr()): boolean {
  return localDateStr(new Date(iso)) === day;
}
