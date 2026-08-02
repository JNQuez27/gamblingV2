// src/components/ui/icons.tsx
//
// Shared outline icon set (feather/lucide-style strokes). The app's design
// language uses these instead of emoji - one consistent stroke weight and the
// palette's colors, so every screen reads clean and professional.
import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const D = { size: 20, color: '#2d3748', strokeWidth: 2 };

function frameProps({ size = D.size, color = D.color, strokeWidth = D.strokeWidth }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export function IconFlame(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Svg>
  );
}

export function IconWallet(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <Path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </Svg>
  );
}

export function IconBookOpen(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </Svg>
  );
}

export function IconActivity(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </Svg>
  );
}

export function IconShield(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

export function IconPhone(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
  );
}

export function IconHeart(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </Svg>
  );
}

export function IconLifeBuoy(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="10" />
      <Circle cx="12" cy="12" r="4" />
      <Path d="m4.93 4.93 4.24 4.24" />
      <Path d="m14.83 14.83 4.24 4.24" />
      <Path d="m14.83 9.17 4.24-4.24" />
      <Path d="m4.93 19.07 4.24-4.24" />
    </Svg>
  );
}

export function IconUsers(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

export function IconClipboard(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Rect x="8" y="2" width="8" height="4" rx="1" />
      <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <Path d="M12 11h4" />
      <Path d="M12 16h4" />
      <Path d="M8 11h.01" />
      <Path d="M8 16h.01" />
    </Svg>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M12 5v14" />
      <Path d="M5 12h14" />
    </Svg>
  );
}

export function IconX(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M18 6 6 18" />
      <Path d="m6 6 12 12" />
    </Svg>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}

export function IconCircle(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="9" />
    </Svg>
  );
}

export function IconCircleDot(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="9" />
      <Circle cx="12" cy="12" r="3" fill={p.color ?? D.color} />
    </Svg>
  );
}

export function IconTrophy(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <Path d="M4 22h16" />
      <Path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <Path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <Path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </Svg>
  );
}

export function IconAward(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="8" r="6" />
      <Path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </Svg>
  );
}

export function IconTarget(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="10" />
      <Circle cx="12" cy="12" r="6" />
      <Circle cx="12" cy="12" r="2" />
    </Svg>
  );
}

export function IconBanknote(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Rect x="2" y="6" width="20" height="12" rx="2" />
      <Circle cx="12" cy="12" r="2" />
      <Path d="M6 12h.01" />
      <Path d="M18 12h.01" />
    </Svg>
  );
}

export function IconTrendingDown(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M22 17l-8.5-8.5-5 5L2 7" />
      <Path d="M16 17h6v-6" />
    </Svg>
  );
}

export function IconChevronRight(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="m9 18 6-6-6-6" />
    </Svg>
  );
}

export function IconCalendarCheck(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Rect x="3" y="4" width="18" height="18" rx="2" />
      <Path d="M16 2v4" />
      <Path d="M8 2v4" />
      <Path d="M3 10h18" />
      <Path d="m9 16 2 2 4-4" />
    </Svg>
  );
}

export function IconBulb(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <Path d="M9 18h6" />
      <Path d="M10 22h4" />
    </Svg>
  );
}

export function IconMoon(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Svg>
  );
}

export function IconLeaf(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <Path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </Svg>
  );
}

export function IconSprout(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M7 20h10" />
      <Path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <Path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <Path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </Svg>
  );
}

export function IconBarChart(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M12 20V10" />
      <Path d="M18 20V4" />
      <Path d="M6 20v-4" />
    </Svg>
  );
}

export function IconClock(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 6v6l4 2" />
    </Svg>
  );
}

export function IconBell(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  );
}

export function IconPencil(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </Svg>
  );
}

export function IconMessage(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

export function IconSunrise(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M12 2v8" />
      <Path d="m4.93 10.93 1.41 1.41" />
      <Path d="M2 18h2" />
      <Path d="M20 18h2" />
      <Path d="m19.07 10.93-1.41 1.41" />
      <Path d="M22 22H2" />
      <Path d="m8 6 4-4 4 4" />
      <Path d="M16 18a4 4 0 0 0-8 0" />
    </Svg>
  );
}

