import CollectionCard from "./CollectionCard";

export default function CollectionSection() {
  return (
    <section className="container mx-auto px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <h2 className="font-serif text-4xl text-stone-800">Our Collection</h2>
          <p className="text-stone-600">
            Explore stunning gowns designed by brides like you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CollectionCard
            imageSrc="https://images.unsplash.com/photo-1770757588092-6fd47f8a2985?auto=format&fit=crop&w=1080&q=80"
            imageAlt="Gown 1"
            name="Ethereal Grace"
            style="Classic A-Line"
          />

          <CollectionCard
            imageSrc="https://images.unsplash.com/photo-1735712954543-67a25a6998c8?auto=format&fit=crop&w=1080&q=80"
            imageAlt="Gown 2"
            name="Modern Romance"
            style="Mermaid Silhouette"
          />

          <CollectionCard
            imageSrc="https://images.unsplash.com/photo-1681490395226-36e00f9bbd2b?auto=format&fit=crop&w=1080&q=80"
            imageAlt="Gown 3"
            name="Timeless Beauty"
            style="Ball Gown"
          />
        </div>
      </div>
    </section>
  );
}
