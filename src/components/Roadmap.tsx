import { useState } from "react";
import { Sparkles, Hammer, Swords, Crown, ChevronRight } from "lucide-react";

const phases = [
  {
    num: "01",
    label: "PHASE 1",
    title: "AWAKENING",
    desc: "NFT Design + Lore + Community",
    icon: Sparkles,
    status: "complete",
    details: [
      "169 unique Viking Owl warriors",
      "Hand-crafted lore & backstories",
      "Discord community founding",
      "Allowlist & mint distribution",
    ],
  },
  {
    num: "02",
    label: "PHASE 2",
    title: "FORGE",
    desc: "Game Concept + Arena Prototype",
    icon: Hammer,
    status: "active",
    details: [
      "Combat engine prototype",
      "Arena environment design",
      "Character stat system",
      "Closed alpha playtesting",
    ],
  },
  {
    num: "03",
    label: "PHASE 3",
    title: "ARENA",
    desc: "PvP System + Alpha Testing",
    icon: Swords,
    status: "upcoming",
    details: [
      "Real-time PvP matchmaking",
      "Seasonal ladder & ranks",
      "Guild wars framework",
      "Open alpha release",
    ],
  },
  {
    num: "04",
    label: "PHASE 4",
    title: "LEGENDS",
    desc: "Full Game + Ranking System",
    icon: Crown,
    status: "upcoming",
    details: [
      "Full game launch",
      "Global ranking leaderboard",
      "Esports tournament circuit",
      "Cross-platform expansion",
    ],
  },
];

const statusConfig = {
  complete: {
    color: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/5",
    dot: "bg-emerald-500",
    label: "Complete",
  },
  active: {
    color: "text-yellow-500",
    border: "border-yellow-500/50",
    bg: "bg-yellow-500/5",
    dot: "bg-yellow-500",
    label: "In Progress",
  },
  upcoming: {
    color: "text-gray-500",
    border: "border-zinc-800",
    bg: "bg-zinc-900/30",
    dot: "bg-zinc-600",
    label: "Upcoming",
  },
};

const Roadmap = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      id="roadmap"
      className="relative py-24 sm:py-32 bg-black text-center overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-16">
          <span className="text-yellow-500 text-sm tracking-widest uppercase font-semibold">
            The Journey
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-widest mt-3">
            ROADMAP
          </h2>
          <p className="text-gray-400 mt-3 text-sm sm:text-base">
            169 Warriors. One Clan. Eternal Legacy.
          </p>
          <div className="w-20 h-1 bg-yellow-500 mx-auto mt-6 rounded-full" />
        </div>

        {/* Timeline connector */}
        <div className="hidden md:block relative mb-8">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-emerald-500/40 via-yellow-500/40 to-zinc-700" />
          <div className="relative flex justify-between max-w-6xl mx-auto">
            {phases.map((phase, i) => {
              const config = statusConfig[phase.status as keyof typeof statusConfig];
              return (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`relative w-4 h-4 rounded-full ${config.dot} ring-4 ring-black z-10`}
                  >
                    {phase.status === "active" && (
                      <div className="absolute inset-0 rounded-full bg-yellow-500 animate-ping opacity-75" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase cards */}
        <div className="grid md:grid-cols-4 gap-6">
          {phases.map((phase, i) => {
            const config = statusConfig[phase.status as keyof typeof statusConfig];
            const Icon = phase.icon;
            const isHovered = hovered === i;

            return (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`group relative border ${config.border} ${config.bg} p-5 rounded-xl text-left transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden`}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 transition-all duration-500" />

                {/* Phase number watermark */}
                <span className="absolute top-2 right-3 text-5xl font-bold text-white/5 group-hover:text-yellow-500/10 transition-colors duration-500">
                  {phase.num}
                </span>

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}
                  >
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>

                  {/* Label */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-bold tracking-widest ${config.color}`}>
                      {phase.label}
                    </h3>
                    <span
                      className={`flex items-center gap-1 text-[10px] tracking-widest uppercase ${config.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="font-bold text-lg tracking-wide mb-2">
                    {phase.title}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-4">{phase.desc}</p>

                  {/* Expandable details */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      isHovered ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="border-t border-zinc-800 pt-3 space-y-2">
                      {phase.details.map((detail) => (
                        <div
                          key={detail}
                          className="flex items-start gap-2 text-xs text-gray-500"
                        >
                          <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-500/60" />
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hint */}
                  {!isHovered && (
                    <p className="text-[10px] text-gray-600 tracking-widest uppercase mt-2">
                      Hover to expand
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16">
          <p className="text-gray-400 mb-6 text-sm">
            Will your owl be among the 169 legends?
          </p>
          <button className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300 shadow-lg shadow-yellow-500/30">
            Join the Clan
          </button>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
