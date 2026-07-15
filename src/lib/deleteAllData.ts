/**
 * Security doc §2/§6: one-click "Delete all my data" that fully clears
 * localStorage and returns the app to a fresh state. Reloading afterward
 * (rather than manually resetting every store) guarantees a truly clean
 * start — every store re-initializes from empty storage exactly as it
 * would on a brand-new browser profile.
 */
export function deleteAllData(): void {
  localStorage.clear()
  window.location.reload()
}
