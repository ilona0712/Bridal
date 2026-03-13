import CollectionCard from "./CollectionCard";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function CollectionSection() {
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase
        .from("collections")
        .select("name")
        .order("name");

      if (data) {
        setCollections(data.map((c) => c.name));
      }
    };

    fetchCollections();
  }, []);

  const firstRow = useMemo(() => {
    if (collections.length === 4) return collections.slice(0, 2);
    if (collections.length === 5) return collections.slice(0, 3);
    return collections;
  }, [collections]);

  const secondRow = useMemo(() => {
    if (collections.length === 4) return collections.slice(2);
    if (collections.length === 5) return collections.slice(3);
    return [];
  }, [collections]);

  const renderCard = (collection: string) => (
    <CollectionCard
      key={collection}
      imageSrc="https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1080&q=80"
      imageAlt={collection}
      name={collection}
      style="Collection"
    />
  );

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-3 text-center">
          <h2 className="font-serif text-4xl text-stone-800">
            Our Collections
          </h2>
          <p className="text-stone-600">
            Explore stunning gowns designed by brides like you
          </p>
        </div>

        {collections.length <= 3 && (
          <div className="mx-auto grid max-w-5xl gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map(renderCard)}
          </div>
        )}

        {collections.length === 4 && (
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
              {firstRow.map(renderCard)}
            </div>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
              {secondRow.map(renderCard)}
            </div>
          </div>
        )}

        {collections.length === 5 && (
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {firstRow.map(renderCard)}
            </div>
            <div className="mx-auto grid max-w-3xl gap-8 grid-cols-1 sm:grid-cols-2">
              {secondRow.map(renderCard)}
            </div>
          </div>
        )}

        {collections.length >= 6 && (
          <div className="mx-auto grid max-w-6xl gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map(renderCard)}
          </div>
        )}
      </div>
    </section>
  );
}