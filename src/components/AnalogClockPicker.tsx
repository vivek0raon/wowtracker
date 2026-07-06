'use client';
import { useState, useRef, useEffect } from 'react';

interface AnalogClockPickerProps {
  time: string; // 'HH:MM'
  onChange: (time: string) => void;
}

export default function AnalogClockPicker({ time, onChange }: AnalogClockPickerProps) {
  const [mode, setMode] = useState<'hours' | 'minutes'>('hours');
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [hours, minutes] = time.split(':').map(Number);
  const isPM = hours >= 12;
  const displayHour = hours % 12 || 12;

  const handleTimeChange = (newHour: number, newMinute: number, pm: boolean) => {
    let h = newHour;
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
    const pad = (n: number) => n.toString().padStart(2, '0');
    onChange(`${pad(h)}:${pad(newMinute)}`);
  };

  const calculateValueFromAngle = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (mode === 'hours') {
      let h = Math.round(angle / 30);
      if (h === 0) h = 12;
      handleTimeChange(h, minutes, isPM);
    } else {
      let m = Math.round(angle / 6);
      if (m === 60) m = 0;
      handleTimeChange(displayHour, m, isPM);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    calculateValueFromAngle(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      calculateValueFromAngle(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    if (isDragging && mode === 'hours') {
      setMode('minutes');
    }
    setIsDragging(false);
  };

  useEffect(() => {
    const handleUp = () => {
      if (isDragging && mode === 'hours') {
        setMode('minutes');
      }
      setIsDragging(false);
    };
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  }, [isDragging, mode]);

  // Positions
  const radius = 95;
  const numbers = mode === 'hours' 
    ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const currentAngle = mode === 'hours' 
    ? (displayHour * 30 - 90) * (Math.PI / 180)
    : (minutes * 6 - 90) * (Math.PI / 180);

  const pointerX = 130 + radius * Math.cos(currentAngle);
  const pointerY = 130 + radius * Math.sin(currentAngle);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', userSelect: 'none' }}>
      
      {/* Digital Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(2.2rem, 8vw, 3rem)', fontWeight: 800, fontFamily: 'var(--font-geist-mono)' }}>
        <span 
          onClick={() => setMode('hours')}
          style={{ 
            color: mode === 'hours' ? 'var(--primary)' : 'var(--text-secondary)', 
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
        >
          {displayHour.toString().padStart(2, '0')}
        </span>
        <span style={{ color: 'var(--text-tertiary)' }}>:</span>
        <span 
          onClick={() => setMode('minutes')}
          style={{ 
            color: mode === 'minutes' ? 'var(--primary)' : 'var(--text-secondary)', 
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
        >
          {minutes.toString().padStart(2, '0')}
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '1rem', marginLeft: '0.5rem', gap: '4px' }}>
          <button 
            onClick={() => handleTimeChange(displayHour, minutes, false)}
            style={{ 
              background: !isPM ? 'var(--primary)' : 'transparent',
              color: !isPM ? 'white' : 'var(--text-secondary)',
              border: 'none', borderRadius: '4px', padding: '4px 8px', fontWeight: 700, cursor: 'pointer'
            }}
          >AM</button>
          <button 
            onClick={() => handleTimeChange(displayHour, minutes, true)}
            style={{ 
              background: isPM ? 'var(--primary)' : 'transparent',
              color: isPM ? 'white' : 'var(--text-secondary)',
              border: 'none', borderRadius: '4px', padding: '4px 8px', fontWeight: 700, cursor: 'pointer'
            }}
          >PM</button>
        </div>
      </div>

      {/* Analog Clock Face */}
      <div 
        style={{
          width: '260px',
          height: '260px',
          background: 'var(--bg-secondary)',
          borderRadius: '50%',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)',
          position: 'relative',
          border: '4px solid var(--bg-tertiary)',
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="2" fill="var(--primary)" />
          
          {/* Clock Hand */}
          <line 
            x1="130" y1="130" 
            x2={pointerX} y2={pointerY} 
            stroke="var(--primary)" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          <circle cx={pointerX} cy={pointerY} r="14" fill="var(--primary)" opacity="0.8" />
          <circle cx={pointerX} cy={pointerY} r="4" fill="var(--bg-primary)" />

          {/* Numbers */}
          {numbers.map((num, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = 130 + radius * Math.cos(angle);
            const y = 130 + radius * Math.sin(angle);
            
            const isActive = mode === 'hours' ? displayHour === num || (displayHour === 12 && num === 12) : minutes === num;

            return (
              <text
                key={num}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isActive ? 'white' : 'var(--text-primary)'}
                fontSize="1.1rem"
                fontWeight={isActive ? 'bold' : '500'}
                style={{ pointerEvents: 'none' }}
              >
                {mode === 'minutes' ? num.toString().padStart(2, '0') : num}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
