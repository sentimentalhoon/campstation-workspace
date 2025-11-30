/**
 * QuickLinks Component
 * Quick action links (friend invite, attendance, events)
 * React 19+ with React Compiler auto-optimization
 */

const QUICK_LINKS = [
  { icon: "👫", label: "친구초대" },
  { icon: "📅", label: "출석체크" },
  { icon: "🎫", label: "이벤트 모음" },
];

export function QuickLinks() {
  return (
    <section className="container-mobile bg-card py-2">
      <div className="mt-4 grid grid-cols-3 gap-3">
        {QUICK_LINKS.map((link) => (
          <button
            key={link.label}
            className="bg-card flex flex-col items-center gap-2 rounded-lg p-3 shadow-sm active:scale-95"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-foreground text-xs font-medium">
              {link.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
