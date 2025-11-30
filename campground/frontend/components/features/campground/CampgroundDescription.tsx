"use client";

interface CampgroundDescriptionProps {
  description: string;
}

export default function CampgroundDescription({
  description,
}: CampgroundDescriptionProps) {
  return (
    <section className="px-4 py-6">
      <h2 className="mb-3 text-base font-bold">캠핑장 소개</h2>
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-700">
        {description}
      </p>
    </section>
  );
}
