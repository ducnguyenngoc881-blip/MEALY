import React, { useMemo } from 'react';
import { calculateNextWheelAngle } from '../utils/rouletteMath';

export { calculateNextWheelAngle };

export interface WheelSegment {
  id: string | number;
  label: string;
  sublabel?: string;
  color: string;
  textColor?: string;
}

interface RouletteWheelProps {
  segments: WheelSegment[];
  isSpinning: boolean;
  rotationAngle: number; // in degrees
  onSpin: () => void;
  disabled?: boolean;
  size?: number;
  centerLabel?: string;
  isResultHighlighted?: boolean;
  selectedIndex?: number | null;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  segments,
  isSpinning,
  rotationAngle,
  onSpin,
  disabled = false,
  size = 300,
  centerLabel = 'QUAY',
  isResultHighlighted = false,
  selectedIndex = null,
}) => {
  const radius = size / 2;
  const center = radius;
  const wheelRadius = radius - 14; // margin for outer rim & pegs

  const totalSegments = Math.max(segments.length, 1);
  const anglePerSegment = 360 / totalSegments;

  // Generate SVG path for each wedge
  const wedges = useMemo(() => {
    return segments.map((seg, index) => {
      const startAngle = (index * anglePerSegment - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * anglePerSegment - 90) * (Math.PI / 180);

      const x1 = center + wheelRadius * Math.cos(startAngle);
      const y1 = center + wheelRadius * Math.sin(startAngle);
      const x2 = center + wheelRadius * Math.cos(endAngle);
      const y2 = center + wheelRadius * Math.sin(endAngle);

      const largeArc = anglePerSegment > 180 ? 1 : 0;
      const pathData = totalSegments === 1
        ? `M ${center},${center} m -${wheelRadius},0 a ${wheelRadius},${wheelRadius} 0 1,0 ${wheelRadius * 2},0 a ${wheelRadius},${wheelRadius} 0 1,0 -${wheelRadius * 2},0`
        : `M ${center},${center} L ${x1},${y1} A ${wheelRadius},${wheelRadius} 0 ${largeArc},1 ${x2},${y2} Z`;

      // Calculate label rotation angle and position
      const midAngleDeg = index * anglePerSegment + anglePerSegment / 2;
      const midAngleRad = (midAngleDeg - 90) * (Math.PI / 180);
      
      // Text position approx 62% out from center
      const textRadius = wheelRadius * 0.62;
      const tx = center + textRadius * Math.cos(midAngleRad);
      const ty = center + textRadius * Math.sin(midAngleRad);

      return {
        ...seg,
        pathData,
        midAngleDeg,
        tx,
        ty,
        index
      };
    });
  }, [segments, totalSegments, anglePerSegment, center, wheelRadius]);

  // Outer border studs/pegs
  const studs = useMemo(() => {
    const numStuds = Math.max(totalSegments * 2, 12);
    const studList = [];
    const studRadius = radius - 7;
    for (let i = 0; i < numStuds; i++) {
      const a = (i * (360 / numStuds) - 90) * (Math.PI / 180);
      studList.push({
        x: center + studRadius * Math.cos(a),
        y: center + studRadius * Math.sin(a),
      });
    }
    return studList;
  }, [totalSegments, radius, center]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2 w-full max-w-[290px] mx-auto">
      {/* Outer Flat Halo */}
      <div 
        className="absolute rounded-full bg-blue-500/10 blur-xl transition-opacity pointer-events-none"
        style={{ width: '100%', maxWidth: size + 20, height: 'auto', aspectRatio: '1/1' }}
      />

      {/* Top Pointer / Flapper Indicator */}
      <div 
        className="absolute top-0 z-30 flex flex-col items-center pointer-events-none"
        style={{ transform: 'translateY(-2px)' }}
      >
        <div className="relative">
          {/* Outer flapper shadow */}
          <div className="w-6 h-8 bg-amber-500 rounded-b-full shadow-lg border-2 border-white flex items-center justify-center -translate-y-1">
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-inner" />
          </div>
          {/* Arrow tip pointing down */}
          <div 
            className="w-0 h-0 border-x-[10px] border-x-transparent border-t-[14px] border-t-amber-500 drop-shadow-md -mt-1 mx-auto"
          />
        </div>
      </div>

      {/* Interactive SVG Wheel */}
      <div 
        className="relative cursor-pointer transition-transform w-full flex items-center justify-center"
        onClick={!disabled && !isSpinning ? onSpin : undefined}
        title={!disabled && !isSpinning ? 'Chạm để quay!' : undefined}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-auto max-w-[290px] overflow-visible"
          style={{ maxWidth: size, aspectRatio: '1/1' }}
        >
          <defs>
            {/* Drop Shadow Filter */}
            <filter id="wheelShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Outer Flat Matte Cobalt Rim */}
          <circle
            cx={center}
            cy={center}
            r={radius - 2}
            fill="#1e293b"
            stroke="#1d4ed8"
            strokeWidth="8"
            filter="url(#wheelShadow)"
          />

          {/* Golden Studs / Pegs around Rim */}
          {studs.map((stud, idx) => (
            <circle
              key={idx}
              cx={stud.x}
              cy={stud.y}
              r="2.5"
              fill="#fbbf24"
              stroke="#78350f"
              strokeWidth="0.8"
            />
          ))}

          {/* ROTATING WHEEL GROUP */}
          <g
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transformOrigin: `${center}px ${center}px`,
              transformBox: 'view-box',
              transition: isSpinning ? 'transform 4.5s cubic-bezier(0.12, 0.98, 0.22, 1.0)' : 'none',
            }}
          >
            {/* Segment Wedges */}
            {wedges.map((seg) => {
              const isSelected = isResultHighlighted && selectedIndex === seg.index;
              return (
                <g key={seg.id}>
                  <path
                    d={seg.pathData}
                    fill={seg.color}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? '3' : '1.5'}
                    opacity={isSelected ? 1 : 0.95}
                    className="transition-all duration-300"
                  />
                  {/* Text Label on Slice */}
                  <g
                    transform={`translate(${seg.tx}, ${seg.ty}) rotate(${seg.midAngleDeg + 90})`}
                  >
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={seg.textColor || '#ffffff'}
                      fontWeight="bold"
                      fontSize={totalSegments > 8 ? '10.5' : totalSegments > 5 ? '12' : '13.5'}
                      className="select-none font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                    >
                      {seg.label}
                    </text>
                    {seg.sublabel && (
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        y={totalSegments > 8 ? 10 : 13}
                        fill={seg.textColor || '#ffffff'}
                        fontWeight="normal"
                        fontSize={totalSegments > 8 ? '8' : '9.5'}
                        opacity="0.9"
                        className="select-none font-sans drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]"
                      >
                        {seg.sublabel}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </g>

          {/* INNER CENTER SPIN HUB */}
          <g 
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled && !isSpinning) onSpin();
            }}
          >
            {/* Center Hub Shadow & Outer Ring */}
            <circle
              cx={center}
              cy={center}
              r="34"
              fill="#0f172a"
              stroke="#fbbf24"
              strokeWidth="3.5"
              filter="url(#wheelShadow)"
            />
            {/* Inner Flat Matte Cobalt Button */}
            <circle
              cx={center}
              cy={center}
              r="28"
              fill="#1d4ed8"
              className="group-hover:fill-[#2563eb] transition-colors"
            />
            {/* Center Knob Text */}
            <text
              x={center}
              y={center - 3}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              fontWeight="900"
              fontSize="12"
              className="tracking-wider uppercase font-sans pointer-events-none"
            >
              {isSpinning ? '...' : centerLabel}
            </text>
            <text
              x={center}
              y={center + 10}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#93c5fd"
              fontWeight="bold"
              fontSize="8.5"
              className="tracking-tighter uppercase font-sans pointer-events-none"
            >
              {isSpinning ? 'ĐANG QUAY' : 'CHẠM'}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
