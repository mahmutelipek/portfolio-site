import { motion } from 'framer-motion';
import OrbitImages from '../components/OrbitImages';

export function About() {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ 
        padding: '12rem 2rem', 
        maxWidth: '800px', 
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto', zIndex: 10 }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '2rem' }}>
          Creative Developer
        </h1>
        <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#666', marginBottom: '1.5rem' }}>
          A designer and developer focusing on rich interactive experiences and pure minimalist aesthetics. Working at the intersection of design, technology, and art.
        </p>
        <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#666', marginBottom: '3rem' }}>
          When I'm not coding or designing, you can find me playing string instruments or traveling to discover new cultures and inspirations around the world.
        </p>
        
        <div style={{ marginBottom: '6rem', marginTop: '3rem' }}>
          <OrbitImages 
            radiusX={280} 
            radiusY={110} 
            duration={90} 
            rotation={-15}
            itemSize={90}
            images={[
              "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=300&h=300",
              "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=300&h=300",
              "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=300&h=300",
              "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=300&h=300",
              "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=300&h=300",
              "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=300&h=300"
            ]}
          />
        </div>

      </div>
    </motion.section>
  );
}
