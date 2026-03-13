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
     for(let i=0; i<count; i++) pos.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
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
        #hero .logo { top: 2rem; left: 2rem; }
        #hero .disciplines { top: 2rem; left: 28%; }
        #hero .navigation { top: 2rem; left: 55%; display: block; }
        #hero .contact { top: 2rem; right: 2rem; }
        #hero .expertise { bottom: 2rem; left: 2rem; }
        #hero .location { bottom: 2rem; right: 2rem; }
        #hero .title-container { bottom: 1.5rem; left: 28%; }
        #hero h1 { font-size: 5.5rem; }

        @media (max-width: 1024px) {
          #hero .disciplines { left: 25%; }
          #hero .navigation { display: none; }
          #hero .title-container { left: 25%; }
          #hero h1 { font-size: 4.5rem; }
        }

        @media (max-width: 768px) {
          #hero .logo { top: 1.5rem; left: 1.5rem; }
          #hero .disciplines { top: 1.5rem; left: 45%; font-size: 11px !important; }
          #hero .contact { top: 1.5rem; right: 1.5rem; font-size: 11px !important; }
          #hero .expertise { bottom: 1.5rem; left: 1.5rem; font-size: 11px !important; }
          #hero .location { bottom: 1.5rem; right: 1.5rem; font-size: 11px !important; }
          #hero .title-container { bottom: 5rem; left: 1.5rem; width: calc(100% - 3rem); }
          #hero h1 { font-size: 3.5rem; text-align: left; }
        }

        @media (max-width: 480px) {
          #hero .disciplines { display: none; }
          #hero h1 { font-size: 2.8rem; }
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
        
        {/* Top Left: Logo */}
        <div className="logo" style={{
          position: 'absolute',
          pointerEvents: 'auto'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.025em', color: 'white' }}>
            ME<sup style={{ fontSize: '9px' }}>®</sup>
          </span>
        </div>
        
        {/* Top Middle-Left: Services/Skills */}
        <div className="disciplines" style={{
          position: 'absolute',
          pointerEvents: 'auto',
          fontSize: '13px',
          fontWeight: 500,
          lineHeight: 1.3,
          color: 'white'
        }}>
          3D Motion Design<br />
          Art Direction<br />
          Visual Strategy
        </div>
        
        {/* Top Middle-Right: Navigation */}
        <div className="navigation" style={{
          position: 'absolute',
          pointerEvents: 'auto',
          fontSize: '13px',
          fontWeight: 500,
          color: 'white'
        }}>
          Work, Archive, Profile, Journal
        </div>
        
        {/* Top Right: Contact Action */}
        <a 
          href="mailto:mahmutelipk@gmail.com"
          className="contact"
          style={{
            position: 'absolute',
            pointerEvents: 'auto',
            fontSize: '13px',
            fontWeight: 500,
            color: 'white',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
        >
          Let's Talk
        </a>

        {/* Bottom Left: Expertise */}
        <div className="expertise" style={{
          position: 'absolute',
          pointerEvents: 'auto',
          fontSize: '13px',
          fontWeight: 500,
          color: 'white'
        }}>
          Branding, Motion
        </div>

        {/* Bottom Right: Location Tag */}
        <div className="location" style={{
          position: 'absolute',
          pointerEvents: 'auto',
          fontSize: '13px',
          fontWeight: 500,
          color: 'white',
          textAlign: 'right'
        }}>
          Based in<br />
          Istanbul, TR
        </div>

        {/* Bottom Center-ish: Main Title */}
        <motion.div 
          className="title-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            pointerEvents: 'auto'
          }}
        >
          <h1 style={{
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1,
            color: 'white',
            margin: 0
          }}>
            Mahmut Elipek
          </h1>
        </motion.div>
      </div>
    </section>
  );
};
