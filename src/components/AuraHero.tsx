import { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three-stdlib';
import * as THREE from 'three';
import { motion } from 'framer-motion';

extend({ UnrealBloomPass });

const ParticleSwarm = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const s = 27; // Side length for perfect cube symmetry
  const count = s * s * s; // 19,683 particles
  const speedMult = 1;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const pColor = useMemo(() => new THREE.Color(), []);

  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) pos.push(new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100));
    return pos;
  }, [count]);

  // Material & Geom
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vColor;
        void main() {
            vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
            vViewPosition = -mvPosition.xyz;
            vColor = instanceColor;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vColor;
        void main() {
            float fresnel = dot(normalize(vNormal), normalize(vViewPosition));
            fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
            fresnel = pow(fresnel, 2.0);
            vec3 col = vColor * fresnel + vec3(0.05); 
            gl_FragColor = vec4(col, 0.3 + fresnel * 0.7);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), []);

  const geometry = useMemo(() => new THREE.SphereGeometry(0.3, 16, 16), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speedMult;

    if (material.uniforms.uTime) {
      material.uniforms.uTime.value = time;
    }

    const sep = 2.5;
    const off = ((s - 1) * sep) / 2; // Precise offset for centering

    for (let i = 0; i < count; i++) {
      // Grid logic - perfect cube indexing
      let z = Math.floor(i / (s * s));
      let y = Math.floor((i % (s * s)) / s);
      let x = i % s;

      target.set(x * sep - off, y * sep - off, z * sep - off);
      pColor.setHex(0x00aaff);

      positions[i].lerp(target, 0.1);
      dummy.position.copy(positions[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, pColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  );
};

export const AuraHero = () => {
  return (
    <section
      id="hero"
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#000',
        color: 'white',
        fontFamily: '"Mona Sans", sans-serif',
        overflow: 'hidden',
        position: 'relative',
        WebkitFontSmoothing: 'antialiased'
      }}
    >
      <style>{`
        #hero .row-bottom { bottom: 2rem; left: 2rem; right: 2rem; padding: 0; }
        #hero .expertise-mobile-wrap { white-space: nowrap; }
        #hero h1 { font-size: 5.5rem; line-height: 0.8; margin: 0; padding: 0; white-space: nowrap; }

        @media (max-width: 1310px) {
          #hero .row-bottom { bottom: 1.5rem; left: 1.5rem; right: 1.5rem; flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          #hero .expertise-mobile-wrap { order: 1; width: 100%; margin-bottom: 0px; white-space: nowrap; }
          #hero .title-mobile-wrap { order: 2; width: 100%; }
          #hero .location-mobile-wrap { display: none; }
          #hero h1 { font-size: clamp(2.5rem, 10vw, 4.5rem); }
        }

        @media (max-width: 480px) {
          #hero .row-bottom { bottom: 1.5rem; left: 1.5rem; right: 1.5rem; gap: 0.25rem; }
          #hero h1 { font-size: 2.8rem; }
          #hero .expertise-mobile-wrap { font-size: 11px; }
          #hero .disciplines { display: none; }
          #hero .title-container { bottom: 4.5rem; }
        }
      `}</style>

      {/* Background Particle Swarm */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 200], fov: 60 }}>
          <fog attach="fog" args={['#000000', 0.01]} />
          <ParticleSwarm />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={true} />
          <Effects disableGamma>
            {/* @ts-ignore */}
            <unrealBloomPass threshold={0} strength={1.8} radius={0.4} />
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
          alignItems: 'baseline',
          pointerEvents: 'none',
          width: 'calc(100% - 4rem)'
        }}>
          {/* Expertise/Keywords */}
          <div className="expertise-mobile-wrap" style={{ width: 'calc(28% - 2rem)', pointerEvents: 'auto', fontSize: '13px', fontWeight: 500, color: 'white' }}>
            Curious about systems, visuals, and everyday details.
          </div>

          {/* Main Title */}
          <div className="title-mobile-wrap" style={{ width: 'calc(55% - 28%)', pointerEvents: 'auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1>Mahmut Elipek</h1>
            </motion.div>
          </div>

          {/* Location Tag */}
          <div className="location-mobile-wrap" style={{ flexGrow: 1, textAlign: 'right', pointerEvents: 'auto', fontSize: '13px', fontWeight: 500, color: 'white' }}>
            Based in Istanbul, TR
          </div>
        </div>
      </div>
    </section>
  );
};
