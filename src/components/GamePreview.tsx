import { useCallback, useEffect, useRef, useState } from "react";
import { Swords, ArrowUp, Gamepad2 } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

/* ------------------------------------------------------------------ */
/*  Real-time 2D arena prototype (Shadow Fight Arena inspired)         */
/*  - rAF game loop with physics in refs (no per-frame React renders)  */
/*  - Player: joystick / keyboard movement, jump, attack               */
/*  - Enemy: simple AI state machine                                   */
/* ------------------------------------------------------------------ */

const TUNING = {
  playerSpeed: 4.4, // px per frame @60fps
  enemySpeed: 3.3,
  gravity: 0.95,
  jump: 17,
  attackRange: 132, // center-to-center px
  attackCooldown: 520, // ms
  attackWindup: 90, // ms before damage lands
  attackActive: 220, // ms attack pose duration
  minGap: 64, // keep bodies from fully overlapping
  playerMaxHp: 100,
  enemyMaxHp: 100,
};

type Status = "ready" | "fighting" | "win" | "lose";

type Entity = {
  x: number; // left edge px
  y: number; // height above ground px
  vy: number;
  facing: 1 | -1; // 1 = facing right
  hp: number;
  maxHp: number;
  lastAttack: number;
  attackStart: number; // 0 when not attacking
  hitApplied: boolean;
};

type AI = {
  dir: number; // -1,0,1 horizontal intent
  nextDecision: number;
  wantJump: boolean;
};

