import type { Dress } from "../../types/dress";

type ProfileFavoritesSectionProps = {
  favoriteDresses: Dress[];
};

export default function ProfileFavoritesSection({
  favoriteDresses,
}: ProfileFavoritesSectionProps) {
  return (
    <div className="pt-6 border-t border-stone-200/50 dark:border-stone-700/50">
      <h3 className="font-serif text-xl text-stone-800 dark:text-stone-100 mb-4">My Favorites</h3>

      {favoriteDresses.length === 0 ? (
        <div className="px-4 py-6 bg-stone-50/30 dark:bg-stone-700/30 border border-stone-200/50 dark:border-stone-600/50 rounded-xl text-stone-500 dark:text-stone-400">
          You have not added any favorite dresses yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoriteDresses.map((dress) => (
            <div
              key={dress.id}
              className="bg-white/70 dark:bg-stone-800/70 border border-stone-200/50 dark:border-stone-700/50 rounded-2xl overflow-hidden shadow-sm"
            >
              <img
                src={dress.image}
                alt={dress.name}
                className="w-full h-56 object-cover"
              />
              <div className="p-4">
                <h4 className="font-serif text-lg text-stone-800 dark:text-stone-100">
                  {dress.name}
                </h4>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  {dress.silhouette} • {dress.fabric}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}