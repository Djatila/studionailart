import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Smartphone,
  Clock,
  Bell,
  Share2,
  UserPlus,
  Star,
  ChevronRight,
  ChevronUp,
  Menu,
  X,
  Instagram,
  MessageCircle,
  Palette,
  User,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Award,
  Heart,
  ArrowRight,
  Play,
  Check,
  AlertCircle,
  Target,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { LegalModal } from './src/components/LegalModal';


// Scroll To Top Component
const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`scroll-to-top fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 p-3 md:p-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 border-2 border-white/20 !w-auto ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      aria-label="Voltar ao topo"
      style={{ width: 'auto', minWidth: 'auto' }}
    >
      <ChevronUp className="w-5 h-5 md:w-6 md:h-6" />
    </button>
  );
};


// Reveal Animation Component
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Force initial state to be applied
    setIsMounted(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay]);

  // Don't render children until mounted to ensure initial state
  if (!isMounted) {
    return (
      <div ref={ref} className={className} style={{ opacity: 0, transform: 'translateY(48px)', filter: 'blur(2px)' }}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : 'translateY(48px)',
        filter: isVisible ? 'blur(0px)' : 'blur(2px)',
        transition: 'opacity 1s ease-out, transform 1s ease-out, filter 1s ease-out',
        willChange: isVisible ? 'auto' : 'opacity, transform, filter'
      }}
    >
      {children}
    </div>
  );
};

// Enhanced Button Component
const Button: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
}> = ({
  children,
  className = '',
  onClick,
  variant = 'primary',
  size = 'md'
}) => {
    const baseStyles = "relative inline-flex items-center justify-center gap-3 font-semibold transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-pink-400/50 overflow-hidden group";

    const sizeStyles = {
      sm: "px-6 py-3 text-sm rounded-2xl",
      md: "px-8 py-4 text-base rounded-3xl",
      lg: "px-10 py-5 text-lg rounded-3xl"
    };

    const variants = {
      primary: "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:shadow-pink-500/25 hover:scale-105 active:scale-95",
      outline: "bg-transparent border-2 border-white/30 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/50 hover:scale-105 active:scale-95",
      gradient: "bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white shadow-xl hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 active:scale-95"
    };

    return (
      <button
        onClick={onClick}
        className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {/* Button Content */}
        <span className="relative z-10 flex items-center gap-3">
          {children}
        </span>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-400/0 via-pink-400/20 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
      </button>
    );
  };

const App: React.FC = () => {
  const [activeLegalDoc, setActiveLegalDoc] = useState<'terms' | 'privacy' | 'lgpd' | 'cookies' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Smooth scroll function
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false); // Close mobile menu after click
  };

  // Parallax effect and scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxScroll) * 100;

      setScrollProgress(progress);

      // Parallax effect
      const parallaxElements = document.querySelectorAll('.parallax-element');
      parallaxElements.forEach((element) => {
        const speed = parseFloat(element.getAttribute('data-speed') || '0.5');
        const yPos = -(scrolled * speed);
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-700 text-white selection:bg-white selection:text-purple-600 scroll-snap-container">
      {/* Fix for scroll-to-top button in mobile */}
      <style>{`
        @media (max-width: 768px) {
          button.scroll-to-top {
            width: auto !important;
            min-width: auto !important;
          }
        }
      `}</style>

      {/* Scroll Progress Indicator */}
      <div className="scroll-progress">
        <div
          className="scroll-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <ScrollToTop />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Studio Nail Art</span>
          </div>
          <div className="hidden md:flex gap-8 items-center font-medium">
            <button onClick={() => smoothScrollTo('como-funciona')} className="hover:text-pink-300 transition-colors cursor-pointer">Como Funciona</button>
            <button onClick={() => smoothScrollTo('vantagens')} className="hover:text-pink-300 transition-colors cursor-pointer">Vantagens</button>
            <button onClick={() => smoothScrollTo('depoimentos')} className="hover:text-pink-300 transition-colors cursor-pointer">Depoimentos</button>
            <button onClick={() => smoothScrollTo('precos')} className="hover:text-pink-300 transition-colors cursor-pointer">Preço</button>
            <Button size="sm">Entrar</Button>
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/10 z-40">
            <div className="px-6 py-4 space-y-4">
              <button onClick={() => smoothScrollTo('como-funciona')} className="block w-full text-left py-2 hover:text-pink-300 transition-colors">Como Funciona</button>
              <button onClick={() => smoothScrollTo('vantagens')} className="block w-full text-left py-2 hover:text-pink-300 transition-colors">Vantagens</button>
              <button onClick={() => smoothScrollTo('depoimentos')} className="block w-full text-left py-2 hover:text-pink-300 transition-colors">Depoimentos</button>
              <button onClick={() => smoothScrollTo('precos')} className="block w-full text-left py-2 hover:text-pink-300 transition-colors">Preços</button>
              <div className="pt-2">
                <Button size="sm" className="w-full">Entrar</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative pt-32 pb-20 px-6 overflow-hidden smooth-scroll-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
            {/* Hero Content - Order 1 on mobile, 1 on desktop */}
            <div className="text-center lg:text-left space-y-8">
              {/* Trust Badge */}
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/90 mb-4 border border-white/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Mais de 200+ nail designers já usam</span>
                </div>
              </Reveal>

              {/* Main Headline */}
              <Reveal delay={200}>
                <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
                  Pare de perder tempo no WhatsApp respondendo{' '}
                  <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">"Tem horário hoje?"</span>
                </h1>
              </Reveal>

              {/* Sub-headline */}
              <Reveal delay={400}>
                <p className="text-xl lg:text-2xl text-white/80 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Tenha sua própria agenda online personalizada. Suas clientes agendam sozinhas, 24 horas por dia, e você foca no que importa: <strong className="text-pink-300 font-semibold">fazer unhas incríveis</strong>.
                </p>
              </Reveal>

              {/* Value Proposition */}
              <Reveal delay={600}>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Configuração em 2 minutos</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Teste grátis por 3 dias</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Link personalizado</span>
                  </div>
                </div>
              </Reveal>

              {/* CTA Section - Desktop Only */}
              <Reveal delay={800}>
                <div className="space-y-6 hidden lg:block">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                      <Sparkles className="w-5 h-5" />
                      Criar Minha Agenda Grátis
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Social Proof */}
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-white/60">
                    <div className="flex -space-x-2">
                      {[
                        "https://i.pravatar.cc/150?img=32",
                        "https://i.pravatar.cc/150?img=5",
                        "https://i.pravatar.cc/150?img=9",
                        "https://i.pravatar.cc/150?img=20",
                        "https://i.pravatar.cc/150?img=44"
                      ].map((url, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden relative">
                          <img
                            src={url}
                            alt={`Nail Designer ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <span>Junte-se a centenas de profissionais</span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Phone Mockup - Order 2 on mobile, 2 on desktop */}
            <Reveal delay={400}>
              <div className="relative flex justify-center items-center phone-container phone-mockup-container">
                {/* Background Glow Effects */}
                <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-red-500/20 blur-[120px] rounded-full animate-pulse parallax-element" data-speed="0.3"></div>

                {/* Phone Shadow on Ground */}
                <div className="absolute bottom-[-100px] w-[200px] h-[40px] bg-black/20 rounded-full blur-xl animate-phone-shadow"></div>

                {/* Premium Phone Mockup */}
                <div
                  className="phone-mockup relative w-[320px] h-[640px] bg-gradient-to-b from-gray-900 to-black rounded-[3.5rem] border-[12px] border-gray-800 overflow-hidden ring-1 ring-white/10"
                  style={{
                    animation: 'phoneFloat 3s ease-in-out infinite, phoneGlow 3s ease-in-out infinite',
                    transformOrigin: 'center center',
                    willChange: 'transform'
                  }}
                >

                  {/* Phone Notch/Dynamic Island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-36 h-8 bg-black rounded-full z-30 flex items-center justify-center gap-3 border border-gray-700">
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    <div className="w-12 h-1.5 rounded-full bg-gray-700"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  </div>

                  {/* Screen Reflection */}
                  <div className="absolute inset-0 pointer-events-none z-20 opacity-20 bg-gradient-to-tr from-transparent via-white/10 to-white/20 group-hover:opacity-30 transition-opacity"></div>

                  {/* Screen Content - Custom Image */}
                  <div className="w-full h-full relative overflow-hidden">
                    <img
                      src="/screen-content.png"
                      alt="App Screen"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-pink-500/30 to-transparent rounded-full blur-2xl animate-float parallax-element" data-speed="0.2" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-br from-purple-500/30 to-transparent rounded-full blur-3xl animate-float parallax-element" data-speed="0.4" style={{ animationDelay: '2s' }}></div>
              </div>
            </Reveal>

          </div>

          {/* CTA Section - Mobile Only (Below Mockup) */}
          <Reveal delay={800}>
            <div className="space-y-6 text-center mb-12 block lg:hidden">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                  <Sparkles className="w-5 h-5" />
                  Criar Minha Agenda
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center gap-3 text-sm text-white/60">
                <div className="flex -space-x-2">
                  {[
                    "https://i.pravatar.cc/150?img=32",
                    "https://i.pravatar.cc/150?img=5",
                    "https://i.pravatar.cc/150?img=9",
                    "https://i.pravatar.cc/150?img=20",
                    "https://i.pravatar.cc/150?img=44"
                  ].map((url, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden relative">
                      <img
                        src={url}
                        alt={`Nail Designer ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span>Junte-se a centenas de profissionais</span>
              </div>
            </div>
          </Reveal>

          {/* Social Proof Strip - Now inside Hero Section, below mockup */}
          <div className="py-12 bg-black/20 rounded-3xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center text-center px-6">
              <Reveal>
                <div className="space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">200+</div>
                  <p className="text-white/70 text-sm">Nail designers ativas</p>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">40%</div>
                  <p className="text-white/70 text-sm">Aumento médio em agendamentos</p>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">3h</div>
                  <p className="text-white/70 text-sm">Economizadas por dia</p>
                </div>
              </Reveal>

              <Reveal delay={300}>
                <div className="space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">24/7</div>
                  <p className="text-white/70 text-sm">Sistema funcionando</p>
                </div>
              </Reveal>
            </div>


          </div>
          {/* Tagline below statistics */}
          <Reveal delay={400}>
            <div className="mt-8 text-center">
              <p className="text-lg md:text-xl text-white/80 font-medium">
                Criado para a rotina real da Nail Designer — sem funções inúteis, só o que importa✅
              </p>
            </div>
          </Reveal>
        </div>
      </section >

      {/* Problem Section */}
      < section id="problemas" className="py-20 px-6 bg-black/20 smooth-scroll-section" >
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <Reveal>
              <h2 className="text-4xl lg:text-5xl font-bold">Sua rotina é assim? 🤯</h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Pare de sofrer com esses problemas que todo profissional da beleza enfrenta
              </p>
            </Reveal>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Problems Side */}
            <div className="space-y-6">
              <Reveal>
                <h3 className="text-2xl font-bold text-red-400 mb-8 flex items-center gap-3">
                  <AlertCircle className="w-8 h-8" />
                  Problemas do dia a dia
                </h3>
              </Reveal>

              {[
                {
                  icon: "📱",
                  title: "Celular não para de apitar",
                  desc: "Mensagens de clientes enquanto você está atendendo outras pessoas, interrompendo seu trabalho constantemente."
                },
                {
                  icon: "🌙",
                  title: "Clientes de madrugada",
                  desc: "Perguntando horários fora do seu expediente, sem respeitar seu tempo de descanso."
                },
                {
                  icon: "📅",
                  title: "Confusão na agenda",
                  desc: "Furos de última hora, desencontros de horários e clientes que não aparecem."
                },
                {
                  icon: "⏰",
                  title: "Tempo perdido",
                  desc: "Digitando as mesmas respostas todos os dias, perdendo tempo que poderia ser produtivo."
                }
              ].map((problem, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="flex gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:-translate-y-1 group">
                    <div className="text-3xl group-hover:scale-110 transition-transform">
                      {problem.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">{problem.title}</h4>
                      <p className="text-white/70 text-sm leading-relaxed">{problem.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Solutions Side */}
            <div className="space-y-6">
              <Reveal delay={200}>
                <h3 className="text-2xl font-bold text-green-400 mb-8 flex items-center gap-3">
                  <CheckCircle className="w-8 h-8" />
                  Com Studio Nail Art
                </h3>
              </Reveal>

              {[
                {
                  icon: "🔕",
                  title: "Silêncio durante o trabalho",
                  desc: "Clientes agendam sozinhas sem te interromper. Você trabalha em paz e com foco total."
                },
                {
                  icon: "🤖",
                  title: "Atendimento automático 24h",
                  desc: "Sistema funciona 24 horas respondendo por você, mesmo quando está dormindo."
                },
                {
                  icon: "📋",
                  title: "Agenda sempre organizada",
                  desc: "Tudo sincronizado automaticamente, sem conflitos de horário ou confusões."
                },
                {
                  icon: "⚡",
                  title: "Mais tempo para você",
                  desc: "Foque no que realmente importa: criar nail arts incríveis e atender bem suas clientes."
                }
              ].map((solution, i) => (
                <Reveal key={i} delay={200 + i * 100}>
                  <div className="flex gap-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:-translate-y-1 group">
                    <div className="text-3xl group-hover:scale-110 transition-transform">
                      {solution.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">{solution.title}</h4>
                      <p className="text-white/70 text-sm leading-relaxed">{solution.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Transformation Message */}
          <Reveal delay={600}>
            <div className="mt-16 text-center">
              <div className="inline-block p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-pink-500/30">
                <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent mb-4">
                  Transforme sua rotina hoje mesmo!
                </p>
                <p className="text-white/80 mb-6 max-w-2xl">
                  Chega de amadorismo. Seja uma nail designer de elite com sistema profissional de agendamento que suas clientes vão amar.
                </p>
                <Button variant="gradient" size="lg">
                  <Sparkles className="w-5 h-5" />
                  Quero Me Profissionalizar Agora
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section >

      {/* Features Section */}
      < section id="vantagens" className="py-20 px-6 smooth-scroll-section" >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <Reveal>
              <h2 className="text-4xl lg:text-5xl font-bold">Seu Espaço, Seu Link, Suas Regras</h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Ao se cadastrar, você ganha um endereço exclusivo na internet para colocar na Bio do Instagram ou enviar no WhatsApp.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-full border border-pink-500/30">
                <span className="text-lg font-mono bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent font-semibold">studionailart.space/sua-marca</span>
              </div>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Sem Misturas",
                desc: "Sua cliente vê apenas a SUA agenda e os SEUS horários. Nada de links complicados ou portais lentos com várias profissionais misturadas.",
                benefits: ["Link personalizado exclusivo", "Página 100% sua", "Carregamento rápido", "Design profissional"]
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Sem Concorrência",
                desc: "Não mostramos outras profissionais na sua página. O palco é todo seu e o foco da cliente é 100% em você e nos seus serviços.",
                benefits: ["Zero competição", "Sua marca em evidência", "Clientes focadas em você", "Aumente sua conversão"]
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Profissionalismo Premium",
                desc: "Mostre que você é uma nail designer de elite com um sistema organizado que valoriza seu trabalho e o tempo das suas clientes.",
                benefits: ["Imagem profissional", "Sistema confiável", "Notificações automáticas", "Relatórios detalhados"]
              }
            ].map((feat, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 hover:border-pink-500/40 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-pink-500/20 h-full group">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-pink-500/20 transition-colors duration-300 mb-6 text-pink-400">
                    {feat.icon}
                  </div>
                  <h3 className="text-2xl font-bold group-hover:text-pink-300 transition-colors mb-4">{feat.title}</h3>
                  <p className="text-white/70 leading-relaxed mb-6">{feat.desc}</p>

                  <div className="space-y-3">
                    {feat.benefits.map((benefit, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span className="text-white/90 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-pink-300 font-bold mt-6">
                    <Target className="w-5 h-5" />
                    <span>Benefício Garantido</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section >

      {/* How It Works Section */}
      < section id="como-funciona" className="py-20 px-6 bg-white/5 smooth-scroll-section" >
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Passo a Passo Simples</h2>
          </Reveal>
          <div className="grid md:grid-cols-5 gap-8">
            {[
              {
                icon: <UserPlus className="w-8 h-8" />,
                step: "1",
                title: "Crie sua Conta",
                desc: "Leva menos de 2 minutos. Basta seu nome, e-mail e escolher seu link personalizado."
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                step: "2",
                title: "Adicione seus Serviços",
                desc: "Cadastre os serviços que você oferece, defina os preços e a duração de cada um."
              },
              {
                icon: <Clock className="w-8 h-8" />,
                step: "3",
                title: "Configure Horários",
                desc: "Defina quando quer trabalhar, quais dias folgar e quanto tempo cada serviço demora."
              },
              {
                icon: <Share2 className="w-8 h-8" />,
                step: "4",
                title: "Compartilhe o Link",
                desc: "Coloque na bio do Instagram, Stories, WhatsApp Status e envie para suas clientes."
              },
              {
                icon: <Bell className="w-8 h-8" />,
                step: "5",
                title: "Receba Agendamentos",
                desc: "Suas clientes agendam sozinhas e você recebe notificações automáticas."
              }
            ].map((step, i) => (
              <Reveal key={i} delay={i * 200} className="relative">
                <div className="p-6 text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl relative z-10 text-white">
                    {step.icon}
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-white text-pink-600 rounded-full flex items-center justify-center font-bold shadow-lg text-sm">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
                </div>

                {/* Connection Line */}
                {i < 4 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-pink-500/50 to-purple-500/50 z-0"></div>
                )}
              </Reveal>
            ))}
          </div>

          <Reveal delay={800}>
            <div className="text-center mt-12">
              <Button variant="gradient" size="lg">
                <Zap className="w-5 h-5" />
                Começar Agora - É Grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section >

      {/* Testimonials Section */}
      < section id="depoimentos" className="py-20 px-6 bg-black/20 smooth-scroll-section" >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <Reveal>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full text-pink-300 font-bold text-sm uppercase tracking-widest mb-4">
                Elite Nail Designers
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="text-4xl lg:text-5xl font-bold">O que nossas clientes dizem</h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Resultados reais de profissionais que transformaram seus negócios
              </p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Mariana Silva",
                role: "Nail Designer Premium",
                location: "São Paulo, SP",
                avatar: "MS",
                rating: 5,
                result: "+65% agendamentos",
                testimonial: "Minha agenda lotou completamente! Antes eu ficava correndo atrás de cliente, agora elas me procuram direto pelo link. Melhor investimento que já fiz no meu negócio!",
                timeUsing: "3 meses usando",
                revenue: "R$ 8.500/mês"
              },
              {
                name: "Carla Mendes",
                role: "Manicure & Pedicure",
                location: "Rio de Janeiro, RJ",
                avatar: "CM",
                rating: 5,
                result: "4h economizadas/dia",
                testimonial: "Não preciso mais ficar respondendo WhatsApp o dia todo. O sistema faz tudo sozinho e eu posso focar nas minhas clientes. Minha qualidade de vida melhorou muito!",
                timeUsing: "6 meses usando",
                revenue: "R$ 6.200/mês"
              },
              {
                name: "Ana Costa",
                role: "Studio Owner",
                location: "Belo Horizonte, MG",
                avatar: "AC",
                rating: 5,
                result: "+40% faturamento",
                testimonial: "Profissionalizou completamente meu negócio. As clientes me veem como uma empresa séria agora. Consegui aumentar meus preços e elas aceitam numa boa!",
                timeUsing: "1 ano usando",
                revenue: "R$ 12.800/mês"
              }
            ].map((testimonial, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 hover:scale-105 transition-all duration-300 group border border-white/10 hover:border-pink-500/30 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {testimonial.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg">{testimonial.name}</h4>
                      <p className="text-white/60 text-sm">{testimonial.role}</p>
                      <p className="text-white/50 text-xs">{testimonial.location}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>

                  {/* Results */}
                  <div className="flex gap-3 mb-4">
                    <div className="inline-block px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full text-green-400 font-bold text-xs">
                      {testimonial.result}
                    </div>
                    <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full text-blue-400 font-bold text-xs">
                      {testimonial.revenue}
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-white/90 leading-relaxed mb-6 italic flex-1">
                    "{testimonial.testimonial}"
                  </blockquote>

                  {/* Time Using */}
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>{testimonial.timeUsing}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Trust Signals */}
          <Reveal delay={600}>
            <div className="text-center space-y-8">
              <h3 className="text-2xl font-bold text-white mb-8">Por que confiar no Studio Nail Art?</h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Shield className="w-8 h-8 text-green-400" />,
                    title: "Garantia 30 dias",
                    desc: "Não gostou? Devolvemos 100% do seu dinheiro"
                  },
                  {
                    icon: <MessageCircle className="w-8 h-8 text-blue-400" />,
                    title: "Suporte Premium",
                    desc: "Atendimento rápido via WhatsApp todos os dias"
                  },
                  {
                    icon: <Star className="w-8 h-8 text-yellow-400" />,
                    title: "4.9/5 estrelas",
                    desc: "Avaliação média de mais de 200 usuárias"
                  },
                  {
                    icon: <Zap className="w-8 h-8 text-purple-400" />,
                    title: "99.9% Uptime",
                    desc: "Sistema sempre funcionando, 24h por dia"
                  }
                ].map((trust, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:scale-105 transition-transform group">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                      {trust.icon}
                    </div>
                    <h4 className="font-bold text-white mb-2">{trust.title}</h4>
                    <p className="text-white/60 text-sm">{trust.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section >

      {/* Pricing Section */}
      < section id="precos" className="py-20 px-6 smooth-scroll-section" >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <Reveal>
              <h2 className="text-4xl lg:text-5xl font-bold">Plano Único que Cabe no seu Bolso, sem custo adicional. </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-xl text-white/70">
                O plano ideal para o seu negócio, na medida e no precinho. com 3 dias grátis,  por tão pouco você tem acesso a tudo que tem direito! 😊✨
              </p>
            </Reveal>
          </div>

          {/* Single Pro Plan - Centered and Highlighted */}
          <div className="max-w-xl mx-auto">
            <Reveal>
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl p-10 border-2 border-pink-500/40 relative overflow-visible shadow-2xl hover:shadow-pink-500/30 transition-all duration-300 hover:scale-105">
                {/* Popular Badge */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full text-base font-bold shadow-xl z-10 whitespace-nowrap">
                  Premium
                </div>

                <div className="text-center mb-8 mt-6">
                  <h3 className="text-3xl font-bold mb-2">Pro</h3>
                  <p className="text-white/70 mb-6 text-lg">Plano único sem rodeios</p>
                  <div className="mb-3">
                    <div className="text-5xl font-bold flex items-center justify-center gap-1">
                      <span className="text-2xl text-white/60">R$</span>
                      <span>39,90</span>
                    </div>
                    <div className="text-xl text-white/60 mt-1">nos 3 primeiros mêses</div>
                  </div>
                  <p className="text-base text-white/70"> Logo após os 3 meses pague apenas R$ 49,90</p>
                  <div className="mt-4">
                    <span className="inline-block px-6 py-2 rounded-full bg-white/10 text-green-400 text-base font-medium border border-white/10">
                      Teste 3 dias grátis✨
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    "Agenda online personalizada",
                    "Agendamentos ilimitados",
                    "Múltiplos serviços e preços",
                    "Relatórios detalhados",
                    "Link exclusivo (studionailart.space/você)",
                    "Lembretes automáticos",
                    "Suporte prioritário",
                    "Notificações por WhatsApp",
                    "Suporte Exclusivo"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400 shrink-0" />
                      <span className="text-white/90 text-base">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button variant="gradient" className="w-full" size="lg">
                  <Sparkles className="w-5 h-5" />
                  Começar Teste Grátis
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={400}>
            <div className="text-center mt-12 space-y-4">
              <p className="text-white/60">
                💳 Pagamentos somente em PIX
              </p>
              <p className="text-white/60">
                🔒 Plataforma 100% segura
              </p>
              <p className="text-white/60">
                ❌ Cancele quando quiser, sem multa
              </p>
            </div>
          </Reveal>
        </div>
      </section >

      {/* Final CTA Section */}
      < section className="py-20 px-6 bg-black/40" >
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Reveal>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Pronto para <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">Revolucionar</span> sua Agenda?
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Junte-se a mais de 200 nail designers que já transformaram seus negócios.
              Comece seu teste grátis agora e veja a diferença em 24 horas!
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div className="space-y-6">
              <Button variant="gradient" size="lg" className="text-xl px-12 py-6">
                <Zap className="w-6 h-6" />
                Começar Meu Teste Grátis Agora
                <ArrowRight className="w-6 h-6" />
              </Button>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>7 dias grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={600}>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-12 text-center md:text-left">
              <div className="flex -space-x-4 justify-center">
                {[
                  "https://i.pravatar.cc/150?img=32",
                  "https://i.pravatar.cc/150?img=5",
                  "https://i.pravatar.cc/150?img=9",
                  "https://i.pravatar.cc/150?img=20",
                  "https://i.pravatar.cc/150?img=44",
                  "https://i.pravatar.cc/150?img=1"
                ].map((url, i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden relative">
                    <img
                      src={url}
                      alt={`Nail Designer ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-semibold text-lg">Mais de 200 nail designers</p>
                <p className="text-white/60">já transformaram seus negócios</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section >

      {/* Footer */}
      < footer className="py-12 px-6 bg-black/60 border-t border-white/10" >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Studio Nail Art</span>
              </div>
              <p className="text-white/60 text-sm">
                Criado para a rotina real da Nail Designer — sem funções inúteis, só o que importa!
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pink-500/20 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pink-500/20 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="font-bold text-pink-300">Produto</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="font-bold text-pink-300">Suporte</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">WhatsApp</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="font-bold text-pink-300">Legal</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveLegalDoc('terms'); }} className="hover:text-white transition-colors">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveLegalDoc('privacy'); }} className="hover:text-white transition-colors">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveLegalDoc('lgpd'); }} className="hover:text-white transition-colors">
                    LGPD
                  </a>
                </li>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveLegalDoc('cookies'); }} className="hover:text-white transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
            <p>© 2025 Studio Nail Art. Todos os direitos reservados.</p>
            <p>Desenvolvido por Átila Azevedo</p>
          </div>
        </div>
      </footer >

      <LegalModal
        isOpen={!!activeLegalDoc}
        type={activeLegalDoc}
        onClose={() => setActiveLegalDoc(null)}
      />
    </div >
  );
};

export default App;

// Força atualização - Landing page completa com mockup do celular