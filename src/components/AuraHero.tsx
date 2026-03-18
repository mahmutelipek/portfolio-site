import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three-stdlib';
import * as THREE from 'three';
import { motion } from 'framer-motion';

extend({ UnrealBloomPass });

// Pre-computed constants
const SIDE = 18;
const COUNT = SIDE * SIDE * SIDE; // 5832
const SEP = 2.5;
const HALF_EXTENT = (SIDE * SEP) / 2;
const LERP_FACTOR = 0.1;
const PARTICLE_COLOR = 0x00aaff;

const ParticleSwarm = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(PARTICLE_COLOR), []);

  // Pre-compute grid targets once — they never change
  const targets = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const z = Math.floor(i / (SIDE * SIDE));
      const y = Math.floor((i % (SIDE * SIDE)) / SIDE);
      const x = i % SIDE;
      arr[i * 3]     = x * SEP - HALF_EXTENT;
      arr[i * 3 + 1] = y * SEP - HALF_EXTENT;
      arr[i * 3 + 2] = z * SEP - HALF_EXTENT;
    }
    return arr;
  }, []);

  // Current positions — start random, lerp toward targets
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 100;
    }
    return arr;
  }, []);

  // Track whether initial lerp animation has settled
  const settled = useRef(false);

  // Material & Geometry (created once, shared across all instances)
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.25), []);

  // Set instance colors once on mount (they never change)
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // One-time color init: set all instance colors on first frame
    if (!mesh.userData.colorsSet) {
      for (let i = 0; i < COUNT; i++) {
        mesh.setColorAt(i, colorObj);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.userData.colorsSet = true;
    }

    // Skip matrix updates once animation has converged
    if (settled.current) return;

    let maxDelta = 0;

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      // Lerp each axis
      positions[i3]     += (targets[i3]     - positions[i3])     * LERP_FACTOR;
      positions[i3 + 1] += (targets[i3 + 1] - positions[i3 + 1]) * LERP_FACTOR;
      positions[i3 + 2] += (targets[i3 + 2] - positions[i3 + 2]) * LERP_FACTOR;

      // Track convergence
      const dx = targets[i3]     - positions[i3];
      const dy = targets[i3 + 1] - positions[i3 + 1];
      const dz = targets[i3 + 2] - positions[i3 + 2];
      const dist = dx * dx + dy * dy + dz * dz;
      if (dist > maxDelta) maxDelta = dist;

      dummy.position.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    // Once all particles are within 0.01 units of their target, stop updating
    if (maxDelta < 0.0001) {
      settled.current = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, COUNT]} />
  );
};

export const AuraHero = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      id="hero"
      style={{
        width: '100%',
        height: '100dvh',
        backgroundColor: '#000000',
        color: 'white',
        fontFamily: '"Mona Sans", sans-serif',
        overflow: 'hidden',
        position: 'relative',
        WebkitFontSmoothing: 'antialiased'
      }}
    >
      <style>{`
        #hero .row-bottom { bottom: 2rem; left: 2rem; right: 2rem; padding: 0; width: calc(100% - 4rem); }
        #hero .expertise-mobile-wrap { flex: 1; white-space: normal; }
        #hero .title-mobile-wrap { flex-shrink: 0; text-align: center; }
        #hero .location-mobile-wrap { flex: 1; text-align: right; }
        #hero h1 { font-size: clamp(3.5rem, 5vw, 6.2rem); line-height: 0.8; margin: 0; padding: 0; white-space: nowrap; }

        @media (max-width: 1024px) {
          #hero .row-bottom { bottom: 1.5rem; left: 1.5rem; right: 1.5rem; flex-direction: column; align-items: center; gap: 1.5rem; width: calc(100% - 3rem) !important; }
          #hero .expertise-mobile-wrap { order: 1; flex: none; width: 100% !important; margin-bottom: 0px; white-space: nowrap; font-size: min(13px, 3.5vw) !important; text-align: center; }
          #hero .title-mobile-wrap { order: 2; flex: none; width: 100% !important; text-align: center; }
          #hero .location-mobile-wrap { display: none; }
          #hero h1 { font-size: clamp(2.5rem, 10vw, 4.5rem); text-align: center; }
        }

        @media (max-width: 480px) {
          #hero .row-bottom { bottom: calc(6rem + env(safe-area-inset-bottom, 0px)); left: 1.5rem; right: 1.5rem; gap: 0.75rem; }
          #hero h1 { font-size: calc((100vw - 3rem) / 6.8); text-align: center; white-space: nowrap; }
          #hero .expertise-mobile-wrap { font-size: 11px; }
          #hero .disciplines { display: none; }
          #hero .title-container { bottom: 4.5rem; }
        }
      `}</style>

      {/* Background Particle Swarm */}
      <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 0, height: isMobile ? '90%' : '100%' }}>
        <Canvas style={{ pointerEvents: 'none', touchAction: 'auto' }} camera={{ position: [0, 0, 106], fov: 60 }}>
          <fog attach="fog" args={['#000000', 0.01]} />
          <ParticleSwarm />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={true} enableRotate={!isMobile} />
          <Effects disableGamma>
            {/* @ts-ignore */}
            <unrealBloomPass threshold={0} strength={2.59} radius={0.4} />
          </Effects>
        </Canvas>
      </div>

      {/* Main Content Overlay */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}>

        {/* Bottom Row: Flex Container */}
        <div className="row-bottom" style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'flex-end',
          pointerEvents: 'none'
        }}>
          {/* Expertise/Keywords */}
          <div className="expertise-mobile-wrap" style={{ pointerEvents: 'auto', fontSize: '13px', fontWeight: 500, color: 'white' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              Curious about systems, visuals, and everyday details.
            </motion.div>
          </div>

          {/* Main Title */}
          <div className="title-mobile-wrap" style={{ pointerEvents: 'auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1>Mahmut Elipek</h1>
            </motion.div>
          </div>

          {/* Location Tag */}
          <div className="location-mobile-wrap" style={{ pointerEvents: 'auto', fontSize: '13px', fontWeight: 500, color: 'white' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              Based in Istanbul, TR
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
