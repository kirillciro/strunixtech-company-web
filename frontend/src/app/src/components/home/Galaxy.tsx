"use client";

import type { CSSProperties } from "react";

type GalaxyProps = {
  starSpeed?: number;
  density?: number;
  hueShift?: number;
  speed?: number;
  glowIntensity?: number;
  saturation?: number;
  mouseRepulsion?: boolean;
  repulsionStrength?: number;
  twinkleIntensity?: number;
  rotationSpeed?: number;
  transparent?: boolean;
  className?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function Galaxy({
  starSpeed = 0.4,
  density = 0.6,
  hueShift = 60,
  speed = 1,
  saturation = 0,
  twinkleIntensity = 0.7,
  transparent = true,
  className,
}: GalaxyProps) {
  const style = {
    "--galaxy-star-speed": String(clamp(starSpeed, 0.15, 2)),
    "--galaxy-density": String(clamp(density, 0.2, 1.4)),
    "--galaxy-hue-shift": `${hueShift}deg`,
    "--galaxy-speed": String(clamp(speed, 0.2, 2)),
    "--galaxy-twinkle": String(clamp(twinkleIntensity, 0.2, 1.4)),
    "--galaxy-saturation": String(clamp(saturation + 1, 0.2, 2.5)),
    "--galaxy-transparent": transparent ? "transparent" : "#020617",
  } as CSSProperties;

  return (
    <div className={`hero-galaxy-shell ${className ?? ""}`.trim()} style={style}>
      <div className="hero-galaxy" />
      <div className="hero-comets" aria-hidden="true">
        <span className="hero-planet planet-a" />
        <span className="hero-planet planet-b" />
        <span className="hero-comet comet-a" />
        <span className="hero-comet comet-b" />
        <span className="hero-comet comet-c" />
        <span className="hero-comet comet-d" />
        <span className="hero-comet comet-e" />
      </div>
    </div>
  );
}
