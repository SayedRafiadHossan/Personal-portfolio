'use client';

import { useGSAP } from '@gsap/react';
import { Slot } from '@radix-ui/react-slot';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ComponentPropsWithoutRef, RefCallback, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type RevealAnimationProps = {
  asChild?: boolean;
  duration?: number;
  delay?: number;
  offset?: number;
  instant?: boolean;
  start?: string;
  end?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  rotation?: number;
  scale?: number;
  animationType?: 'from' | 'to';
  /** Blur in/out. Turn off for large elements: animating a blur over a big area stutters. */
  blur?: boolean;
} & ComponentPropsWithoutRef<'div'>;

export default function RevealAnimation({
  asChild = true,
  children,
  duration = 0.6,
  delay = 0,
  offset = 60,
  instant = false,
  start = 'top 90%',
  end = 'top 50%',
  direction = 'down',
  rotation = 0,
  scale = 1,
  animationType = 'from',
  blur = true,
  ...props
}: RevealAnimationProps) {
  const Component = asChild ? Slot : 'div';
  const elementRef = useRef<HTMLElement | null>(null);

  const setRef: RefCallback<Element> = (node) => {
    elementRef.current = node as HTMLElement | null;
  };

  useGSAP(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    element.style.opacity = '1';

    let animationProps: gsap.TweenVars;

    if (animationType === 'to') {
      animationProps = {
        opacity: 1,
        ...(blur && { filter: 'blur(0)' }),
        duration,
        delay,
        ease: 'power2.out',
        scale,
      };

      if (rotation !== 0) {
        animationProps.rotation = rotation;
      }
    } else {
      animationProps = {
        opacity: 0,
        ...(blur && { filter: 'blur(8px)' }),
        clearProps: 'filter,transform',
        duration,
        delay,
        ease: 'power2.out',
      };

      if (rotation !== 0) {
        animationProps.rotation = rotation;
      }
    }

    if (!instant) {
      animationProps.scrollTrigger = {
        trigger: element,
        start,
        end,
        scrub: false,
      };
    }

    switch (direction) {
      case 'left':
        animationProps.x = animationType === 'from' ? -offset : 0;
        if (animationType === 'to') {
          gsap.set(element, { x: -offset });
        }
        break;
      case 'right':
        animationProps.x = animationType === 'from' ? offset : 0;
        if (animationType === 'to') {
          gsap.set(element, { x: offset });
        }
        break;
      case 'down':
        animationProps.y = animationType === 'from' ? offset : 0;
        if (animationType === 'to') {
          gsap.set(element, { y: offset });
        }
        break;
      case 'up':
      default:
        animationProps.y = animationType === 'from' ? -offset : 0;
        if (animationType === 'to') {
          gsap.set(element, { y: -offset });
        }
        break;
    }

    if (animationType === 'to') {
      gsap.to(element, animationProps);
    } else {
      gsap.from(element, animationProps);
    }
  }, [
    duration,
    delay,
    offset,
    instant,
    start,
    end,
    direction,
    rotation,
    scale,
    animationType,
    blur,
  ]);

  return (
    <Component ref={setRef} data-ns-animate {...props}>
      {children}
    </Component>
  );
}