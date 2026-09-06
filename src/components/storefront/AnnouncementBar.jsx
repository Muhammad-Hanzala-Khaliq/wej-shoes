const messages = [
  "Cash on Delivery All Over Pakistan",
  "7 Days Exchange Policy",
  "24/7 Support",
  "Parcel Open Before Payment",
];

export default function AnnouncementBar() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{ background: "var(--ink)" }}
    >
      <div className="container-page flex items-center justify-center h-9">
        <div className="hidden md:flex items-center gap-6">
          {messages.map((msg, i) => (
            <span key={i} className="flex items-center gap-3 text-xs font-medium" style={{ color: "#d6d3d1" }}>
              <span>{msg}</span>
              {i < messages.length - 1 && (
                <span style={{ color: "var(--brand)" }}>•</span>
              )}
            </span>
          ))}
        </div>

        <div className="md:hidden flex items-center gap-4 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
          {[...messages, ...messages].map((msg, i) => (
            <span key={i} className="flex items-center gap-3 text-xs font-medium" style={{ color: "#d6d3d1" }}>
              <span>{msg}</span>
              <span style={{ color: "var(--brand)" }}>•</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
