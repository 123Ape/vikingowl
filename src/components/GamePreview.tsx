import { useState, useEffect, useCallback } from "react";
import { Swords, Shield, Zap, Heart, Activity } from "lucide-react";

type Fighter = {
  name: string;
  hp: number;
  maxHp: number;
  color: string;
  glow: string;
};

type LogEntry = {
  id: number;
  text: string;
  type: "player" | "enemy" | "system";
};

const MAX_LOG = 6;

const GamePreview = () => {
  const [player, setPlayer] = useState<Fighter>({
    name: "BEARCLAW",
    hp: 100,
    maxHp: 100,
    color: "bg-emerald-500",
    glow: "shadow-emerald-500/50",
  });
  const [enemy, setEnemy] = useState<Fighter>({
    name: "SKULLBEAK",
    hp: 100,
    maxHp: 100,
    color: "bg-red-500",
    glow: "shadow-red-500/50",
  });
  const [turn, setTurn] = useState<"player" | "enemy">("player");
  const [log, setLog] = useState<LogEntry[]>([
    { id: 0, text: "The battle begins!", type: "system" },
  ]);
  const [floatingDamage, setFloatingDamage] = useState<
    { id: number; target: "player" | "enemy"; amount: number; crit: boolean }[]
  >([]);
  const [shake, setShake] = useState<"player" | "enemy" | null>(null);
  const [attacking, setAttacking] = useState<"player" | "enemy" | null>(null);
  const [gameOver, setGameOver] = useState<"player" | "enemy" | null>(null);
  const [logId, setLogId] = useState(1);

  const addLog = useCallback((text: string, type: LogEntry["type"]) => {
    setLogId((prev) => {
      const id = prev;
      setLog((curr) => [{ id, text, type }, ...curr].slice(0, MAX_LOG));
      return prev + 1;
    });
  }, []);

  const showDamage = (target: "player" | "enemy", amount: number, crit: boolean) => {
    const id = Date.now() + Math.random();
    setFloatingDamage((curr) => [...curr, { id, target, amount, crit }]);
    setTimeout(() => {
      setFloatingDamage((curr) => curr.filter((d) => d.id !== id));
    }, 1200);
  };

  const triggerShake = (target: "player" | "enemy") => {
    setShake(target);
    setTimeout(() => setShake(null), 400);
  };

  const triggerAttack = (target: "player" | "enemy") => {
    setAttacking(target);
    setTimeout(() => setAttacking(null), 300);
  };

  const checkGameOver = (pHp: number, eHp: number) => {
    if (eHp <= 0) {
      setGameOver("player");
      addLog("SKULLBEAK has fallen! Victory!", "system");
      return true;
    }
    if (pHp <= 0) {
      setGameOver("enemy");
      addLog("BEARCLAW has fallen! Defeat...", "system");
      return true;
    }
    return false;
  };

  const enemyTurn = useCallback(
    (pHp: number, eHp: number) => {
      if (pHp <= 0 || eHp <= 0) return;
      setTimeout(() => {
        const isCrit = Math.random() < 0.2;
        const baseDamage = Math.floor(Math.random() * 12) + 8;
        const damage = isCrit ? Math.floor(baseDamage * 1.6) : baseDamage;
        const newPHp = Math.max(0, pHp - damage);

        setPlayer((prev) => ({ ...prev, hp: newPHp }));
        triggerAttack("enemy");
        triggerShake("player");
        showDamage("player", damage, isCrit);
        addLog(
          `SKULLBEAK ${isCrit ? "CRITICAL! " : ""}strikes for ${damage} damage`,
          "enemy"
        );

        checkGameOver(newPHp, eHp);
        setTurn("player");
      }, 900);
    },
    [addLog]
  );

  const playerAction = (action: "attack" | "skill" | "defend") => {
    if (turn !== "player" || gameOver) return;

    if (action === "attack") {
      const isCrit = Math.random() < 0.25;
      const baseDamage = Math.floor(Math.random() * 14) + 10;
      const damage = isCrit ? Math.floor(baseDamage * 1.7) : baseDamage;
      const newEHp = Math.max(0, enemy.hp - damage);

      setEnemy((prev) => ({ ...prev, hp: newEHp }));
      triggerAttack("player");
      triggerShake("enemy");
      showDamage("enemy", damage, isCrit);
      addLog(
        `BEARCLAW ${isCrit ? "CRITICAL! " : ""}strikes for ${damage} damage`,
        "player"
      );

      if (checkGameOver(player.hp, newEHp)) return;
      setTurn("enemy");
      enemyTurn(player.hp, newEHp);
    } else if (action === "skill") {
      const damage = Math.floor(Math.random() * 20) + 18;
      const newEHp = Math.max(0, enemy.hp - damage);

      setEnemy((prev) => ({ ...prev, hp: newEHp }));
      triggerAttack("player");
      triggerShake("enemy");
      showDamage("enemy", damage, true);
      addLog(`BEARCLAW unleashes FROST BITE for ${damage} damage!`, "player");

      if (checkGameOver(player.hp, newEHp)) return;
      setTurn("enemy");
      enemyTurn(player.hp, newEHp);
    } else if (action === "defend") {
      const heal = Math.floor(Math.random() * 10) + 6;
      const newPHp = Math.min(player.maxHp, player.hp + heal);
      setPlayer((prev) => ({ ...prev, hp: newPHp }));
      addLog(`BEARCLAW steadies and recovers ${heal} HP`, "player");
      setTurn("enemy");
      enemyTurn(newPHp, enemy.hp);
    }
  };

  const reset = () => {
    setPlayer({ name: "BEARCLAW", hp: 100, maxHp: 100, color: "bg-emerald-500", glow: "shadow-emerald-500/50" });
    setEnemy({ name: "SKULLBEAK", hp: 100, maxHp: 100, color: "bg-red-500", glow: "shadow-red-500/50" });
    setTurn("player");
    setLog([{ id: 0, text: "The battle begins!", type: "system" }]);
    setLogId(1);
    setGameOver(null);
    setFloatingDamage([]);
  };

  // Auto enemy turn trigger
  useEffect(() => {
    if (turn === "enemy" && !gameOver) {
      const timer = setTimeout(() => {
        const isCrit = Math.random() < 0.2;
        const baseDamage = Math.floor(Math.random() * 12) + 8;
        const damage = isCrit ? Math.floor(baseDamage * 1.6) : baseDamage;
        const newPHp = Math.max(0, player.hp - damage);

        setPlayer((prev) => ({ ...prev, hp: newPHp }));
        triggerAttack("enemy");
        triggerShake("player");
        showDamage("player", damage, isCrit);
        addLog(
          `SKULLBEAK ${isCrit ? "CRITICAL! " : ""}strikes for ${damage} damage`,
          "enemy"
        );

        if (!checkGameOver(newPHp, enemy.hp)) {
          setTurn("player");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, gameOver, player.hp, enemy.hp, addLog]);

  const playerHpPct = (player.hp / player.maxHp) * 100;
  const enemyHpPct = (enemy.hp / enemy.maxHp) * 100;

  return (
    <section id="game" className="py-24 sm:py-32 bg-zinc-950 text-center overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <span className="text-yellow-500 text-sm tracking-widest uppercase font-semibold">
            Live Combat
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 tracking-widest">
            ARENA BATTLE PREVIEW
          </h2>
          <div className="w-20 h-1 bg-yellow-500 mx-auto mt-6 rounded-full" />
        </div>

        {/* Battle frame */}
        <div className="relative mx-auto max-w-5xl border border-yellow-500/40 rounded-2xl p-4 sm:p-6 bg-black/80 backdrop-blur-sm shadow-2xl shadow-yellow-500/10">
          {/* HP BARS */}
          <div className="flex justify-between items-start mb-6 gap-4">
            {/* Player */}
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-emerald-500" />
                <p className="font-bold tracking-wide text-sm sm:text-base">
                  {player.name}
                </p>
                <span className="text-xs text-gray-500 ml-auto">
                  {player.hp}/{player.maxHp}
                </span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${playerHpPct}%` }}
                />
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center px-2">
              <div className="text-yellow-500 font-bold text-xl sm:text-2xl tracking-widest">
                VS
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Activity
                  className={`w-3 h-3 ${
                    turn === "player" ? "text-emerald-500" : "text-zinc-600"
                  } animate-pulse`}
                />
                <span
                  className={`text-[10px] tracking-widest uppercase ${
                    turn === "player" ? "text-emerald-500" : "text-zinc-600"
                  }`}
                >
                  {turn === "player" ? "Your Turn" : "Enemy"}
                </span>
                <Activity
                  className={`w-3 h-3 ${
                    turn === "enemy" ? "text-red-500" : "text-zinc-600"
                  } animate-pulse`}
                />
              </div>
            </div>

            {/* Enemy */}
            <div className="flex-1 text-right">
              <div className="flex items-center gap-2 mb-2 justify-end">
                <span className="text-xs text-gray-500 mr-auto">{enemy.hp}/{enemy.maxHp}</span>
                <p className="font-bold tracking-wide text-sm sm:text-base">
                  {enemy.name}
                </p>
                <Heart className="w-4 h-4 text-red-500" />
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-500 ease-out ml-auto"
                  style={{ width: `${enemyHpPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* ARENA */}
          <div className="relative h-80 sm:h-96 bg-[url('/arena.jpg')] bg-cover bg-center rounded-xl border border-zinc-700 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

            {/* Player fighter */}
            <div
              className={`absolute left-6 sm:left-12 bottom-8 text-left transition-all duration-300 ${
                shake === "player" ? "animate-shake" : ""
              } ${attacking === "player" ? "-translate-x-2 scale-110" : ""}`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-emerald-500 bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Swords className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-300" />
                </div>
                {/* Floating damage */}
                {floatingDamage
                  .filter((d) => d.target === "player")
                  .map((d) => (
                    <span
                      key={d.id}
                      className={`absolute -top-4 left-1/2 -translate-x-1/2 font-bold text-lg sm:text-xl animate-float-up ${
                        d.crit ? "text-yellow-400 text-2xl" : "text-red-400"
                      }`}
                    >
                      -{d.amount}
                    </span>
                  ))}
              </div>
              <p className="text-xs sm:text-sm mt-2 font-semibold tracking-wide">
                Bearclaw
              </p>
            </div>

            {/* Enemy fighter */}
            <div
              className={`absolute right-6 sm:right-12 bottom-8 text-right transition-all duration-300 ${
                shake === "enemy" ? "animate-shake" : ""
              } ${attacking === "enemy" ? "translate-x-2 scale-110" : ""}`}
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-red-500 bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-red-300" />
                </div>
                {floatingDamage
                  .filter((d) => d.target === "enemy")
                  .map((d) => (
                    <span
                      key={d.id}
                      className={`absolute -top-4 left-1/2 -translate-x-1/2 font-bold text-lg sm:text-xl animate-float-up ${
                        d.crit ? "text-yellow-400 text-2xl" : "text-emerald-400"
                      }`}
                    >
                      -{d.amount}
                    </span>
                  ))}
              </div>
              <p className="text-xs sm:text-sm mt-2 font-semibold tracking-wide">
                Skullbeak
              </p>
            </div>

            {/* Game over overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <h3 className="text-3xl sm:text-4xl font-bold mb-2 tracking-widest">
                  {gameOver === "player" ? "VICTORY" : "DEFEAT"}
                </h3>
                <p className="text-gray-400 mb-6">
                  {gameOver === "player"
                    ? "Skullbeak has fallen in the frozen arena"
                    : "Bearclaw has fallen... the cold takes another"}
                </p>
                <button
                  onClick={reset}
                  className="px-6 py-2.5 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300"
                >
                  Battle Again
                </button>
              </div>
            )}
          </div>

          {/* BATTLE LOG */}
          <div className="mt-4 h-24 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-left">
            <div className="space-y-1">
              {log.map((entry) => (
                <p
                  key={entry.id}
                  className={`text-xs sm:text-sm font-mono ${
                    entry.type === "player"
                      ? "text-emerald-400"
                      : entry.type === "enemy"
                      ? "text-red-400"
                      : "text-yellow-500"
                  }`}
                >
                  {entry.type === "system" ? "★ " : "> "}
                  {entry.text}
                </p>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-center gap-3 sm:gap-4 mt-6">
            <button
              onClick={() => playerAction("attack")}
              disabled={turn !== "player" || gameOver !== null}
              className="group px-5 sm:px-6 py-2.5 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              <Swords className="w-4 h-4" />
              Attack
            </button>
            <button
              onClick={() => playerAction("skill")}
              disabled={turn !== "player" || gameOver !== null}
              className="group px-5 sm:px-6 py-2.5 border-2 border-yellow-500 text-yellow-500 font-bold rounded-lg hover:bg-yellow-500 hover:text-black hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Skill
            </button>
            <button
              onClick={() => playerAction("defend")}
              disabled={turn !== "player" || gameOver !== null}
              className="group px-5 sm:px-6 py-2.5 border-2 border-zinc-600 text-zinc-300 font-bold rounded-lg hover:border-zinc-400 hover:text-white hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Defend
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamePreview;
