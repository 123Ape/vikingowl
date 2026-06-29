import { useState } from "react";
import { Sparkles, Hammer, Swords, Crown, ChevronRight, Plus, Minus } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const phases = [
  {
    num: "01",
    label: "PHASE 1",
    title: "AWAKENING",
    desc: "Warriors + Lore + World",
    icon: Sparkles,
    status: "complete",
    progress: 100,
    details: [
      "169 unique Viking Owl warriors",
      "Hand-crafted lore & backstories",
      "Clan identity & frozen world-building",
      "Founding warrior roster revealed",
    ],
  },
  {
    num: "02",
    label: "PHASE 2",
    title: "FORGE",
    desc: "Game Concept + Arena Prototype",
    icon: Hammer,
    status: "active",
    progress: 60,
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
    progress: 15,
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
    progress: 0,
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
    bar: "from-emerald-600 to-emerald-400",
    label: "Complete",
  },
  active: {
    color: "text-yellow-500",
    border: "border-yellow-500/50",
    bg: "bg-yellow-500/5",
    dot: "bg-yellow-500",
    bar: "from-yellow-600 to-yellow-400",
    label: "In Progress",
  },
  upcoming: {
    color: "text-gray-500",
    border: "border-zinc-800",
    bg: "bg-zinc-900/30",
    dot: "bg-zinc-600",
    bar: "from-zinc-600 to-zinc-500",
    label: "Upcoming",
  },
};

type Phase = (typeof phases)[number];

const PhaseCard = ({
  phase,
  index,
  expanded,
  onToggle,
}: {
  phase: Phase;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const config = statusConfig[phase.status as keyof typeof statusConfig];
  const Icon = phase.icon;
  const { ref, visible } = useReveal<HTMLButtonElement>();

  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      style={{ transitionDelay: `${index * 120}ms` }}
      className={`reveal ${visible ? "is-visible" : ""} group relative border ${config.border} ${config.bg} p-5 rounded-xl text-left w-full transition-all duration-500 hover:-translate-y-2 hover:border-yellow-500/50 cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/60`}
    >
      {/* Sheen sweep on hover */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
        <span className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-sheen" />
      </span>

      {/* Phase number watermark */}
      <span className="absolute top-2 right-3 text-5xl font-bold text-white/5 group-hover:text-yellow-500/10 transition-colors duration-500">
        {phase.num}
      </span>

      <div className="relative z-10">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
        >
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>

        {/* Label + status */}
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-sm font-bold tracking-widest ${config.color}`}>
            {phase.label}
          </h3>
          <span
            className={`flex items-center gap-1 text-[10px] tracking-widest uppercase ${config.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}>
              {phase.status === "active" && (
                <span className="block w-full h-full rounded-full bg-yellow-500 animate-ping" />
              )}
            </span>
            {config.label}
          </span>
        </div>

        {/* Title */}
        <p className="font-bold text-lg tracking-wide mb-1">{phase.title}</p>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4">{phase.desc}</p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] tracking-widest uppercase text-gray-500">
              Progress
            </span>
            <span className={`text-[10px] font-bold ${config.color}`}>
              {phase.progress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${config.bar} ${
                visible ? "animate-grow-width" : ""
              }`}
              style={{ width: `${phase.progress}%` }}
            />
          </div>
        </div>

        {/* Expandable details */}
        <div
          className={`overflow-hidden transition-all duration-500 ${
            expanded ? "max-h-56 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-zinc-800 pt-3 space-y-2">
            {phase.details.map((detail) => (
              <div
                key={detail}
                className="flex items-start gap-2 text-xs text-gray-400"
              >
                <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-500/60" />
                {detail}
              </div>
            ))}
          </div>
        </div>

        {/* Toggle hint */}
        <span className="mt-3 inline-flex items-center gap-1 text-[10px] text-gray-500 group-hover:text-yellow-500/80 tracking-widest uppercase transition-colors">
          {expanded ? (
            <>
              <Minus className="w-3 h-3" /> Hide details
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" /> View details
            </>
          )}
        </span>
      </div>
    </button>
  );
};

const Roadmap = () => {
  const [expanded, setExpanded] = useState<number | null>(1);
  const header = useReveal<HTMLDivElement>();
  const cta = useReveal<HTMLDivElement>();

  return (
    <section
      id="roadmap"
      className="relative py-24 sm:py-32 bg-black text-center overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div
          ref={header.ref}
          className={`reveal ${header.visible ? "is-visible" : ""} mb-12 sm:mb-16`}
        >
          <span className="text-yellow-500 text-xs sm:text-sm tracking-widest uppercase font-semibold">
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

        {/* Timeline connector (desktop) */}
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
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
          {phases.map((phase, i) => (
            <PhaseCard
              key={phase.num}
              phase={phase}
              index={i}
              expanded={expanded === i}
              onToggle={() => setExpanded(expanded === i ? null : i)}
            />
          ))}
        </div>

        {/* CTA */}
        <div
          ref={cta.ref}
          className={`reveal ${cta.visible ? "is-visible" : ""} mt-16`}
        >
          <p className="text-gray-400 mb-6 text-sm">
            Will your owl be among the 169 legends?
          </p>
          <a
            href="#game"
            className="inline-block px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300 shadow-lg shadow-yellow-500/30"
          >
            Enter the Arena
          </a>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
