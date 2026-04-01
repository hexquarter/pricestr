import { useEffect, useRef, useState } from "react";

const nodes = [
  { id: "sigrate", label: "SIGRATE", size: "lg" },
];

const relays = [
  { angle: 0, dist: 120, label: "relay-1" },
  { angle: 60, dist: 120, label: "relay-2" },
  { angle: 120, dist: 145, label: "relay-3" },

  { angle: 180, dist: 120, label: "relay-4" },
  { angle: 240, dist: 120, label: "relay-5" },
  { angle: 300, dist: 120, label: "relay-6" },
];

const apps = [
  { angle: 0, dist: 200, label: "app-1" },
  { angle: 60, dist: 200, label: "app-2" },
  { angle: 120, dist: 200, label: "app-3" },
  { angle: 180, dist: 200, label: "app-4" },
  { angle: 240, dist: 200, label: "app-5" },
  { angle: 300, dist: 200, label: "app-6" },
]

const getPosition = (angle: number, dist: number, scale = 1) => {
  const rad = (angle * Math.PI) / 180;
  return {
    x: 50 + Math.cos(rad) * dist * scale * 0.25,
    y: 50 + Math.sin(rad) * dist * scale * 0.25,
  };
};

const relayPositions = relays.map((r) =>
  getPosition(r.angle, r.dist)
);

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

const ProofModel = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-16 text-center">
          // network map
        </h2>

        <div className="flex justify-center">
          <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
            {/* Orbital rings */}
            <div className="absolute inset-[60px] md:inset-[80px] rounded-full border border-border/30" />
            <div className="absolute inset-[20px] md:inset-[30px] rounded-full border border-border/15" />

            {/* Center node */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-violet-400/50 flex items-center bg-black justify-center glow-orange transition-all duration-700 ${visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                }`}
            >
              <span className="text-[9px] md:text-[10px] font-bold uppercase">Price<span className="text-violet-400">str</span></span>
            </div>

            {/* Relay nodes */}
            {relays.map((relay, i) => {
              const centerX = 50;
              const centerY = 50;
              const scale = typeof window !== 'undefined' && window.innerWidth < 768 ? 0.8 : 1;
              const rad = (relay.angle * Math.PI) / 180;
              const x = centerX + Math.cos(rad) * relay.dist * scale * 0.25;
              const y = centerY + Math.sin(rad) * relay.dist * scale * 0.25;

              return (
                <div
                  key={relay.label}
                  className={`absolute z-10 transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    transitionDelay: `${300 + i * 100}ms`,
                  }}
                >
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-border/10 bg-violet-600 flex items-center justify-center glow-green">
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-violet-400" />
                  </div>
                  <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground whitespace-nowrap">
                    {relay.label}
                  </span>
                </div>
              );
            })}

            {/* Relay nodes */}
            {apps.map((relay, i) => {
              const centerX = 50;
              const centerY = 50;
              const scale = typeof window !== 'undefined' && window.innerWidth < 768 ? 0.8 : 1;
              const rad = (relay.angle * Math.PI) / 180;
              const x = centerX + Math.cos(rad) * relay.dist * scale * 0.25;
              const y = centerY + Math.sin(rad) * relay.dist * scale * 0.25;

              return (
                <div
                  key={relay.label}
                  className={`absolute z-10 transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    transitionDelay: `${300 + i * 100}ms`,
                  }}
                >
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-border/10 bg-green-800 flex items-center justify-center glow-green">
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-400" />
                  </div>
                  <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground whitespace-nowrap">
                    {relay.label}
                  </span>
                </div>
              );
            })}

            {/* Connection lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              {relays.map((relay, i) => {
                const scale = 1;
                const rad = (relay.angle * Math.PI) / 180;
                const x = 50 + Math.cos(rad) * relay.dist * scale * 0.25;
                const y = 50 + Math.sin(rad) * relay.dist * scale * 0.25;
                return (
                  <line
                    key={i}
                    x1="50" y1="50" x2={x} y2={y}
                    stroke="hsl(var(--border))"
                    strokeWidth="0.2"
                    className={`transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transitionDelay: `${400 + i * 80}ms` }}
                  />
                );
              })}
            </svg>

            {/* App Connection lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              {apps.map((app, i) => {
                const appPos = getPosition(app.angle, app.dist);

                // find closest relay
                let closestRelay = relayPositions[0];
                let minDist = distance(appPos, relayPositions[0]);

                for (let j = 1; j < relayPositions.length; j++) {
                  const d = distance(appPos, relayPositions[j]);
                  if (d < minDist) {
                    minDist = d;
                    closestRelay = relayPositions[j];
                  }
                }

                return (
                  <line
                    key={i}
                    x1={closestRelay.x}
                    y1={closestRelay.y}
                    x2={appPos.x}
                    y2={appPos.y}
                    stroke="hsl(var(--border))"
                    strokeWidth="0.2"
                    className={`transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'
                      }`}
                    style={{ transitionDelay: `${400 + i * 80}ms` }}
                  />
                );
              })}
            </svg>

            {/* Pulse events */}
            {visible && [0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 radar-ring"
                style={{
                  width: 60 + i * 40,
                  height: 60 + i * 40,
                  animationDelay: `${i * 1.3}s`,
                }}
              />
            ))}
          </div>
        </div>

        <p className="text-[10px] text-white text-center mt-8 tracking-widest">
          EVENTS PROPAGATE FROM <br />EXCHANGES → RELAY NETWORK → YOUR APP
        </p>
      </div>
    </section>
  );
};

export default ProofModel;
