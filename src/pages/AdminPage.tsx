import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Upload, ArrowLeft, Plus } from "lucide-react";
import Header from "../components/Header";
import { ImageWithFallback } from "../figma/ImageWithFallback";


export default function AdminPage() {
  const [formData, setFormData] = useState({
    name: "",
    collection: "Classic Romance",
    image: "",
    sizes: [] as number[],
    neckline: "Sweetheart",
    silhouette: "A-Line",
    fabric: "Lace",
    trainLength: "Chapel",
    sleeveStyle: "Cap Sleeve",
  });

  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);

  const collections = [
    "Classic Romance",
    "Royal Collection",
    "Contemporary",
    "Boho Chic",
    "Vintage Collection",
  ];
  const necklines = [
    "Sweetheart",
    "Off-Shoulder",
    "V-Neck",
    "Halter",
    "Square",
    "Illusion",
    "Scoop",
  ];
  const silhouettes = ["A-Line", "Ball Gown", "Mermaid", "Sheath", "Fit & Flare", "Empire"];
  const fabrics = ["Lace", "Satin", "Crepe", "Chiffon", "Tulle", "Organza", "Mikado"];
  const trainLengths = ["No Train", "Sweep", "Court", "Chapel", "Cathedral", "Royal"];
  const sleeveStyles = [
    "Sleeveless",
    "Cap Sleeve",
    "Short Sleeve",
    "Long Sleeve",
    "Three-Quarter",
    "Off-Shoulder",
  ];
  const availableSizes = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26];

  const handleSizeToggle = (size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size].sort((a, b) => a - b)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dressData = {
      ...formData,
      sizes: selectedSizes,
    };

    console.log("New Dress Data:", dressData);
    alert("Dress added successfully! (Demo: data is logged to console)");

    // Reset
    setFormData({
      name: "",
      collection: "Classic Romance",
      image: "",
      sizes: [],
      neckline: "Sweetheart",
      silhouette: "A-Line",
      fabric: "Lace",
      trainLength: "Chapel",
      sleeveStyle: "Cap Sleeve",
    });
    setSelectedSizes([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-stone-600" />
            </div>
            <div>
              <h1 className="font-serif text-4xl text-stone-800">Admin Dashboard</h1>
              <p className="text-stone-500">Add new dresses to the gallery</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
  <Link
    to="/gallery?mode=admin"
    className="inline-flex items-center gap-2 px-5 py-3 bg-stone-800 text-white rounded-2xl hover:bg-stone-700 transition-colors font-medium"
  >
    Manage Dresses in Gallery (Edit / Delete)
  </Link>

  <p className="text-sm text-stone-500 mt-3">
    You will be redirected to the Gallery with admin controls enabled.
  </p>
</div>

        {/* Form */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif text-stone-800 flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Basic Information
              </h2>

              <div className="space-y-2">
                <label className="text-sm text-stone-700">
                  Dress Name <span className="text-pink-400/60">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Ethereal Grace"
                  className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 placeholder:text-stone-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-stone-700">
                    Collection <span className="text-pink-400/60">*</span>
                  </label>
                  <select
                    required
                    value={formData.collection}
                    onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
                  >
                    {collections.map((collection) => (
                      <option key={collection} value={collection}>
                        {collection}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-stone-700">
                  Image URL <span className="text-pink-400/60">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 placeholder:text-stone-400"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Upload className="w-5 h-5 text-stone-400" />
                  </div>
                </div>
                <p className="text-xs text-stone-500">Use Unsplash or other image hosting URLs</p>
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div className="space-y-2">
                  <label className="text-sm text-stone-700">Image Preview</label>
                  <div className="aspect-[3/4] max-w-xs rounded-xl overflow-hidden border border-stone-200">
                    <ImageWithFallback
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Available Sizes */}
            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-stone-800">
                Available Sizes <span className="text-pink-400/60">*</span>
              </h2>
              <p className="text-sm text-stone-600">Select all sizes available for this dress</p>

              <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-10 gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedSizes.includes(size)
                        ? "bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 border-stone-300 text-stone-800"
                        : "bg-stone-50/50 border-stone-200 text-stone-600 hover:bg-stone-100/50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {selectedSizes.length === 0 && (
                <p className="text-xs text-pink-400/60">Please select at least one size</p>
              )}
            </div>

            {/* Dress Attributes */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif text-stone-800">Dress Attributes</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-stone-700">
                    Neckline <span className="text-pink-400/60">*</span>
                  </label>
                  <select
                    required
                    value={formData.neckline}
                    onChange={(e) => setFormData({ ...formData, neckline: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
                  >
                    {necklines.map((neckline) => (
                      <option key={neckline} value={neckline}>
                        {neckline}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-stone-700">
                    Silhouette <span className="text-pink-400/60">*</span>
                  </label>
                  <select
                    required
                    value={formData.silhouette}
                    onChange={(e) => setFormData({ ...formData, silhouette: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
                  >
                    {silhouettes.map((silhouette) => (
                      <option key={silhouette} value={silhouette}>
                        {silhouette}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-stone-700">
                    Fabric <span className="text-pink-400/60">*</span>
                  </label>
                  <select
                    required
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
                  >
                    {fabrics.map((fabric) => (
                      <option key={fabric} value={fabric}>
                        {fabric}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-stone-700">
                    Train Length <span className="text-pink-400/60">*</span>
                  </label>
                  <select
                    required
                    value={formData.trainLength}
                    onChange={(e) => setFormData({ ...formData, trainLength: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
                  >
                    {trainLengths.map((train) => (
                      <option key={train} value={train}>
                        {train}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-stone-700">
                    Sleeve Style <span className="text-pink-400/60">*</span>
                  </label>
                  <select
                    required
                    value={formData.sleeveStyle}
                    onChange={(e) => setFormData({ ...formData, sleeveStyle: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 cursor-pointer"
                  >
                    {sleeveStyles.map((sleeve) => (
                      <option key={sleeve} value={sleeve}>
                        {sleeve}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={selectedSizes.length === 0}
                className="flex-1 py-4 bg-gradient-to-r from-stone-300 via-pink-200/40 to-stone-300 text-stone-700 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Add Dress to Gallery
              </button>

              <Link
                to="/gallery"
                className="px-8 py-4 bg-stone-100/50 border border-stone-200 text-stone-700 rounded-xl hover:bg-stone-200/50 transition-colors font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}