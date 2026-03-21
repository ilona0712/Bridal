import type { ReactNode } from "react";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-2xl p-8 border border-stone-200/50 dark:border-stone-700/50 space-y-4">
      <div className="w-16 h-16 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-2xl flex items-center justify-center">
        {icon}
      </div>

      <h3 className="font-serif text-xl text-stone-800 dark:text-stone-100">{title}</h3>

      <p className="text-stone-600 dark:text-stone-300">{description}</p>
    </div>
  );
}