export function IconBus(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M8 6v6" />
      <Path d="M16 6v6" />
      <Path d="M2 12h20" />
      <Path d="M18 18h1a2 2 0 0 0 2-2v-6a8 7 0 0 0-16 0v6a2 2 0 0 0 2 2h1" />
      <Path d="M9 18h6" />
      <Circle cx="7" cy="18" r="2" />
      <Circle cx="17" cy="18" r="2" />
    </Svg>
  );
}

export function IconBowl(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M4 11h16a8 8 0 0 1-16 0Z" />
      <Path d="M9 7c0-1 .5-1.5 1-2" />
      <Path d="M14 7c0-1 .5-1.5 1-2" />
    </Svg>
  );
}

export function IconUtensils(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <Path d="M7 2v20" />
      <Path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </Svg>
  );
}

export function IconCoffee(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M10 2v2" />
      <Path d="M14 2v2" />
      <Path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
      <Path d="M6 2v2" />
    </Svg>
  );
}

export function IconSmartphone(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Rect x="7" y="2" width="10" height="20" rx="2" />
      <Path d="M12 18h.01" />
    </Svg>
  );
}

export function IconFilm(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Rect x="3" y="3" width="18" height="18" rx="2" />
      <Path d="M7 3v18" />
      <Path d="M17 3v18" />
      <Path d="M3 12h18" />
      <Path d="M3 7.5h4" />
      <Path d="M3 16.5h4" />
      <Path d="M17 7.5h4" />
      <Path d="M17 16.5h4" />
    </Svg>
  );
}

export function IconCart(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="8" cy="21" r="1" />
      <Circle cx="19" cy="21" r="1" />
      <Path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </Svg>
  );
}

export function IconZap(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  );
}

export function IconDice(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Rect x="3" y="3" width="18" height="18" rx="3" />
      <Path d="M8 8h.01" />
      <Path d="M16 8h.01" />
      <Path d="M8 16h.01" />
      <Path d="M16 16h.01" />
      <Path d="M12 12h.01" />
    </Svg>
  );
}

export function IconHome(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Path d="M9 22V12h6v10" />
    </Svg>
  );
}

export function IconWind(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <Path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <Path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </Svg>
  );
}

export function IconWaves(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <Path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <Path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </Svg>
  );
}

export function IconExternalLink(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M15 3h6v6" />
      <Path d="M10 14 21 3" />
      <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </Svg>
  );
}

export function IconMinus(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M5 12h14" />
    </Svg>
  );
}

export function IconUser(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

export function IconLock(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Rect x="3" y="11" width="18" height="11" rx="2" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  );
}

export function IconGlobe(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M2 12h20" />
      <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Svg>
  );
}

export function IconDownload(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <Path d="M7 10l5 5 5-5" />
      <Path d="M12 15V3" />
    </Svg>
  );
}

export function IconHelpCircle(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <Path d="M12 17h.01" />
    </Svg>
  );
}

export function IconStar(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
    </Svg>
  );
}

export function IconLogOut(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Path d="M16 17l5-5-5-5" />
      <Path d="M21 12H9" />
    </Svg>
  );
}

export function IconTrash(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Path d="M3 6h18" />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <Path d="M10 11v6" />
      <Path d="M14 11v6" />
    </Svg>
  );
}

// ── Mood faces ───────────────────────────────────────────────────────────────

export function IconFaceGreat(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z" />
      <Path d="M9 9h.01" />
      <Path d="M15 9h.01" />
    </Svg>
  );
}

export function IconFaceGood(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <Path d="M9 9h.01" />
      <Path d="M15 9h.01" />
    </Svg>
  );
}

export function IconFaceOkay(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M8 15h8" />
      <Path d="M9 9h.01" />
      <Path d="M15 9h.01" />
    </Svg>
  );
}

export function IconFaceLow(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M9 15.5c.8-.5 1.9-.8 3-.8s2.2.3 3 .8" />
      <Path d="M9 9h.01" />
      <Path d="M15 9h.01" />
    </Svg>
  );
}

export function IconFaceStruggling(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <Path d="M9 9h.01" />
      <Path d="M15 9h.01" />
    </Svg>
  );
}

export function IconFaceTempted(p: IconProps) {
  return (
    <Svg {...frameProps(p)}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="m8 15 1.3-1 1.4 1 1.3-1 1.4 1 1.3-1 1.3 1" />
      <Path d="M9 9h.01" />
      <Path d="M15 9h.01" />
    </Svg>
  );
}