const GamePreview = () => {
  const [status, setStatus] = useState<Status>("ready");
  const header = useReveal<HTMLDivElement>();
  const frame = useReveal<HTMLDivElement>();

  // DOM refs (written to directly by the loop)
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const enemyRef = useRef<HTMLDivElement | null>(null);
  const playerHpRef = useRef<HTMLDivElement | null>(null);
  const enemyHpRef = useRef<HTMLDivElement | null>(null);
  const fxLayerRef = useRef<HTMLDivElement | null>(null);

  // Mutable world state
  const world = useRef({
    arenaW: 800,
    spriteW: 112,
    player: {
      x: 160,
      y: 0,
      vy: 0,
      facing: 1,
      hp: TUNING.playerMaxHp,
      maxHp: TUNING.playerMaxHp,
      lastAttack: 0,
      attackStart: 0,
      hitApplied: true,
    } as Entity,
    enemy: {
      x: 520,
      y: 0,
      vy: 0,
      facing: -1,
      hp: TUNING.enemyMaxHp,
      maxHp: TUNING.enemyMaxHp,
      lastAttack: 0,
      attackStart: 0,
      hitApplied: true,
    } as Entity,
    ai: { dir: 0, nextDecision: 0, wantJump: false } as AI,
    input: { dir: 0, jump: false, attack: false },
    running: false,
    last: 0,
  });

  const rafRef = useRef<number | null>(null);
  const statusRef = useRef<Status>("ready");
  statusRef.current = status;

  /* ----------------------------- helpers ---------------------------- */

  const centerX = useCallback((e: Entity) => e.x + world.current.spriteW / 2, []);

  const spawnFloatingDamage = useCallback(
    (x: number, y: number, amount: number, color: string) => {
      const layer = fxLayerRef.current;
      if (!layer) return;
      const el = document.createElement("div");
      el.textContent = `-${amount}`;
      el.className =
        "pointer-events-none absolute font-bold text-lg sm:text-xl drop-shadow-lg select-none";
      el.style.left = `${x}px`;
      el.style.bottom = `${y}px`;
      el.style.color = color;
      el.style.transform = "translate(-50%, 0)";
      el.style.transition = "transform 700ms ease-out, opacity 700ms ease-out";
      layer.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = "translate(-50%, -60px)";
        el.style.opacity = "0";
      });
      setTimeout(() => el.remove(), 720);
    },
    []
  );

  const flashHit = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    const node = ref.current;
    if (!node) return;
    node.classList.add("arena-hit");
    setTimeout(() => node.classList.remove("arena-hit"), 200);
  }, []);

  const shakeStage = useCallback(() => {
    const node = stageRef.current;
    if (!node) return;
    node.classList.remove("arena-shake");
    void node.offsetWidth; // reflow to restart animation
    node.classList.add("arena-shake");
  }, []);

  const triggerAttackPose = useCallback(
    (ref: React.RefObject<HTMLDivElement | null>) => {
      const node = ref.current;
      if (!node) return;
      node.classList.remove("arena-attack");
      void node.offsetWidth;
      node.classList.add("arena-attack");
      setTimeout(() => node.classList.remove("arena-attack"), TUNING.attackActive);
    },
    []
  );

  /* ------------------------------ loop ------------------------------ */

  const measure = useCallback(() => {
    const arena = arenaRef.current;
    const sprite = playerRef.current;
    if (arena) world.current.arenaW = arena.clientWidth;
    if (sprite) world.current.spriteW = sprite.offsetWidth || 112;
  }, []);

  const resetWorld = useCallback(() => {
    measure();
    const w = world.current;
    const aw = w.arenaW;
    w.player.x = aw * 0.18;
    w.player.y = 0;
    w.player.vy = 0;
    w.player.hp = TUNING.playerMaxHp;
    w.player.facing = 1;
    w.player.attackStart = 0;
    w.player.hitApplied = true;
    w.player.lastAttack = 0;

    w.enemy.x = aw * 0.82 - w.spriteW;
    w.enemy.y = 0;
    w.enemy.vy = 0;
    w.enemy.hp = TUNING.enemyMaxHp;
    w.enemy.facing = -1;
    w.enemy.attackStart = 0;
    w.enemy.hitApplied = true;
    w.enemy.lastAttack = 0;

    w.ai.dir = 0;
    w.ai.nextDecision = 0;
    w.ai.wantJump = false;
    w.input.dir = 0;
    w.input.jump = false;
    w.input.attack = false;
  }, [measure]);

  const render = useCallback(() => {
    const w = world.current;
    const { player, enemy, spriteW } = w;

    if (playerRef.current) {
      const flip = player.facing === 1 ? 1 : -1;
      playerRef.current.style.transform = `translate3d(${player.x}px, ${-player.y}px, 0) scaleX(${flip})`;
    }
    if (enemyRef.current) {
      // enemy art faces left by default
      const flip = enemy.facing === -1 ? 1 : -1;
      enemyRef.current.style.transform = `translate3d(${enemy.x}px, ${-enemy.y}px, 0) scaleX(${flip})`;
    }
    if (playerHpRef.current) {
      playerHpRef.current.style.width = `${(player.hp / player.maxHp) * 100}%`;
    }
    if (enemyHpRef.current) {
      enemyHpRef.current.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
    }
    void spriteW;
  }, []);

  const tryAttack = useCallback(
    (attacker: Entity, defender: Entity, now: number) => {
      if (now - attacker.lastAttack < TUNING.attackCooldown) return;
      attacker.lastAttack = now;
      attacker.attackStart = now;
      attacker.hitApplied = false;
    },
    []
  );

  const update = useCallback(
    (dt: number, now: number) => {
      const w = world.current;
      const { player, enemy } = w;
      const groundLimit = w.arenaW - w.spriteW;

      /* ---- player input ---- */
      player.x += w.input.dir * TUNING.playerSpeed * dt;
      if (w.input.jump && player.y === 0) {
        player.vy = TUNING.jump;
      }
      w.input.jump = false;
      if (w.input.attack) {
        tryAttack(player, enemy, now);
        w.input.attack = false;
      }

      /* ---- enemy AI ---- */
      const dist = centerX(player) - centerX(enemy);
      const absDist = Math.abs(dist);
      if (now >= w.ai.nextDecision) {
        w.ai.nextDecision = now + 280 + Math.random() * 520;
        if (absDist > TUNING.attackRange * 0.92) {
          w.ai.dir = dist > 0 ? 1 : -1; // chase
          w.ai.wantJump = Math.random() < 0.18;
        } else {
          // in range: attack, sometimes reposition
          const r = Math.random();
          if (r < 0.6) {
            w.ai.dir = 0;
            tryAttack(enemy, player, now);
          } else if (r < 0.8) {
            w.ai.dir = dist > 0 ? -1 : 1; // back off
            w.ai.wantJump = Math.random() < 0.3;
          } else {
            w.ai.dir = dist > 0 ? 1 : -1;
          }
        }
      }
      enemy.x += w.ai.dir * TUNING.enemySpeed * dt;
      if (w.ai.wantJump && enemy.y === 0) {
        enemy.vy = TUNING.jump;
        w.ai.wantJump = false;
      }

      /* ---- gravity ---- */
      for (const e of [player, enemy]) {
        e.vy -= TUNING.gravity * dt;
        e.y += e.vy * dt;
        if (e.y <= 0) {
          e.y = 0;
          e.vy = 0;
        }
      }

      /* ---- bounds + separation ---- */
      player.x = Math.max(0, Math.min(groundLimit, player.x));
      enemy.x = Math.max(0, Math.min(groundLimit, enemy.x));
      const gap = centerX(enemy) - centerX(player);
      if (Math.abs(gap) < TUNING.minGap) {
        const push = (TUNING.minGap - Math.abs(gap)) / 2;
        const s = gap >= 0 ? 1 : -1;
        player.x -= s * push;
        enemy.x += s * push;
        player.x = Math.max(0, Math.min(groundLimit, player.x));
        enemy.x = Math.max(0, Math.min(groundLimit, enemy.x));
      }

      /* ---- facing ---- */
      player.facing = centerX(enemy) >= centerX(player) ? 1 : -1;
      enemy.facing = centerX(player) <= centerX(enemy) ? -1 : 1;

      /* ---- resolve attacks (damage lands mid-swing) ---- */
      const resolve = (
        atk: Entity,
        def: Entity,
        ref: React.RefObject<HTMLDivElement | null>,
        defRef: React.RefObject<HTMLDivElement | null>,
        dmgRange: [number, number],
        color: string
      ) => {
        if (atk.attackStart === 0) return;
        const elapsed = now - atk.attackStart;
        if (elapsed >= TUNING.attackWindup && !atk.hitApplied) {
          atk.hitApplied = true;
          triggerAttackPose(ref);
          const inRange = Math.abs(centerX(atk) - centerX(def)) <= TUNING.attackRange;
          const facingDef =
            (atk.facing === 1 && centerX(def) >= centerX(atk)) ||
            (atk.facing === -1 && centerX(def) <= centerX(atk));
          if (inRange && facingDef) {
            const dmg =
              Math.floor(Math.random() * (dmgRange[1] - dmgRange[0] + 1)) +
              dmgRange[0];
            def.hp = Math.max(0, def.hp - dmg);
            flashHit(defRef);
            shakeStage();
            spawnFloatingDamage(centerX(def), def.y + 150, dmg, color);
          }
        }
        if (elapsed >= TUNING.attackActive) atk.attackStart = 0;
      };

      resolve(player, enemy, playerRef, enemyRef, [9, 15], "#fca5a5");
      resolve(enemy, player, enemyRef, playerRef, [6, 11], "#fcd34d");

      /* ---- win / lose ---- */
      if (enemy.hp <= 0) {
        w.running = false;
        setStatus("win");
      } else if (player.hp <= 0) {
        w.running = false;
        setStatus("lose");
      }
    },
    [centerX, flashHit, shakeStage, spawnFloatingDamage, triggerAttackPose, tryAttack]
  );

  const loop = useCallback(
    (t: number) => {
      const w = world.current;
      if (!w.running) return;
      if (!w.last) w.last = t;
      const dt = Math.min((t - w.last) / 16.6667, 2.2);
      w.last = t;
      update(dt, t);
      render();
      rafRef.current = requestAnimationFrame(loop);
    },
    [render, update]
  );

  const startFight = useCallback(() => {
    resetWorld();
    render();
    setStatus("fighting");
  }, [render, resetWorld]);

  // Run loop while fighting
  useEffect(() => {
    if (status !== "fighting") return;
    const w = world.current;
    w.running = true;
    w.last = 0;
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      w.running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, loop]);

  // Keyboard controls
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const w = world.current;
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          w.input.dir = -1;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          w.input.dir = 1;
          break;
        case "ArrowUp":
        case "w":
        case "W":
        case " ":
          w.input.jump = true;
          break;
        case "j":
        case "J":
        case "f":
        case "F":
          w.input.attack = true;
          break;
      }
    };
    const up = (e: KeyboardEvent) => {
      const w = world.current;
      if (["ArrowLeft", "a", "A", "ArrowRight", "d", "D"].includes(e.key)) {
        w.input.dir = 0;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Keep measurements fresh
  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (arenaRef.current) ro.observe(arenaRef.current);
    return () => ro.disconnect();
  }, [measure]);

  /* --------------------------- control API --------------------------- */
  const setDir = useCallback((dir: number) => {
    world.current.input.dir = dir;
  }, []);
  const doJump = useCallback(() => {
    world.current.input.jump = true;
  }, []);
  const doAttack = useCallback(() => {
    world.current.input.attack = true;
  }, []);

  /* ------------------------------ view ------------------------------ */

  return (
    <section
      id="game"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-black to-zinc-950 text-center overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div
          ref={header.ref}
          className={`reveal ${header.visible ? "is-visible" : ""} mb-8 sm:mb-10`}
        >
          <span className="inline-flex items-center gap-2 text-yellow-500 text-xs sm:text-sm tracking-widest uppercase font-semibold">
            <Gamepad2 className="w-4 h-4" />
            Real-Time Prototype
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 tracking-widest bg-gradient-to-b from-white via-yellow-100 to-yellow-600 bg-clip-text text-transparent">
            ARENA COMBAT PREVIEW
          </h2>
          <p className="text-gray-400 mt-3 text-sm sm:text-base max-w-md mx-auto text-pretty">
            Move, leap, and strike in real time. Outmaneuver the AI rival in the
            frozen colosseum.
          </p>
          <div className="w-20 h-1 bg-yellow-500 mx-auto mt-6 rounded-full" />
        </div>

        {/* Battle frame */}
        <div
          ref={frame.ref}
          className={`reveal ${frame.visible ? "is-visible" : ""} relative mx-auto max-w-5xl border border-yellow-500 rounded-2xl p-3 sm:p-5 bg-black/80 backdrop-blur-sm shadow-[0_0_30px_rgba(212,175,55,0.3)]`}
        >
          {/* Corner brackets */}
          <span className="pointer-events-none absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-yellow-500/70 rounded-tl-2xl" />
          <span className="pointer-events-none absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-yellow-500/70 rounded-tr-2xl" />
          <span className="pointer-events-none absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-yellow-500/70 rounded-bl-2xl" />
          <span className="pointer-events-none absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-yellow-500/70 rounded-br-2xl" />

          {/* HP HUD */}
          <div className="flex items-center justify-between gap-3 sm:gap-6 mb-3 px-1">
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs sm:text-sm font-bold tracking-wider text-emerald-400 truncate">
                BEARCLAW
              </p>
              <div className="mt-1 h-2.5 sm:h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-emerald-500/30">
                <div
                  ref={playerHpRef}
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-[width] duration-150"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div className="text-yellow-400 font-extrabold text-base sm:text-xl shrink-0">
              VS
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-xs sm:text-sm font-bold tracking-wider text-red-400 truncate">
                SKULLBEAK
              </p>
              <div className="mt-1 h-2.5 sm:h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-red-500/30">
                <div
                  ref={enemyHpRef}
                  className="h-full bg-gradient-to-l from-red-500 to-rose-400 transition-[width] duration-150 ml-auto"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* ARENA STAGE */}
          <div
            ref={stageRef}
            className="relative h-[360px] sm:h-[460px] rounded-xl border border-zinc-700 overflow-hidden select-none"
          >
            {/* Parallax background */}
            <img
              src="/arena.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/50" />
            <div className="absolute inset-0 shadow-[inset_0_0_120px_30px_rgba(0,0,0,0.7)] pointer-events-none" />

            {/* Snow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/50 rounded-full animate-snowfall"
                  style={{
                    left: `${(i * 11 + 5) % 100}%`,
                    animationDelay: `${i * 0.7}s`,
                    animationDuration: `${6 + (i % 3) * 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Ground strip */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-14 left-0 right-0 h-px bg-yellow-500/20" />

            {/* Fighters layer */}
            <div className="absolute inset-0 pb-14">
              <div className="absolute bottom-0 left-0 w-full h-full">
                {/* Player */}
                <div
                  ref={playerRef}
                  className="arena-fighter absolute bottom-0 left-0 w-24 sm:w-32 will-change-transform"
                  style={{ transform: "translate3d(160px,0,0)" }}
                >
                  <div className="relative">
                    <img
                      src="/owl-player.png"
                      alt="Bearclaw, the player's Viking owl"
                      className="w-24 sm:w-32 h-auto object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.45)]"
                      draggable={false}
                    />
                    <span className="arena-slash pointer-events-none absolute top-1/3 right-0 translate-x-1/2 text-emerald-300/90 text-3xl font-black">
                      ⟫
                    </span>
                    {/* ground shadow */}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/50 blur-md rounded-[50%]" />
                  </div>
                </div>

                {/* Enemy */}
                <div
                  ref={enemyRef}
                  className="arena-fighter absolute bottom-0 left-0 w-24 sm:w-32 will-change-transform"
                  style={{ transform: "translate3d(520px,0,0)" }}
                >
                  <div className="relative">
                    <img
                      src="/owl-enemy.png"
                      alt="Skullbeak, the enemy Viking owl"
                      className="w-24 sm:w-32 h-auto object-contain drop-shadow-[0_0_12px_rgba(239,68,68,0.45)]"
                      draggable={false}
                    />
                    <span className="arena-slash pointer-events-none absolute top-1/3 right-0 translate-x-1/2 text-red-300/90 text-3xl font-black">
                      ⟫
                    </span>
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/50 blur-md rounded-[50%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* FX layer (floating damage) */}
            <div
              ref={fxLayerRef}
              className="absolute inset-0 pb-14 pointer-events-none"
            />

            {/* Overlays */}
            {status !== "fighting" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-center px-6">
                {status === "ready" && (
                  <>
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-widest text-white">
                      ENTER THE ARENA
                    </h3>
                    <p className="text-gray-400 text-sm mt-2 max-w-sm">
                      Defeat Skullbeak in real-time combat.
                    </p>
                  </>
                )}
                {status === "win" && (
                  <h3 className="text-2xl sm:text-4xl font-extrabold tracking-widest text-emerald-400 drop-shadow">
                    VICTORY
                  </h3>
                )}
                {status === "lose" && (
                  <h3 className="text-2xl sm:text-4xl font-extrabold tracking-widest text-red-400 drop-shadow">
                    DEFEATED
                  </h3>
                )}
                <button
                  onClick={startFight}
                  className="mt-6 px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:scale-105 transition-transform duration-200 shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                >
                  {status === "ready" ? "FIGHT" : "REMATCH"}
                </button>
              </div>
            )}
          </div>

          {/* ON-SCREEN CONTROLS */}
          <div className="mt-4 flex items-center justify-between gap-4">
            {/* Joystick (left) */}
            <Joystick onChange={setDir} disabled={status !== "fighting"} />

            {/* keyboard hint (desktop) */}
            <p className="hidden md:block text-[11px] text-gray-500 leading-relaxed text-center">
              <span className="text-gray-300 font-semibold">A / D</span> move
              <span className="mx-2">·</span>
              <span className="text-gray-300 font-semibold">W / Space</span> jump
              <span className="mx-2">·</span>
              <span className="text-gray-300 font-semibold">J</span> attack
            </p>

            {/* Action buttons (right) */}
            <div className="flex items-end gap-3">
              <button
                onPointerDown={doJump}
                disabled={status !== "fighting"}
                aria-label="Jump"
                className="w-14 h-14 rounded-full border-2 border-sky-400 text-sky-300 flex items-center justify-center bg-sky-500/10 active:scale-90 transition-transform disabled:opacity-40"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              <button
                onPointerDown={doAttack}
                disabled={status !== "fighting"}
                aria-label="Attack"
                className="w-20 h-20 rounded-full border-2 border-yellow-500 text-black font-bold flex flex-col items-center justify-center bg-yellow-500 active:scale-90 transition-transform disabled:opacity-40 shadow-[0_0_20px_rgba(212,175,55,0.35)]"
              >
                <Swords className="w-7 h-7" />
                <span className="text-[10px] tracking-wider mt-0.5">HIT</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ----------------------- Virtual Joystick ------------------------- */

