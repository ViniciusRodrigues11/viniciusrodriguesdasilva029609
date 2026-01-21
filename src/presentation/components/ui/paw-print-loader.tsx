import "./paw-print-loader.css";

export function PawPrintLoader() {
  const pawprints = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-3 py-12 self-center">
      {pawprints.map((index) => (
        <div
          key={index}
          className="paw-print-animation"
          style={{
            animationDelay: `${index * 0.5}s`,
            marginTop: index % 2 === 0 ? 0 : "24px",
          }}
        >
          <img
            src="/paw.svg"
            className="rotate-90"
            style={{
              transform: `rotate(${index % 2 === 0 ? -10 : 6}deg)`,
            }}
            alt="Paw print"
            width="32"
            height="32"
          />
        </div>
      ))}
    </div>
  );
}
