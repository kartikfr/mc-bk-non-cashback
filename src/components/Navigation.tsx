import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import logo from "@/assets/moneycontrol-logo.png";
import { useAutoHideNav } from "@/hooks/useAutoHideNav";

type MobileNavItem = {
  label: string;
  to?: string;
  description?: string;
  action?: () => void;
};

type MobileSection = {
  title: string;
  items: MobileNavItem[];
};

interface MobileMenuOverlayProps {
  open: boolean;
  onClose: () => void;
  sections: MobileSection[];
  logoSrc: string;
  onBlogClick: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const MobileMenuOverlay = ({
  open,
  onClose,
  sections,
  logoSrc,
  onBlogClick,
  triggerRef,
}: MobileMenuOverlayProps) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFocusRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  // Mount only when open to avoid unnecessary portals
  if (typeof document === "undefined") return null;

  useEffect(() => {
    if (!open) return;

    // Save previously focused element to restore later
    previousFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Initial focus: first focusable within, else dialog itself
    const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const first = focusable[0] || dialog;
    first.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusables.length === 0) {
          event.preventDefault();
          dialog.focus();
          return;
        }

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        const isShift = event.shiftKey;
        const current = document.activeElement as HTMLElement | null;

        if (!current) return;

        if (!isShift && current === lastEl) {
          event.preventDefault();
          firstEl.focus();
        } else if (isShift && current === firstEl) {
          event.preventDefault();
          lastEl.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Restore focus to trigger when closing
  useEffect(() => {
    if (!open && previousFocusedElementRef.current) {
      previousFocusedElementRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleDialogClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  };

  const content = (
    <>
      {/* Backdrop */}
      <div
        className="menu-backdrop lg:hidden"
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      {/* Overlay */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        className="menu-overlay open safe-area-inset-top lg:hidden"
        onClick={handleBackdropClick}
      >
        <div
          className="relative flex flex-col flex-1 bg-white dark:bg-slate-900 shadow-2xl"
          onClick={handleDialogClick}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 min-w-0">
              <img src={logoSrc} alt="MoneyControl" className="h-9 w-auto flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide font-semibold truncate">
                Menu
              </span>
            </div>
            <button
              ref={firstFocusRef}
              className="touch-target flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-white dark:bg-slate-900">
            {/* Home */}
            <Link
              to="/"
              className="block rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-5 py-4 text-lg font-bold text-slate-900 dark:text-slate-100 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              onClick={onClose}
            >
              Home
            </Link>

            {/* Discover */}
            <Link
              to="/cards"
              className="block rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-5 py-4 text-lg font-bold text-slate-900 dark:text-slate-100 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              onClick={onClose}
            >
              Discover
            </Link>

            {/* Tools Section */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 px-1">
                🛠️ Tools
              </p>
              <div className="space-y-2">
                {sections
                  .find((s) => s.title === "Tools")
                  ?.items.map((tool) =>
                    tool.to ? (
                      <Link
                        key={tool.to}
                        to={tool.to}
                        className="block rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-5 py-4 hover:border-primary/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        onClick={onClose}
                      >
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {tool.label}
                        </div>
                        {tool.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {tool.description}
                          </p>
                        )}
                      </Link>
                    ) : null
                  )}
              </div>
            </div>

            {/* Blogs */}
            <button
              onClick={() => {
                onClose();
                onBlogClick();
              }}
              className="w-full text-left rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-5 py-4 text-lg font-bold text-slate-900 dark:text-slate-100 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Blogs
            </button>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              Tap outside or press Esc to close
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
};

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const scrollYRef = useRef(0);
  
  // Auto-hide navigation on scroll
  const { style, isVisible } = useAutoHideNav({
    threshold: 10,
    duration: 300,
  });

  // Update CSS variable for nav height based on visibility
  const navHeight = isVisible ? '7rem' : '0rem';

  // Body scroll lock with scroll position preservation (iOS friendly)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const body = document.body;

    if (isMobileMenuOpen) {
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;
      body.classList.add('menu-scroll-lock');
      body.style.top = `-${scrollYRef.current}px`;
    } else {
      const prevTop = body.style.top;
      body.classList.remove('menu-scroll-lock');
      body.style.top = '';

      if (prevTop) {
        const y = Math.abs(parseInt(prevTop, 10)) || scrollYRef.current;
        window.scrollTo(0, y);
      }
    }

    return () => {
      body.classList.remove('menu-scroll-lock');
      body.style.top = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks: MobileNavItem[] = useMemo(() => ([
    { label: 'Home', to: '/' },
    { label: 'Discover', to: '/cards' },
  ]), []);

  const toolLinks: MobileNavItem[] = useMemo(() => ([
    { label: 'Super Card Genius', description: 'AI finds the right card for you.', to: '/card-genius' },
    { label: 'Category Card Genius', description: 'Find the best card for your spend style.', to: '/card-genius-category' },
    { label: 'Beat My Card', description: 'See if you can upgrade your card.', to: '/beat-my-card' },
  ]), []);

  const handleBlogNav = useCallback(() => {
    const scrollToBlog = () => {
      const blogSection = document.getElementById('blog');
      if (!blogSection) return;

      const rect = blogSection.getBoundingClientRect();
      const currentScroll = window.scrollY || window.pageYOffset || 0;
      const navOffset = 80; // approx nav height
      const targetY = Math.max(rect.top + currentScroll - navOffset, 0);

      window.scrollTo({
        top: targetY,
        behavior: 'smooth',
      });
    };

    if (window.location.pathname === '/') {
      scrollToBlog();
    } else {
      // Navigate to home first, then rely on hash + scroll behavior
      window.location.href = '/#blog';
    }
  }, []);

  const mobileSections: MobileSection[] = useMemo(() => ([
    {
      title: 'Navigate',
      items: navLinks
    },
    {
      title: 'Tools',
      items: toolLinks
    },
    {
      title: 'More',
      items: [
        {
          label: 'Blogs',
          action: handleBlogNav
        }
      ]
    }
  ]), [navLinks, toolLinks, handleBlogNav]);

  return <nav 
    className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border overflow-visible will-change-transform"
    style={{
      ...style,
      '--nav-height': navHeight,
    } as React.CSSProperties}
  >
      <div className="container mx-auto px-4 py-3 lg:py-4 overflow-visible">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="MoneyControl Credit Cards" className="h-12 xs:h-14 md:h-16 w-auto transition-all duration-200" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => <Link key={link.label} to={link.to} className="text-foreground hover:text-primary transition-colors font-medium">
                {link.label}
              </Link>)}
            
            {/* Tools Dropdown */}
            <div className="relative group">
              <button className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
                Tools
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-full right-0 mt-2 w-72 bg-background border border-border rounded-2xl shadow-xl py-2 z-[100]">
                  {toolLinks.map(tool => <Link key={tool.to} to={tool.to} className="block px-4 py-2.5 text-foreground hover:bg-accent transition-colors">
                      <div className="font-medium">{tool.label}</div>
                      <div className="text-xs text-muted-foreground">{tool.description}</div>
                    </Link>)}
                </div>
            </div>

            <button 
              onClick={handleBlogNav}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Blogs
            </button>

          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <button 
              ref={menuTriggerRef}
              className="p-3 rounded-xl bg-primary hover:bg-primary/90 active:bg-primary/80 transition-all touch-target shadow-lg" 
              onClick={() => setIsMobileMenuOpen(true)} 
              aria-label="Open navigation menu"
            >
              <div className="relative w-6 h-6 flex flex-col items-center justify-center gap-1.5">
                <span className="block w-6 h-0.5 bg-white rounded-full"></span>
                <span className="block w-6 h-0.5 bg-white rounded-full"></span>
                <span className="block w-6 h-0.5 bg-white rounded-full"></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer (portal overlay) */}
      <MobileMenuOverlay
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        sections={mobileSections}
        logoSrc={logo}
        onBlogClick={handleBlogNav}
        triggerRef={menuTriggerRef}
      />

    </nav>;
};
export default Navigation;
