export interface TagConfig {
  label: string;
  className: string;
}

export const TAG_CONFIG: Record<string, TagConfig> = {
  alto_proteina: { label: "Alto en proteínas",  className: "bg-blue-50 text-blue-700 border border-blue-200" },
  sin_tacc:      { label: "Sin TACC",            className: "bg-green-50 text-green-700 border border-green-200" },
  apto_celiaco:  { label: "Apto celíacos",       className: "bg-green-50 text-green-700 border border-green-200" },
  vegano:        { label: "Vegano",              className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  vegetariano:   { label: "Vegetariano",         className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  familiar:      { label: "Familiar",            className: "bg-amber-50 text-amber-700 border border-amber-200" },
  picante:       { label: "Picante",             className: "bg-red-50 text-red-700 border border-red-200" },
  keto:          { label: "Apto Keto",           className: "bg-yellow-50 text-yellow-800 border border-yellow-200" },
  bajo_calorias: { label: "Bajo en calorías",    className: "bg-sky-50 text-sky-700 border border-sky-200" },
};

export function getTag(key: string): TagConfig {
  return TAG_CONFIG[key] ?? {
    label: key.replace(/_/g, " "),
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  };
}
