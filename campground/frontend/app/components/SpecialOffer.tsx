/**
 * SpecialOffer Component
 * Special discount banner with gradient
 * React 19+ with React Compiler auto-optimization
 */

export function SpecialOffer() {
  return (
    <section className="container-mobile bg-muted/30 py-2">
      <div className="relative rounded-2xl bg-linear-to-br from-rose-400 to-orange-400 p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold">전국민 할인!</h3>
        <p className="mt-1 text-2xl font-extrabold">
          선착순 즉시 할인 최대 3만원
        </p>
        <div className="absolute right-2 bottom-2 rounded-full bg-white/20 px-3 py-1 text-xs">
          1 / 3
        </div>
      </div>
    </section>
  );
}
