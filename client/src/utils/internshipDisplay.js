/** Safe deadline for API dates that may be missing or invalid. */
export function formatInternshipDeadline(value) {
  if (value == null || value === '') return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString();
}

export function displayCompany(company) {
  const t = (company || '').trim();
  return t || null;
}
