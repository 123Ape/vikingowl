import { Scroll, Flame, Mountain, Eye } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const chapters = [
  {
    icon: Mountain,
    chapter: "I",
    title: "The Frozen Exile",
    text: "When the Long Winter swallowed the old kingdoms, a clan of owls was driven from the green valleys into the howling white. There, beneath glaciers older than the gods, they learned to survive the cold that kills.",
  },
  {
    icon: Flame,
    chapter: "II",
    title: "The Forge of Frost",
    text: "In caverns lit by blue fire, the owls forged armor from frozen iron and sharpened their talons on stone. Each warrior took an oath: to never bow, never break, and never abandon the clan.",
  },
  {
    icon: Eye,
    chapter: "III",
    title: "The Watchers Awaken",
    text: "169 warriors rose from the ice — the last true Vikings of the North. With eyes that pierce the dark, they returned to reclaim what the winter stole, one arena at a time.",
  },
];

const Lore = () => {
  const header = useReveal<HTMLDivElement>();
  const quote = useReveal<HTMLDivElement>();

  return (
    <section
      id="lore"
      className="relative py-24 sm:py-32 overflow-hidden bg-black text-center"
    >
      {/* Cinematic background */}
      <div className="absolute inset-0">
        <img
          src="/lore-bg.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover animate-slow-zoom opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      </div>

      {/* Drifting embers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <span
            key={i}
            className="absolute bottom-0 w-1 h-1 rounded-full bg-yellow-500/70 blur-[1px] animate-ember"
            style={{
              left: `${(i * 7 + 3) % 100}%`,
              animationDelay: `${i * 0.9}s`,
              animationDuration: `${7 + (i % 5) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div
          ref={header.ref}
          className={`reveal ${header.visible ? "is-visible" : ""} mb-14 sm:mb-20`}
        >
          <span className="inline-flex items-center gap-2 text-yellow-500 text-xs sm:text-sm tracking-widest uppercase font-semibold">
            <Scroll className="w-4 h-4" />
            The Saga
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-widest mt-3 bg-gradient-to-b from-white via-yellow-100 to-yellow-600 bg-clip-text text-transparent">
            THE LORE
          </h2>
          <p className="text-gray-400 mt-3 text-sm sm:text-base max-w-xl mx-auto text-pretty">
            Before the arena, there was the winter. This is how the Viking Owls
            were forged.
          </p>
          <div className="w-20 h-1 bg-yellow-500 mx-auto mt-6 rounded-full" />
        </div>

        {/* Hero portrait + intro */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 sm:mb-24 text-left">
          <LorePortrait />
          <div className="space-y-5">
            {chapters.slice(0, 1).map((c) => (
              <ChapterIntro key={c.chapter} {...c} />
            ))}
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base text-pretty">
              The clan does not remember peace. It remembers only the cold, the
              forge, and the long climb back to glory. Every owl that enters the
              arena carries a thousand years of frost in its blood.
            </p>
          </div>
        </div>

        {/* Chapter cards */}
        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {chapters.map((c, i) => (
            <ChapterCard key={c.chapter} index={i} {...c} />
          ))}
        </div>

        {/* Closing quote */}
        <div
          ref={quote.ref}
          className={`reveal ${quote.visible ? "is-visible" : ""} mt-16 sm:mt-24 max-w-3xl mx-auto`}
        >
          <blockquote className="relative px-6 sm:px-10 py-8 border border-yellow-500/30 rounded-2xl bg-black/50 backdrop-blur-sm">
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 bg-black text-yellow-500/80">
              <Flame className="w-6 h-6" />
            </span>
            <p className="text-lg sm:text-2xl font-semibold tracking-wide text-balance bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-clip-text text-transparent animate-shimmer">
              "We were not born for the cold. We were forged by it."
            </p>
            <footer className="mt-4 text-xs sm:text-sm tracking-widest uppercase text-gray-500">
              — Oath of the Frozen Clan
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
};

const LorePortrait = () => {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} relative mx-auto w-full max-w-md`}
    >
      <div className="absolute -inset-3 bg-yellow-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="relative rounded-2xl overflow-hidden border border-yellow-500/40 shadow-2xl shadow-yellow-500/10">
        <img
          src="/lore-owl.png"
          alt="A Viking Owl warrior in horned helmet and frost-covered armor"
          className="w-full h-full object-cover aspect-[4/5] hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="text-[10px] sm:text-xs tracking-widest uppercase text-yellow-500/90">
            Last of the North
          </span>
          <p className="font-bold tracking-widest text-lg sm:text-xl">
            THE WATCHER
          </p>
        </div>
      </div>
    </div>
  );
};

type Chapter = {
  icon: typeof Mountain;
  chapter: string;
  title: string;
  text: string;
};

const ChapterIntro = ({ icon: Icon, chapter, title }: Chapter) => (
  <div>
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 rounded-lg border border-yellow-500/40 bg-yellow-500/5 flex items-center justify-center">
        <Icon className="w-5 h-5 text-yellow-500" />
      </div>
      <div>
        <span className="block text-[10px] tracking-widest uppercase text-yellow-500/70">
          Chapter {chapter}
        </span>
        <h3 className="font-bold tracking-wide text-lg">{title}</h3>
      </div>
    </div>
    <p className="text-gray-400 leading-relaxed text-sm sm:text-base text-pretty">
      When the Long Winter swallowed the old kingdoms, a clan of owls was driven
      from the green valleys into the howling white — and learned to survive the
      cold that kills.
    </p>
  </div>
);

const ChapterCard = ({ icon: Icon, chapter, title, text, index }: Chapter & { index: number }) => {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <article
      ref={ref}
      style={{ transitionDelay: `${index * 120}ms` }}
      className={`reveal ${visible ? "is-visible" : ""} group relative text-left p-6 rounded-xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-sm overflow-hidden hover:border-yellow-500/40 transition-colors duration-500`}
    >
      <span className="absolute top-3 right-4 text-6xl font-bold text-white/5 group-hover:text-yellow-500/10 transition-colors duration-500">
        {chapter}
      </span>
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-lg border border-yellow-500/30 bg-yellow-500/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-6 h-6 text-yellow-500" />
        </div>
        <span className="block text-[10px] tracking-widest uppercase text-yellow-500/70 mb-1">
          Chapter {chapter}
        </span>
        <h3 className="font-bold text-lg tracking-wide mb-2">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed text-pretty">
          {text}
        </p>
      </div>
    </article>
  );
};

export default Lore;
