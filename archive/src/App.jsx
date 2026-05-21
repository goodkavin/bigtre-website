import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Activity, Database, CheckCircle, Mail } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {
  const navRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 'top -50',
        end: 99999,
        toggleClass: {
          className: 'nav-scrolled',
          targets: navRef.current,
        },
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl rounded-full transition-all duration-500 py-4 px-8 flex justify-between items-center text-white border border-transparent
                 [&.nav-scrolled]:bg-background/70 [&.nav-scrolled]:backdrop-blur-xl [&.nav-scrolled]:text-primary [&.nav-scrolled]:border-primary/20 [&.nav-scrolled]:shadow-xl"
    >
      <div className="font-sans font-bold tracking-tight text-xl">BigTre</div>
      <div className="hidden md:flex gap-8 font-sans font-medium text-sm">
        <a href="#features" className="hover:-translate-y-[1px] transition-transform">Platform</a>
        <a href="#philosophy" className="hover:-translate-y-[1px] transition-transform">Philosophy</a>
        <a href="#protocol" className="hover:-translate-y-[1px] transition-transform">Protocol</a>
      </div>
      <a href="mailto:contact@bigtre.business" className="btn-magnetic bg-accent text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2">
        <span className="btn-hover-layer"></span>
        <span className="relative z-10 flex items-center gap-2">Consulting <ArrowRight size={16} /></span>
      </a>
    </nav>
  );
};

const Hero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.2
      });
      gsap.from('.hero-cta', {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.6
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative h-[100dvh] w-full overflow-hidden flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-16" id="hero">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2674&auto=format&fit=crop"
          alt="Organic Tech Texture"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-primary/80 to-transparent mix-blend-multiply opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-4xl text-background">
        <h1 className="flex flex-col gap-2">
          <span className="hero-text font-outfit font-bold text-3xl md:text-5xl uppercase tracking-widest text-accent/90">
            Data infrastructure is the
          </span>
          <span className="hero-text font-drama italic text-7xl md:text-[clamp(6rem,12vw,10rem)] leading-[0.85] tracking-tighter">
            Foundation.
          </span>
        </h1>
        <p className="hero-text mt-8 max-w-xl font-sans text-lg md:text-xl text-background/80 font-medium">
          Making your data work the way it was promised.<br />
          Lean, profitable, and uncompromisingly precise.
        </p>
        <div className="hero-cta mt-10">
          <a href="mailto:contact@bigtre.business" className="btn-magnetic inline-flex items-center gap-3 bg-accent text-white px-8 py-4 rounded-full font-bold text-lg">
            <span className="btn-hover-layer"></span>
            <span className="relative z-10 flex items-center gap-2">Engage BigTre <ArrowRight size={20} /></span>
          </a>
        </div>
      </div>
    </section>
  );
};

