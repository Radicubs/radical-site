"use client";

import React, { useEffect, useRef, useMemo, type ReactNode, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef?.current || window;
    const wordElements = el.querySelectorAll<HTMLElement>('.word');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { rotate: 0 });
      gsap.set(wordElements, { opacity: 1, filter: 'none' });
      return;
    }

    const context = gsap.context(() => {
      gsap.set(el, { transformOrigin: '0% 50%', rotate: baseRotation });
      gsap.set(wordElements, {
        opacity: baseOpacity,
        filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
        willChange: 'opacity, filter'
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top 82%',
          once: true
        }
      });

      timeline
        .to(el, { rotate: 0, duration: 0.7, ease: 'power3.out' })
        .to(wordElements, {
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.62,
          stagger: 0.035,
          ease: 'power2.out',
          clearProps: 'willChange'
        }, '<');
    }, el);

    return () => context.revert();
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, blurStrength]);

  return (
    <div ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </div>
  );
};

export default ScrollReveal;
