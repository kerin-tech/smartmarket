type CategoryVariant = 'frutas' | 'verduras' | 'aseo' | 'carnes' | 'lacteos' | 'granos' | 'otros';

export const Badge = ({ label, variant = 'otros' }: { label: string, variant?: CategoryVariant }) => {
  const styles: Record<CategoryVariant, string> = {
    frutas: 'bg-red-100 text-red-700',
    verduras: 'bg-green-100 text-green-700',
    aseo: 'bg-blue-100 text-blue-700',
    carnes: 'bg-orange-100 text-orange-700',
    lacteos: 'bg-yellow-100 text-yellow-700',
    granos: 'bg-amber-100 text-amber-700',
    otros: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[variant]}`}>
      {label}
    </span>
  );
};
