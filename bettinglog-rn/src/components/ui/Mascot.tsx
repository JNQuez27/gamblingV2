// src/components/ui/Mascot.tsx
//
// "Drip" - the app's mascot: a serene water-drop with closed eyes and a
// growth sprout (water for the wave logo, the sprout for growing one day at a
// time). Shared by the diary journey map and the onboarding flow.
import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

export default function Mascot({ size = 54 }: { size?: number }) {
  const gid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <SvgGradient id={`mascotBody${gid}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#7ab5e8" />
          <Stop offset="1" stopColor="#4a8bc7" />
        </SvgGradient>
      </Defs>
      {/* sprout */}
      <Path d="M32 12 L32 7" stroke="#4f9a74" strokeWidth="2" strokeLinecap="round" />
      <Path d="M32 8 C32 4 34 1.5 38 1 C38 5 36 7.5 32 8" fill="#7ab89a" />
      <Path d="M32 8 C32 4 30 1.5 26 1 C26 5 28 7.5 32 8" fill="#9ccbb2" />
      {/* body */}
      <Path
        d="M32 12 C46 12 54 24 54 37 C54 50 44 58 32 58 C20 58 10 50 10 37 C10 24 18 12 32 12 Z"
        fill={`url(#mascotBody${gid})`}
      />
      {/* highlight */}
      <Circle cx="24" cy="24" r="5" fill="#ffffff" fillOpacity="0.35" />
      {/* calm closed eyes */}
      <Path d="M22 36 Q25 39 28 36" stroke="#1e3a5c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Path d="M36 36 Q39 39 42 36" stroke="#1e3a5c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* smile */}
      <Path d="M28 45 Q32 49 36 45" stroke="#1e3a5c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* blush */}
      <Circle cx="19" cy="42" r="3" fill="#f0a8a8" fillOpacity="0.55" />
      <Circle cx="45" cy="42" r="3" fill="#f0a8a8" fillOpacity="0.55" />
    </Svg>
  );
}
