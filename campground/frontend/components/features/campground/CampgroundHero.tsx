"use client";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import dynamic from "next/dynamic";

const ImageGallery = dynamic(
  () => import("@/components/features/ImageGallery"),
  {
    loading: () => (
      <div className="flex aspect-video items-center justify-center bg-neutral-100">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
);

interface CampgroundHeroProps {
  images: string[];
}

export default function CampgroundHero({ images }: CampgroundHeroProps) {
  return (
    <section className="mt-14">
      <ImageGallery images={images} aspectRatio="4/3" />
    </section>
  );
}
