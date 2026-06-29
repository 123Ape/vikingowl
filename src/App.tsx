import { useEffect, useState } from "react";
import { Menu, X, Shield, Swords, Snowflake } from "lucide-react";
import GamePreview from "@/components/GamePreview";
import Roadmap from "@/components/Roadmap";

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Game", href: "#game" },
    { label: "Roadmap", href: "#roadmap" },
    { label: "Features", href: "#features" },
  ];

  return (
    <main className="bg-black text-white min-h-screen overflow-x-hidden">
      {/* NAV */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-md border-b border-yellow-500/20 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full border-2 border-yellow-500 flex items-center justify-center bg-black group-hover:rotate-12 transition-transform duration-500">
              <Snowflake className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="font-bold tracking-widest text-sm sm:text-base">
              VIKING OWL
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm tracking-wide text-gray-300 hover:text-yellow-500 transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-yellow-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            <button className="px-5 py-2 bg-yellow-500 text-black font-semibold text-sm rounded hover:bg-yellow-400 transition-colors duration-300">
              Enter Arena
            </button>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ${
            menuOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="px-6 py-4 flex flex-col gap-4 bg-black/95 backdrop-blur-md border-t border-yellow-500/20">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-gray-300 hover:text-yellow-500 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button className="px-5 py-2 bg-yellow-500 text-black font-semibold text-sm rounded w-fit">
              Enter Arena
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative text-center py-32 sm:py-40 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Snow particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full animate-snowfall"
              style={{
                left: `${(i * 5) % 100}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${8 + (i % 4) * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-yellow-500/30 bg-yellow-500/5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs tracking-widest text-yellow-500/90 uppercase">
              Season 1 — Now Live
            </span>
          </div>

          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-2xl animate-pulse-slow" />
            <img
              src="/eJkhj-Kj_400x400.jpg"
              alt="Viking Owl"
              className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-yellow-500 object-cover shadow-2xl shadow-yellow-500/20 hover:scale-105 transition-transform duration-700"
            />
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold mt-8 tracking-widest bg-gradient-to-b from-white via-yellow-100 to-yellow-600 bg-clip-text text-transparent">
            VIKING OWL ARENA
          </h1>
          <p className="text-gray-400 mt-4 text-lg tracking-wide">
            Enter the Frozen Battle World
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="group px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300 shadow-lg shadow-yellow-500/30 flex items-center gap-2">
              <Swords className="w-5 h-5" />
              Enter Arena
            </button>
            <button className="px-8 py-3 border border-zinc-700 text-gray-200 font-semibold rounded-lg hover:border-yellow-500/50 hover:text-yellow-500 transition-all duration-300 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Watch Trailer
            </button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-4 sm:gap-12 max-w-2xl mx-auto">
            {[
              { value: "50K+", label: "Warriors" },
              { value: "12", label: "Battle Modes" },
              { value: "4.9", label: "Player Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-4xl font-bold text-yellow-500">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 tracking-widest uppercase mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GAME PREVIEW */}
      <GamePreview />

      {/* ROADMAP */}
      <Roadmap />

      {/* FOOTER */}
      <footer className="text-center py-12 text-gray-500 border-t border-zinc-800 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full border-2 border-yellow-500 flex items-center justify-center">
              <Snowflake className="w-4 h-4 text-yellow-500" />
            </div>
            <span className="font-bold tracking-widest text-sm text-white">
              VIKING OWL ARENA
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Viking Owl Arena © 2025 — Forged in the Frozen North
          </p>
        </div>
      </footer>
    </main>
  );
}

export default App;
