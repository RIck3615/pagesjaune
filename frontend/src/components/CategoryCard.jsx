import { Link } from 'react-router-dom'

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/search?category=${category.id}`}
      className="card card-hover group"
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
          <span className="text-2xl">{category.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {category.name}
          </h3>
          {category.businesses_count !== undefined && (
            <p className="text-sm text-gray-500">
              {category.businesses_count} entreprise{category.businesses_count !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
      
      {category.children && category.children.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {category.children.slice(0, 3).map((child) => (
              <span
                key={child.id}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {child.name}
              </span>
            ))}
            {category.children.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{category.children.length - 3}
              </span>
            )}
          </div>
        </div>
      )}
    </Link>
  )
}

export default CategoryCard
