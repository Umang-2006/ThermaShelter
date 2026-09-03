import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import { ShelterDesign } from '../../types/shelter';

const MATERIAL_COLORS: Record<string, string> = {
  brick: '#b91c1c',
  stone: '#475569',
  concrete: '#64748b',
  adobe: '#d97706',
  wood: '#78350f',
  earth: '#92400e',
  default: '#475569'
};

const Building: React.FC<{ design: ShelterDesign }> = ({ design }) => {
  const { length, width, height, orientation, wall_material_id, roof_type, window_area, door_area } = design;

  const wallColor = MATERIAL_COLORS[wall_material_id] || MATERIAL_COLORS.default;
  const radOrientation = (orientation * Math.PI) / 180;

  // Window dimension approx sqrt
  const winSide = Math.min(height * 0.7, Math.sqrt(Math.max(0.5, window_area)));
  
  return (
    <group rotation={[0, -radOrientation, 0]} position={[0, height / 2, 0]}>
      {/* Main Building Envelope */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* Roof Structure */}
      {roof_type === 'sloped' ? (
        <group position={[0, height / 2 + 0.6, 0]}>
          {/* Gable Roof */}
          <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[Math.max(width, length) * 0.75, 1.2, 4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.2} />
          </mesh>
        </group>
      ) : (
        <mesh position={[0, height / 2 + 0.08, 0]} castShadow>
          <boxGeometry args={[width + 0.3, 0.16, length + 0.3]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
      )}

      {/* South Window Glazing */}
      <mesh position={[0, 0, length / 2 + 0.02]}>
        <planeGeometry args={[winSide, winSide]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} transparent opacity={0.7} />
      </mesh>

      {/* Door */}
      <mesh position={[-width / 4, -height / 4, length / 2 + 0.02]}>
        <planeGeometry args={[0.9, 2.0]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
    </group>
  );
};

const Compass: React.FC = () => {
  return (
    <group position={[0, 0.02, 0]}>
      <Text position={[0, 0, -6]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color="#ef4444">
        N
      </Text>
      <Text position={[0, 0, 6]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color="#3b82f6">
        S
      </Text>
      <Text position={[6, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color="#eab308">
        E
      </Text>
      <Text position={[-6, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color="#a855f7">
        W
      </Text>
    </group>
  );
};

const Shelter3D: React.FC<{ design: ShelterDesign }> = ({ design }) => {
  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-950">
      <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs font-mono text-slate-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        3D Procedural Model ({design.length}m × {design.width}m × {design.height}m)
      </div>
      <Canvas shadows camera={{ position: [9, 7, 9], fov: 45 }}>
        <color attach="background" args={['#090d16']} />
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[12, 14, 8]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024}
        />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.05} />
        <Building design={design} />
        <Compass />
        <Grid infiniteGrid fadeDistance={25} sectionColor="#334155" cellColor="#1e293b" />
      </Canvas>
    </div>
  );
};

export default Shelter3D;
