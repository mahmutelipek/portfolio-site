import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import DecryptedText from './DecryptedText';


const ParticleSwarm = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 20000;
  const speedMult = 1;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const pColor = useMemo(() => new THREE.Color(), []);
  const color = pColor; // Alias for user code compatibility

  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) pos.push(new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100));
    return pos;
  }, [count]);

  // Material & Geom
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), []);
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.25), []);

  const PARAMS = useMemo(() => ({ "k": 1.2, "amp": 25, "spread": 2.12, "freq": 0.419 }), []);
  const addControl = (id: string, _l: string, _min: number, _max: number, val: number) => {
    // @ts-ignore
    return PARAMS[id] !== undefined ? PARAMS[id] : val;
  };


  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speedMult;

    // @ts-ignore
    if (material.uniforms && material.uniforms.uTime) {
      // @ts-ignore
      material.uniforms.uTime.value = time;
    }

    for (let i = 0; i < count; i++) {
      // USER CODE START
      const k = addControl("k", "Spring Constant", 0.1, 5.0, 1.2);
      const amp = addControl("amp", "Amplitude", 5, 60, 25);
      const spread = addControl("spread", "Lattice Spread", 0.5, 5.0, 2.0);
      const freq = addControl("freq", "Oscillation Speed", 0.1, 3.0, 1.0);

      const n = Math.cbrt(count) | 0;
      const ix = i % n;
      const iy = ((i / n) | 0) % n;
      const iz = ((i / (n * n)) | 0);
      const cx = ix - n * 0.5;
      const cy = iy - n * 0.5;
      const cz = iz - n * 0.5;

      const r = Math.sqrt(cx * cx + cy * cy + cz * cz) + 0.0001;
      const omega = Math.sqrt(k);
      const phase = omega * time * freq - r * 0.15;
      const displacement = Math.sin(phase) * amp / (1.0 + 0.05 * r);

      target.set(
        cx * spread + (cx / r) * displacement,
        cy * spread + (cy / r) * displacement,
        cz * spread + (cz / r) * displacement
      );

      color.set('#666666');


      // USER CODE END

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

export function Hero() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#030303', position: 'relative', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 110], fov: 60 }}>
        <color attach="background" args={['#030303']} />
        <fog attach="fog" args={['#030303', 0.01]} />
        <ParticleSwarm />
        <OrbitControls autoRotate={true} enableZoom={false} enablePan={false} />
      </Canvas>

      {/* Full overlay container */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1280px',
          height: '100%',
          position: 'relative',
          padding: '8rem 5rem'
        }}>

          {/* Center: Name + Subtitle */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '100%',
            padding: '0 2rem'
          }}>
            <h1 className="hero-title" style={{
              color: 'var(--text-primary)',
              fontWeight: 400,
              letterSpacing: '-0.04em',
              margin: 0,
              lineHeight: 0.95,
              cursor: 'default'
            }}>
              <DecryptedText
                text="Mahmut Elipek"
                animateOn="view"
                speed={120}
                maxIterations={25}
                characters="ACEMHILPTU01XY&~_"
                revealDirection="start"
              />
            </h1>

            <p className="hero-subtitle" style={{
              color: '#EBEBEB',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              marginTop: '1.5rem',
              maxWidth: '700px',
              width: '90%',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.8
            }}>
              Senior Product Designer & Spline Expert. Creating high-performance digital products, design systems, and motion-heavy interactive experiences.
            </p>
          </div>

          {/* Bottom row */}
          <div style={{
            position: 'absolute',
            bottom: '5rem',
            left: '5rem',
            right: '5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            {/* Bottom-left: Location */}
            <div style={{
              fontSize: '12px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}>
              <div>Based in Istanbul, TR</div>
            </div>

            {/* Bottom-right: Social */}
            <div style={{
              fontSize: '12px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              textAlign: 'right',
              lineHeight: 1.6,
              pointerEvents: 'auto'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <a href="https://x.com/mahmutelipk" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>X</a>
                <span style={{ opacity: 0.3 }}>·</span>
                <a href="https://www.linkedin.com/in/mahmutelipek" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>LinkedIn</a>
                <span style={{ opacity: 0.3 }}>·</span>
                <a href="https://layers.to/mahmutelipek" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Layers</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
