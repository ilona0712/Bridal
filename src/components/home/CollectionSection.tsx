import CollectionCard from "./CollectionCard";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../../lib/supabase";

export default function CollectionSection() {
  type CollectionWithImages = { name: string; images: string[] };
  const [collections, setCollections] = useState<CollectionWithImages[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase
        .from("collections")
        .select(`
          id,
          name,
          dresses (
            id,
            dress_images (
              image_url,
              is_primary
            )
          )
        `)
        .eq("is_active", true)
        .order("name");

      if (data) {
        const mapped = data.map((c) => {
          const allImages = c.dresses.flatMap((d) =>
            d.dress_images.map((img) => img.image_url)
          );
          const primaryImages = c.dresses.flatMap((d) =>
            d.dress_images.filter((img) => img.is_primary).map((img) => img.image_url)
          );
          return {
            name: c.name,
            images: primaryImages.length > 0 ? primaryImages : allImages,
          };
        });
        setCollections(mapped);
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

  const renderCard = (collection: CollectionWithImages, index: number) => (
    <motion.div
      key={collection.name}
      initial={{ opacity: 0, y: 40, rotate: -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: "easeOut",
      }}
    >
      <CollectionCard
        images={collection.images}
        imageAlt={collection.name}
        name={collection.name}
        style="Collection"
      />
    </motion.div>
  );

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 space-y-3 text-center">
          <h2 className="font-serif text-4xl text-stone-800 dark:text-stone-100">
            Our Collections
          </h2>
          <p className="text-stone-600 dark:text-stone-300">
            Explore stunning dresses designed by brides like you
          </p>
        </div>

        {collections.length <= 3 && (
          <div className="mx-auto grid max-w-5xl gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c, i) => renderCard(c, i))}
          </div>
        )}

        {collections.length === 4 && (
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
              {firstRow.map((c, i) => renderCard(c, i))}
            </div>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
              {secondRow.map((c, i) => renderCard(c, i))}
            </div>
          </div>
        )}

        {collections.length === 5 && (
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {firstRow.map((c, i) => renderCard(c, i))}
            </div>
            <div className="mx-auto grid max-w-3xl gap-8 grid-cols-1 sm:grid-cols-2">
              {secondRow.map((c, i) => renderCard(c, i))}
            </div>
          </div>
        )}

        {collections.length >= 6 && (
          <div className="mx-auto grid max-w-6xl gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c, i) => renderCard(c, i))}
          </div>
        )}
      </div>
    </section>
  );
}
