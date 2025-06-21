import { useEffect, useMemo, useState } from "react";
import { Sparkle } from "lucide-react";
import { loadFull } from "tsparticles";

import type { ISourceOptions } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";

const options: ISourceOptions = {
  key: "star",
  name: "Star",
  particles: {
    number: {
      value: 20,
      density: {
        enable: false,
      },
    },
    color: {
      value: ["#F3F3E0", "#27548A", "#183B4E", "#DDA853"],
    },
    shape: {
      type: "star",
      options: {
        star: {
          sides: 4,
        },
      },
    },
    opacity: {
      value: 0.8,
    },
    size: {
      value: { min: 1, max: 4 },
    },
    rotate: {
      value: {
        min: 0,
        max: 360,
      },
      enable: true,
      direction: "clockwise",
      animation: {
        enable: true,
        speed: 10,
        sync: false,
      },
    },
    links: {
      enable: false,
    },
    reduceDuplicates: true,
    move: {
      enable: true,
      center: {
        x: 120,
        y: 45,
      },
    },
  },
  interactivity: {
    events: {},
  },
  smooth: true,
  fpsLimit: 120,
  background: {
    color: "transparent",
    size: "cover",
  },
  fullScreen: {
    enable: false,
  },
  detectRetina: true,
  absorbers: [
    {
      enable: true,
      opacity: 0,
      size: {
        value: 1,
        density: 1,
        limit: {
          radius: 5,
          mass: 5,
        },
      },
      position: {
        x: 110,
        y: 45,
      },
    },
  ],
  emitters: [
    {
      autoPlay: true,
      fill: true,
      life: {
        wait: true,
      },
      rate: {
        quantity: 5,
        delay: 0.5,
      },
      position: {
        x: 110,
        y: 45,
      },
    },
  ],
};

interface AiButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export default function AiButton({ children, onClick }: AiButtonProps) {
  const [particleState, setParticlesReady] = useState<"loaded" | "ready">();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setParticlesReady("loaded");
    });
  }, []);

  const modifiedOptions = useMemo(() => {
    options.autoPlay = isHovering;
    return options;
  }, [isHovering]);

  return (
    <button
      className="group relative my-8 rounded-full bg-gradient-to-r from-[#27548A]/30 via-[#DDA853]/30 via-40% to-[#183B4E]/30 p-1 text-white transition-transform hover:scale-110 active:scale-105"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
    >
      <div className="relative flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0f172a] via-[#9c9ea0] via-50% to-[#0f172a] px-4 py-2 text-white">
        <Sparkle className="size-6 -translate-y-0.5 animate-sparkle fill-white" />
        <Sparkle
          style={{
            animationDelay: "1s",
          }}
          className="absolute bottom-2.5 left-3.5 z-20 size-2 rotate-12 animate-sparkle fill-white"
        />
        <Sparkle
          style={{
            animationDelay: "1.5s",
            animationDuration: "2.5s",
          }}
          className="absolute left-5 top-2.5 size-1 -rotate-12 animate-sparkle fill-white"
        />
        <Sparkle
          style={{
            animationDelay: "0.5s",
            animationDuration: "2.5s",
          }}
          className="absolute left-3 top-3 size-1.5 animate-sparkle fill-white"
        />

        <span className="font-semibold">{children}</span>
      </div>
      {!!particleState && (
        <Particles
          id="whatever"
          className={`pointer-events-none absolute -bottom-4 -left-4 -right-4 -top-4 z-0 opacity-0 transition-opacity ${particleState === "ready" ? "group-hover:opacity-100" : ""}`}
          particlesLoaded={async () => {
            setParticlesReady("ready");
          }}
          options={modifiedOptions}
        />
      )}
    </button>
  );
}

