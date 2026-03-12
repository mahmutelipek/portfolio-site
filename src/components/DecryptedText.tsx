import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

const styles = {
  wrapper: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: 0,
  },
};

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
  clickMode = 'once',
  ...props
}: any) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(animateOn !== 'click');
  const [direction, setDirection] = useState('forward');

  const containerRef = useRef<HTMLSpanElement>(null);
  const orderRef = useRef<number[]>([]);
  const pointerRef = useRef(0);

  const availableChars = useMemo(() => {
    if (useOriginalCharsOnly) {
      const unique = Array.from(new Set(text.split(''))).filter((c) => c !== ' ');
      return unique.length > 0 ? unique : characters.split('');
    }
    return characters.split('');
  }, [text, useOriginalCharsOnly, characters]);

  const shuffle = useCallback((array: number[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  useEffect(() => {
    const indices = Array.from({ length: text.length }, (_, i) => i);
    if (revealDirection === 'start') {
      orderRef.current = indices;
    } else if (revealDirection === 'end') {
      orderRef.current = indices.reverse();
    } else if (revealDirection === 'center') {
      const middle = Math.floor(text.length / 2);
      const tempOrder = [];
      for (let i = 0; i <= middle; i++) {
        if (middle - i >= 0) tempOrder.push(middle - i);
        if (middle + i < text.length && i !== 0) tempOrder.push(middle + i);
      }
      orderRef.current = tempOrder;
    } else {
      orderRef.current = shuffle(indices);
    }
  }, [text, revealDirection, shuffle]);

  const triggerHoverDecrypt = useCallback(() => {
    if (!isAnimating) {
      setDirection('forward');
      setIsAnimating(true);
    }
  }, [isAnimating]);

  const resetToPlainText = useCallback(() => {
    if (!isAnimating) {
      setDirection('backward');
      setIsAnimating(true);
    }
  }, [isAnimating]);

  const handleClick = useCallback(() => {
    if (animateOn === 'click') {
      if (clickMode === 'toggle') {
        setDirection(isDecrypted ? 'backward' : 'forward');
        setIsAnimating(true);
      } else if (!hasAnimated) {
        setDirection('forward');
        setIsAnimating(true);
        setHasAnimated(true);
      }
    }
  }, [animateOn, clickMode, isDecrypted, hasAnimated, isAnimating]);

  const encryptInstantly = useCallback(() => {
    const encryptedText = text.split('').map((char: string) => {
      if (char === ' ') return ' ';
      return availableChars[Math.floor(Math.random() * availableChars.length)];
    }).join('');
    setDisplayText(encryptedText);
    setIsDecrypted(false);
  }, [text, availableChars]);

  useEffect(() => {
    let interval: any;
    if (isAnimating) {
      let currentIteration = 0;
      interval = setInterval(() => {
        setDisplayText((currentText: string) => {
          const newText = currentText.split('');
          
          if (direction === 'forward') {
            if (sequential) {
              const nextIndex = orderRef.current[pointerRef.current];
              if (nextIndex !== undefined) {
                if (currentIteration < maxIterations) {
                  newText[nextIndex] = availableChars[Math.floor(Math.random() * availableChars.length)];
                  currentIteration++;
                } else {
                  newText[nextIndex] = text[nextIndex];
                  setRevealedIndices((prev) => new Set([...prev, nextIndex]));
                  pointerRef.current++;
                  currentIteration = 0;
                }
              } else {
                setIsAnimating(false);
                setIsDecrypted(true);
              }
            } else {
              let allDone = true;
              for (let i = 0; i < text.length; i++) {
                if (revealedIndices.has(i)) {
                  newText[i] = text[i];
                } else {
                  allDone = false;
                  if (currentIteration >= maxIterations) {
                    newText[i] = text[i];
                    setRevealedIndices((prev: any) => new Set([...prev, i]));
                  } else {
                    newText[i] = availableChars[Math.floor(Math.random() * availableChars.length)];
                  }
                }
              }
              if (allDone) {
                setIsAnimating(false);
                setIsDecrypted(true);
              } else {
                currentIteration++;
              }
            }
          } else {
            let allDone = true;
            for (let i = 0; i < text.length; i++) {
              if (text[i] === ' ') {
                newText[i] = ' ';
              } else if (revealedIndices.has(i)) {
                allDone = false;
                if (currentIteration >= maxIterations) {
                  setRevealedIndices((prev: any) => {
                    const next = new Set(prev);
                    next.delete(i);
                    return next;
                  });
                  newText[i] = availableChars[Math.floor(Math.random() * availableChars.length)];
                } else {
                  newText[i] = availableChars[Math.floor(Math.random() * availableChars.length)];
                }
              } else {
                newText[i] = availableChars[Math.floor(Math.random() * availableChars.length)];
              }
            }
            if (allDone) {
              setIsAnimating(false);
              setIsDecrypted(false);
            } else {
              currentIteration++;
            }
          }
          return newText.join('');
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isAnimating, direction, text, revealedIndices, sequential, speed, availableChars, maxIterations]);

  useEffect(() => {
    if (animateOn === 'view') {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setDirection('forward');
          setIsAnimating(true);
          setHasAnimated(true);
        }
      }, { threshold: 0.1 });
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [animateOn, hasAnimated]);

  useEffect(() => {
    if (animateOn === 'click') {
      encryptInstantly();
    } else {
      setDisplayText(text);
      setIsDecrypted(true);
    }
    setRevealedIndices(new Set());
    setDirection('forward');
  }, [animateOn, text, encryptInstantly]);

  const animateProps = animateOn === 'hover' || animateOn === 'inViewHover' 
    ? { onMouseEnter: triggerHoverDecrypt, onMouseLeave: resetToPlainText }
    : animateOn === 'click' ? { onClick: handleClick } : {};

  return (
    // @ts-ignore
    <motion.span
      className={parentClassName}
      ref={containerRef}
      // @ts-ignore
      style={styles.wrapper}
      {...animateProps}
      {...props}
    >
      <span style={styles.srOnly as any}>{displayText}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char: string, index: number) => {
          const isRevealedOrDone = revealedIndices.has(index) || (!isAnimating && isDecrypted);
          return (
            <span key={index} className={isRevealedOrDone ? className : encryptedClassName}>
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