function Joystick({
  onChange,
  disabled,
}: {
  onChange: (dir: number) => void;
  disabled: boolean;
}) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  const activeId = useRef<number | null>(null);

  const reset = useCallback(() => {
    if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
    onChange(0);
  }, [onChange]);

  const handleMove = useCallback(
    (clientX: number) => {
      const base = baseRef.current;
      if (!base) return;
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const max = rect.width / 2;
      let dx = clientX - cx;
      dx = Math.max(-max, Math.min(max, dx));
      if (knobRef.current) {
        knobRef.current.style.transform = `translate(${dx}px, 0px)`;
      }
      const norm = dx / max;
      onChange(Math.abs(norm) < 0.18 ? 0 : norm > 0 ? 1 : -1);
    },
    [onChange]
  );

  return (
    <div
      ref={baseRef}
      onPointerDown={(e) => {
        if (disabled) return;
        activeId.current = e.pointerId;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        handleMove(e.clientX);
      }}
      onPointerMove={(e) => {
        if (disabled || activeId.current !== e.pointerId) return;
        handleMove(e.clientX);
      }}
      onPointerUp={(e) => {
        if (activeId.current !== e.pointerId) return;
        activeId.current = null;
        reset();
      }}
      onPointerCancel={() => {
        activeId.current = null;
        reset();
      }}
      className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-zinc-700 bg-zinc-900/70 touch-none shrink-0 ${
        disabled ? "opacity-40" : ""
      }`}
      aria-label="Movement joystick"
      role="slider"
      aria-valuemin={-1}
      aria-valuemax={1}
      aria-valuenow={0}
    >
      <span className="absolute inset-0 flex items-center justify-between px-2 text-zinc-600 text-xs pointer-events-none">
        <span>◄</span>
        <span>►</span>
      </span>
      <div
        ref={knobRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-yellow-500/90 border-2 border-yellow-300 shadow-lg pointer-events-none"
        style={{ transform: "translate(0px,0px)" }}
      />
    </div>
  );
}

export default GamePreview;
