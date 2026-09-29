"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type BgHeart = {
  id: number;
  left: number;
  size: number;
  duration: number;
  emoji: string;
};

type ClickHeart = {
  id: number;
  x: number;
  y: number;
  emoji: string;
};

export default function SorpresaPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [bgHearts, setBgHearts] = useState<BgHeart[]>([]);
  const [clickHearts, setClickHearts] = useState<ClickHeart[]>([]);

  /* ---------- Corazones flotantes de fondo ---------- */
  useEffect(() => {
    const emojis = ["💗", "💕", "💖", "🌸", "✨", "💞"];

    const spawn = () => {
      setBgHearts((prev) => [
        ...prev.slice(-24),
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 100,
          size: 12 + Math.random() * 22,
          duration: 9 + Math.random() * 12,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
        },
      ]);
    };

    for (let i = 0; i < 12; i++) setTimeout(spawn, i * 300);
    const interval = setInterval(spawn, 1100);
    return () => clearInterval(interval);
  }, []);

  /* ---------- Corazón al hacer clic en cualquier parte ---------- */
  useEffect(() => {
    const emojis = ["💖", "💕", "💗", "✨"];

    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const id = Date.now() + Math.random();
      setClickHearts((prev) => [
        ...prev,
        {
          id,
          x: e.clientX,
          y: e.clientY,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
        },
      ]);
      setTimeout(() => {
        setClickHearts((prev) => prev.filter((h) => h.id !== id));
      }, 1200);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function openLocation() {
    router.push(`/te_amo/${token}`);
  }

  return (
    <>
      {/* Fuentes Google */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&family=Poppins:wght@200;300;400;600&display=swap"
        rel="stylesheet"
      />

      {/* Corazones de fondo */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {bgHearts.map((h) => (
          <span
            key={h.id}
            className="absolute select-none"
            style={{
              left: `${h.left}vw`,
              bottom: "-70px",
              fontSize: `${h.size}px`,
              color: "#ff8fb8",
              animation: `sorpresa-subir ${h.duration}s linear forwards`,
            }}
          >
            {h.emoji}
          </span>
        ))}
      </div>

      {/* Corazones al hacer clic */}
      {clickHearts.map((h) => (
        <span
          key={h.id}
          className="pointer-events-none fixed z-[999] text-[22px]"
          style={{
            left: `${h.x}px`,
            top: `${h.y}px`,
            animation: "sorpresa-explota 1.1s ease-out forwards",
          }}
        >
          {h.emoji}
        </span>
      ))}

      <main
        className="relative z-10 flex min-h-screen items-center justify-center bg-gradient-to-br from-[#3d0f24] via-[#6d1b3f] to-[#93255a] px-6 py-10 text-[#ffd6e6]"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="w-full max-w-xl text-center">
          <div
            className="mb-6 text-[70px]"
            style={{
              animation: "sorpresa-latir 1.3s ease-in-out infinite",
              filter: "drop-shadow(0 0 25px rgba(255,120,170,.8))",
            }}
          >
            💗
          </div>

          <h1
            className="mb-4 text-[clamp(2.2rem,7vw,3.8rem)] font-bold leading-tight"
            style={{
              fontFamily: "'Dancing Script', cursive",
              color: "#ffd6e6",
              textShadow: "0 0 30px rgba(255,140,190,.7)",
            }}
          >
            Tengo una pequeña sorpresa para ti...
          </h1>

          <p className="mb-8 font-light text-[#ffb8d3]">
            Pero primero tienes que abrirla.
          </p>

          <button
            type="button"
            onClick={openLocation}
            className="sorpresa-btn"
          >
            Abrir mi sorpresa ❤️
          </button>
        </div>
      </main>

      {/* Estilos globales (animaciones + botón) */}
      <style jsx global>{`
        .sorpresa-btn {
          font-family: "Poppins", sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          padding: 15px 42px;
          border: none;
          border-radius: 60px;
          background: linear-gradient(135deg, #ff7eb3, #ff4f8b);
          color: #fff;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(255, 79, 139, 0.45);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .sorpresa-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 16px 40px rgba(255, 79, 139, 0.6);
        }
        .sorpresa-btn:active {
          transform: scale(0.97);
        }

        @keyframes sorpresa-latir {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.22);
          }
        }

        @keyframes sorpresa-flotar {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes sorpresa-subir {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.55;
          }
          85% {
            opacity: 0.55;
          }
          100% {
            transform: translateY(-115vh) rotate(360deg) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes sorpresa-explota {
          0% {
            transform: translate(-50%, -50%) scale(0.4);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -220%) scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}