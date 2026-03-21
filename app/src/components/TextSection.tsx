import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type TextSectionBackground = 'black' | 'white';
export type TextSectionAlignment = 'left' | 'right';

export interface TextSectionProps {
  background: TextSectionBackground;
  heading: string;
  content: string;
  alignment?: TextSectionAlignment;
  imageSrc?: string;
  imageFallbackSrc?: string;
  imageAlt?: string;
  className?: string;
}

const TextSection = ({
  background,
  heading,
  content,
  alignment = 'left',
  imageSrc,
  imageFallbackSrc,
  imageAlt = 'Section image',
  className = '',
}: TextSectionProps) => {
  const [imgSrc, setImgSrc] = useState(imageSrc);
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const isBlack = background === 'black';
  const bgClass = isBlack ? 'bg-[#0a0a0a] text-white' : 'bg-[#fcfcfc] text-black border-y border-gray-100';
  const textMaxWidth = 'max-w-[800px]';

  useEffect(() => {
    const section = sectionRef.current;
    const textEl = textRef.current;
    const imageEl = imageRef.current;
    if (!section) return;

    const animatables = [textEl, imageEl].filter(Boolean) as HTMLElement[];
    if (animatables.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        animatables,
        { y: 64, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
          },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    setImgSrc(imageSrc);
  }, [imageSrc]);

  const contentBlock = (
    <div ref={textRef} className={`${textMaxWidth} ${alignment === 'right' ? 'lg:order-2' : ''}`}>
      <h2 className="font-display font-black text-4xl md:text-5xl lg:text-6xl mb-10 leading-tight uppercase tracking-tighter">
        {heading.split(' ').map((word, i) => i === 1 ? <span key={i} className="text-primary italic">{word} </span> : word + ' ')}
      </h2>
      <p className="text-xl leading-relaxed text-gray-500 font-medium whitespace-pre-line">{content}</p>
    </div>
  );

  const imageBlock = imgSrc ? (
    <div
      ref={imageRef}
      className={`relative overflow-hidden rounded-[2.5rem] shadow-premium ${alignment === 'right' ? 'lg:order-1' : ''}`}
    >
      <img
        src={imgSrc}
        alt={imageAlt}
        loading="lazy"
        className="w-full h-full object-cover aspect-[4/5] transition-transform duration-1000 hover:scale-110"
        onError={() => {
          if (imageFallbackSrc && imgSrc !== imageFallbackSrc) {
            setImgSrc(imageFallbackSrc);
          }
        }}
      />
      <div className="absolute inset-0 bg-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
    </div>
  ) : null;

  return (
    <section
      ref={sectionRef}
      className={`${bgClass} py-24 lg:py-40 ${className}`}
      aria-labelledby={`heading-${heading.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {alignment === 'left' ? (
            <>
              {contentBlock}
              {imageBlock}
            </>
          ) : (
            <>
              {imageBlock}
              {contentBlock}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default TextSection;
