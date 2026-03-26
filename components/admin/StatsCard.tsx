
export default function StatsCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: number
  color?: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-primary-soft text-primary',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    gray: 'bg-gray-50 text-gray-600',
  }
  const c = colors[color || 'gray'] || colors.gray

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${c}`}>
        {Icon ? <Icon size={20} /> : null}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{Number(value || 0).toLocaleString('es-CO')}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