const DiagnosticShuffler = () => {
  const [cards, setCards] = useState([
    { id: 1, title: 'Lean Architecture', desc: 'Sustainable frameworks without bloat.' },
    { id: 2, title: 'Automated Pipelines', desc: 'Continuous flows from source to insight.' },
    { id: 3, title: 'AI-Driven Workflows', desc: 'Self-healing, intelligent data infrastructure.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards(prev => {
        const newCards = [...prev];
        newCards.unshift(newCards.pop());
        return newCards;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-64 w-full max-w-sm mx-auto flex flex-col items-center justify-center -mt-8">
      {cards.map((card, i) => {
        const isTop = i === 0;
        return (
          <div
            key={card.id}
            className="absolute w-full bg-background border border-primary/10 rounded-[2rem] p-6 shadow-xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              transform: `translateY(${i * 20}px) scale(${1 - i * 0.05})`,
              zIndex: 10 - i,
              opacity: 1 - i * 0.2
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <Database className="text-accent" size={24} />
              <span className="text-xs font-mono text-primary/50">SYS.0{card.id}</span>
            </div>
            <h3 className="font-sans font-bold text-lg mb-1">{card.title}</h3>
            <p className="text-sm text-dark/70">{card.desc}</p>
          </div>
        );
      })}
    </div>
  );
};

const TelemetryTypewriter = () => {
  const lines = [
    '> INITIALIZING PnL TELEMETRY...',
    '> GROSS PROFIT MARGIN: +14.2%',
    '> INVENTORY PLANNING: OPTIMIZED.',
    '> AWAITING NEW DATA STREAM...'
  ];
  const [text, setText] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= lines.length) {
      const timeout = setTimeout(() => { setText(''); setLineIdx(0); setCharIdx(0); }, 4000);
      return () => clearTimeout(timeout);
    }
    const currentLine = lines[lineIdx];
    if (charIdx < currentLine.length) {
      const timeout = setTimeout(() => {
        setText(prev => prev + currentLine[charIdx]);
        setCharIdx(prev => prev + 1);
      }, 50 + Math.random() * 50);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setText(prev => prev + '\\n');
        setLineIdx(prev => prev + 1);
        setCharIdx(0);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [lineIdx, charIdx]);

  return (
    <div className="bg-dark text-[#E8E4DD] rounded-[2rem] p-6 shadow-xl border border-white/5 h-64 max-w-sm mx-auto w-full flex flex-col relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
        <span className="font-mono text-xs text-white/50 tracking-widest uppercase">Live Feed</span>
      </div>
      <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap flex-1 opacity-90 relative z-10 w-full">
        {text}<span className="inline-block w-2 bg-accent ml-1 animate-pulse">_</span>
      </pre>
    </div>
  );
};

const CursorProtocolScheduler = () => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const containerRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.fromTo(cursorRef.current, { x: 50, y: 150, opacity: 0 }, { x: 50, y: 150, opacity: 1, duration: 0.5 })
        .to(cursorRef.current, { x: 130, y: 55, duration: 1, ease: 'power2.inOut' })
        .to(cursorRef.current, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })
        .to('.highlight-target', { backgroundColor: 'rgba(204,88,51,0.1)', borderColor: 'rgba(204,88,51,0.3)', color: '#CC5833', duration: 0.2 }, '-=0.1')
        .to(cursorRef.current, { x: 230, y: 135, duration: 0.8, ease: 'power1.inOut', delay: 0.5 })
        .to(cursorRef.current, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })
        .to(cursorRef.current, { opacity: 0, duration: 0.4, delay: 0.2 })
        .to('.highlight-target', { backgroundColor: 'rgba(46,64,54,0.05)', borderColor: 'transparent', color: 'rgba(46,64,54,0.4)', duration: 0.2 }, '-=0.2');
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-background border border-primary/10 rounded-[2rem] p-6 shadow-xl h-64 max-w-sm mx-auto w-full relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-sans font-bold text-lg">Strategy Session</h3>
        <span className="text-xs bg-dark text-background px-2 py-1 rounded-full font-mono">THAI/US</span>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-6">
        {days.map((d, i) => (
          <div key={i} className={`h-8 rounded-md flex items-center justify-center text-xs font-mono font-bold ${i === 3 ? 'highlight-target' : ''} bg-primary/5 text-primary/40`}>
            {d}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center bg-primary/5 p-3 rounded-xl border border-primary/5">
        <div className="text-xs font-medium text-dark/70">Global Expertise, Local Action</div>
        <button className="bg-primary text-background font-bold text-xs px-4 py-1.5 rounded-full btn-magnetic">Save</button>
      </div>
      <div ref={cursorRef} className="absolute z-20 pointer-events-none drop-shadow-md text-dark">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          <path d="M13 13l6 6" />
        </svg>
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <section id="features" className="py-24 md:py-40 px-6 md:px-16 bg-background relative z-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 md:mb-32">
          <h2 className="font-outfit font-bold text-accent tracking-widest uppercase text-sm mb-4">Functional Artifacts</h2>
          <h3 className="font-drama italic text-5xl md:text-7xl tracking-tight text-dark relative z-10 w-full overflow-hidden">
            Engineered for Action.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 overflow-visible">
          <div className="flex flex-col flex-1 h-full w-full">
            <DiagnosticShuffler />
            <div className="text-center mt-8">
              <h4 className="font-sans font-bold text-xl mb-2">Practical Infrastructure</h4>
              <p className="font-sans text-dark/70 max-w-xs mx-auto text-sm">Lean, automated, and AI-driven architecture scaled precisely for your needs.</p>
            </div>
          </div>
          <div className="flex flex-col flex-1 h-full w-full">
            <TelemetryTypewriter />
            <div className="text-center mt-8">
              <h4 className="font-sans font-bold text-xl mb-2">Financial Edge</h4>
              <p className="font-sans text-dark/70 max-w-xs mx-auto text-sm">Data strategies designed exclusively to optimize bottom lines and PnL.</p>
            </div>
          </div>
          <div className="flex flex-col flex-1 h-full w-full">
            <CursorProtocolScheduler />
            <div className="text-center mt-8">
              <h4 className="font-sans font-bold text-xl mb-2">Empathy & Execution</h4>
              <p className="font-sans text-dark/70 max-w-xs mx-auto text-sm">Silicon Valley veteran analytics guided by deep Thai market intuition.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Philosophy = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Setup word spans
      const words = gsap.utils.toArray('.reveal-word');
      gsap.from(words, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out'
      });

      gsap.to('.parallax-bg', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        },
        y: 100,
        ease: 'none'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const statement1 = "Most data consulting focuses on: bulky, theoretical frameworks.";
  const statement2 = "We focus on: actionable Profit.";

  const spanWrap = (text, isSub) => text.split(' ').map((word, i) => (
    <span key={i} className={`reveal-word inline-block mr-3 ${word === 'Profit.' ? 'text-accent' : ''}`}>{word}</span>
  ));

  return (
    <section ref={containerRef} id="philosophy" className="relative w-full py-32 md:py-56 bg-dark text-background overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 z-0 opacity-[0.15]">
        <img
          src="https://images.unsplash.com/photo-1620803624823-3221b72e5058?q=80&w=2574&auto=format&fit=crop"
          alt="Microscopy Texture"
          className="w-full h-[150%] object-cover parallax-bg -mt-[25%]"
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 md:px-16 flex flex-col gap-12">
        <h2 className="font-sans font-medium text-xl md:text-3xl text-background/60 leading-relaxed max-w-2xl">
          {spanWrap(statement1, true)}
        </h2>

        <h3 className="font-drama italic text-5xl md:text-[clamp(4rem,9vw,9rem)] leading-[0.9] tracking-tighter w-full text-right ml-auto">
          {spanWrap(statement2, false)}
        </h3>
      </div>
    </section>
  );
};

const Protocol = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.protocol-card');

      cards.forEach((card, index) => {
        if (index === cards.length - 1) return; // Last card doesn't pin/fade out

        gsap.to(card, {
          scale: 0.9,
          opacity: 0.5,
          filter: 'blur(20px)',
          scrollTrigger: {
            trigger: card,
            start: "top top",
            endTrigger: cards[index + 1],
            end: "top top",
            pin: true,
            pinSpacing: false,
            scrub: true,
          }
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="protocol" className="w-full bg-background relative z-10">
      {/* Card 1 */}
      <div className="protocol-card relative z-10 h-[100dvh] w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 bg-background">
        <div className="flex-1 max-w-xl">
          <div className="font-mono text-accent text-lg mb-6 tracking-widest">[STEP 01]</div>
          <h2 className="font-outfit font-bold text-4xl md:text-6xl mb-6">Discovery & Architecture</h2>
          <p className="font-sans text-dark/70 text-lg md:text-xl">
            We map your entire data landscape to identify inefficiencies.
            Designing a robust foundation before writing a single line of code.
          </p>
        </div>
        <div className="flex-1 flex justify-center w-full mt-12 md:mt-0 relative h-64 md:h-full items-center">
          <svg className="w-64 h-64 md:w-96 md:h-96 animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-primary/20" strokeWidth="1" strokeDasharray="4 4" />
            <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" className="text-accent" strokeWidth="0.5" transform="rotate(45 50 50)" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" className="text-primary" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Card 2 */}
      <div className="protocol-card relative z-20 h-[100dvh] w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 bg-background shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <div className="flex-1 max-w-xl">
          <div className="font-mono text-accent text-lg mb-6 tracking-widest">[STEP 02]</div>
          <h2 className="font-outfit font-bold text-4xl md:text-6xl mb-6">Implementation & Automation</h2>
          <p className="font-sans text-dark/70 text-lg md:text-xl">
            Deploying AI-driven pipelines that gather, clean, and categorize data autonomously.
            Zero manual intervention required.
          </p>
        </div>
        <div className="flex-1 w-full h-64 md:h-96 flex items-center justify-center relative mt-12 md:mt-0">
          <div className="w-full max-w-md h-full bg-primary/5 rounded-[2rem] border border-primary/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(46,64,54,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(46,64,54,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            <div className="absolute w-full h-[2px] bg-accent shadow-[0_0_15px_rgba(204,88,51,0.8)] animate-[scan_4s_ease-in-out_infinite_alternate]" style={{ top: '50%' }}>
              <style>{`
                @keyframes scan {
                  0% { transform: translateY(-100px); }
                  100% { transform: translateY(100px); }
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="protocol-card relative z-30 h-[100dvh] w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 bg-background shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <div className="flex-1 max-w-xl">
          <div className="font-mono text-accent text-lg mb-6 tracking-widest">[STEP 03]</div>
          <h2 className="font-outfit font-bold text-4xl md:text-6xl mb-6">Financial Strategy & Growth</h2>
          <p className="font-sans text-dark/70 text-lg md:text-xl">
            Bridging technical outputs to executive bottom lines.
            Data translated directly into actionable profit strategies.
          </p>
        </div>
        <div className="flex-1 flex justify-center w-full mt-12 md:mt-0 items-center">
          <svg className="w-full max-w-md" viewBox="0 0 200 40">
            <path
              d="M0,20 L40,20 L50,0 L60,40 L70,20 L200,20"
              fill="none"
              stroke="currentColor"
              className="text-accent drop-shadow-md animate-[dash_3s_linear_infinite]"
              strokeWidth="2"
              strokeDasharray="200"
              strokeDashoffset="200"
            />
            <style>{`
              @keyframes dash {
                to { stroke-dashoffset: 0; }
              }
            `}</style>
          </svg>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="w-full bg-dark text-[#E8E4DD] rounded-t-[4rem] pt-24 pb-12 px-6 md:px-16 mt-[-4rem] relative z-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-16 md:gap-8 border-b border-white/10 pb-16">
        <div className="max-w-xs">
          <div className="font-sans font-bold tracking-tight text-3xl text-white mb-6">BigTre</div>
          <p className="font-sans text-white/50 text-sm leading-relaxed mb-8">
            Making your data work the way it was promised. Lean, profitable, and uncompromisingly precise.
          </p>
          <a href="mailto:contact@bigtre.business" className="btn-magnetic inline-block bg-accent px-6 py-3 rounded-full text-white font-bold text-sm tracking-wide">
            <span className="btn-hover-layer"></span>
            <span className="relative z-10 flex items-center gap-2">Contact Us <ArrowRight size={16} /></span>
          </a>
        </div>

        <div className="grid grid-cols-2 flex-1 gap-8 md:pl-32 max-w-2xl">
          <div>
            <h4 className="font-mono text-xs text-white/40 tracking-widest uppercase mb-6">Navigation</h4>
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li><a href="#hero" className="hover:text-accent transition-colors">Home</a></li>
              <li><a href="#features" className="hover:text-accent transition-colors">Platform</a></li>
              <li><a href="#philosophy" className="hover:text-accent transition-colors">Philosophy</a></li>
              <li><a href="#protocol" className="hover:text-accent transition-colors">Protocol</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs text-white/40 tracking-widest uppercase mb-6">Legal</h4>
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li><a href="#" className="hover:text-accent transition-colors text-white/70">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors text-white/70">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 text-xs font-mono text-white/30 gap-4">
        <div>&copy; 2026 BigTre Data Infrastructure.</div>
        <div className="flex items-center gap-3 bg-white/5 pl-2 pr-4 py-1.5 rounded-full border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="text-white/60 tracking-widest">SYSTEM OPERATIONAL</span>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <main className="max-w-[100vw] min-h-screen bg-background text-dark font-sans selection:bg-accent selection:text-white pb-20 overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Philosophy />
      <Protocol />
      <Footer />
    </main>
  );
}
