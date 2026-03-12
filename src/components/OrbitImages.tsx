import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';

interface OrbitProps {
  radiusX?: number;
  radiusY?: number;
  duration?: number;
  rotation?: number;
  itemSize?: number;
  images?: string[];
}

export default function OrbitImages({
  radiusX = 350,
  radiusY = 150,
  duration = 90,
  rotation = -15,
  itemSize = 80,
  images = []
}: OrbitProps) {
  const progress = useMotionValue(0);

  // Animate progress 0 to 100 over duration
  useAnimationFrame((time) => {
    const elapsed = time % (duration * 1000);
    const p = (elapsed / (duration * 1000)) * 100;
    progress.set(p);
  });

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // overflow: 'hidden'
    }}>
      <div style={{
        position: 'relative',
        width: radiusX * 2,
        height: radiusY * 2,
        transform: `rotate(${rotation}deg)`
      }}>
        {/* Orbit Path */}
        <svg 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <ellipse 
            cx={radiusX} 
            cy={radiusY} 
            rx={radiusX} 
            ry={radiusY} 
            fill="none" 
            stroke="#EBEBEB" 
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>
        {images.map((src, index) => {
          const offset = (index / images.length) * 100;
          
          // Calculate angle based on progress and offset
          const angle = useTransform(progress, (p) => {
            const currentP = (p + offset) % 100;
            return (currentP / 100) * Math.PI * 2;
          });

          // Calculate x and y position on ellipse
          const x = useTransform(angle, (a) => radiusX + radiusX * Math.cos(a) - itemSize / 2);
          const y = useTransform(angle, (a) => radiusY + radiusY * Math.sin(a) - itemSize / 2);

          return (
            <motion.div
              key={index}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: itemSize,
                height: itemSize,
                x,
                y,
                transformOrigin: 'center center'
              }}
            >
              <div style={{ transform: `rotate(${-rotation}deg)`, width: '100%', height: '100%' }}>
                <img 
                  src={src} 
                  alt={`Orbit ${index}`} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }} 
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
