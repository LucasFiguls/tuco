interface NutritionGridProps {
  calorias: number | null;
  proteinas: number | null;
  carbohidratos: number | null;
  grasas: number | null;
}

interface Cell {
  label: string;
  value: number | null;
  unit: string;
}

export function NutritionGrid({ calorias, proteinas, carbohidratos, grasas }: NutritionGridProps) {
  const cells: Cell[] = [
    { label: "Calorías",      value: calorias,      unit: "kcal" },
    { label: "Proteínas",     value: proteinas,      unit: "g" },
    { label: "Carbohidratos", value: carbohidratos,  unit: "g" },
    { label: "Grasas",        value: grasas,         unit: "g" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-brand-cream rounded-input p-3">
          <div className="flex items-baseline gap-1">
            <span className="font-body font-bold text-[22px] text-brand-dark">
              {cell.value ?? "—"}
            </span>
            {cell.value !== null && (
              <span className="font-body text-[11px] text-brand-muted">{cell.unit}</span>
            )}
          </div>
          <p className="font-body text-[12px] text-brand-muted mt-0.5">{cell.label}</p>
        </div>
      ))}
    </div>
  );
}
