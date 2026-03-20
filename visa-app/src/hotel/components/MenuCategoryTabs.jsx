export default function MenuCategoryTabs({ categories, selectedCategory, onSelectCategory, language, L }) {
  return (
    <div className="bg-white border-b border-gray-100 overflow-x-auto">
      <div className="flex gap-2 px-4 py-3">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#FF6B35] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {L(language, cat.label)}
          </button>
        ))}
      </div>
    </div>
  )
}
