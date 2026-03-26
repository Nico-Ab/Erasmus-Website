export const swuFacultyCatalog = [
  {
    code: "LAW_HISTORY",
    name: "Faculty of Law and History"
  },
  {
    code: "MATH_NAT",
    name: "Faculty of Mathematics and Natural Sciences"
  },
  {
    code: "ECON",
    name: "Faculty of Economics"
  },
  {
    code: "PUBLIC_HEALTH",
    name: "Faculty of Public Health, Health Care and Sport"
  },
  {
    code: "PEDAGOGY",
    name: "Faculty of Pedagogy"
  },
  {
    code: "PHILOLOGY",
    name: "Faculty of Philology"
  },
  {
    code: "PHILOSOPHY",
    name: "Faculty of Philosophy"
  },
  {
    code: "ARTS",
    name: "Faculty of Arts"
  },
  {
    code: "TECHNICAL",
    name: "Technical Faculty"
  }
] as const;

export const swuFacultyCodes = swuFacultyCatalog.map((faculty) => faculty.code);

const swuFacultyCodeSet = new Set<string>(swuFacultyCodes);

export function isOfficialSwuFacultyCode(code: string | null | undefined) {
  return Boolean(code && swuFacultyCodeSet.has(code));
}
