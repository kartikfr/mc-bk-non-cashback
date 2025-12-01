import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Share2, ArrowUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blogs } from "@/components/BlogSection";
import { toast } from "sonner";

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const blog = blogs.find(b => b.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowStickyBar(scrollY > 300);
      setShowScrollTop(scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied to clipboard!");
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">Blog post not found</h1>
          <Button onClick={() => navigate('/')} size="lg">Go back home</Button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const lines = blog.content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: JSX.Element[] = [];
    let listType: 'bullet' | 'number' | null = null;

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'bullet') {
          elements.push(
            <ul key={`list-${elements.length}`} className="space-y-3 my-8 pl-1">
              {listItems}
            </ul>
          );
        } else if (listType === 'number') {
          elements.push(
            <ol key={`list-${elements.length}`} className="space-y-3 my-8 pl-1 counter-reset">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Main heading
      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`h1-${index}`} className="text-2xl sm:text-3xl md:text-4xl font-bold mt-10 mb-6 text-foreground leading-tight">
            {trimmed.slice(2)}
          </h1>
        );
      }
      // Section heading
      else if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <div key={`h2-container-${index}`} className="mt-12 mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {trimmed.slice(3)}
            </h2>
          </div>
        );
      }
      // Sub-heading
      else if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg sm:text-xl md:text-2xl font-semibold mt-10 mb-5 text-foreground leading-tight">
            {trimmed.slice(4)}
          </h3>
        );
      }
      // Bullet list
      else if (trimmed.startsWith('- ')) {
        if (listType !== 'bullet') {
          flushList();
          listType = 'bullet';
        }
        listItems.push(
          <li key={`li-${index}`} className="flex gap-3 items-start group">
            <div className="flex-shrink-0 mt-1">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[15px] sm:text-base leading-[1.8] text-foreground/90">
              {trimmed.slice(2)}
            </span>
          </li>
        );
      }
      // Numbered list
      else if (/^\d+\./.test(trimmed)) {
        if (listType !== 'number') {
          flushList();
          listType = 'number';
        }
        const content = trimmed.replace(/^\d+\.\s*/, '');
        listItems.push(
          <li key={`num-${index}`} className="flex gap-3 items-start group">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-primary">{listItems.length + 1}</span>
            </div>
            <span className="text-[15px] sm:text-base leading-[1.8] text-foreground/90">
              {content}
            </span>
          </li>
        );
      }
      // Bold text handling
      else if (trimmed.includes('**')) {
        flushList();
        const parts = trimmed.split('**');
        elements.push(
          <p key={`p-${index}`} className="mb-5 text-[15px] sm:text-base leading-[1.8] text-foreground/90">
            {parts.map((part, i) => 
              i % 2 === 0 ? part : <strong key={i} className="font-bold text-foreground">{part}</strong>
            )}
          </p>
        );
      }
      // Regular paragraph
      else if (trimmed) {
        flushList();
        elements.push(
          <p key={`p-${index}`} className="mb-5 text-[15px] sm:text-base leading-[1.8] text-foreground/90">
            {trimmed}
          </p>
        );
      }
      // Empty line for spacing
      else if (!trimmed && listType === null) {
        elements.push(<div key={`space-${index}`} className="h-2" />);
      }
    });

    flushList(); // Flush any remaining list
    return elements;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-Optimized Hero Section */}
      <div className="relative h-[50vh] sm:h-[55vh] md:h-[400px] overflow-hidden">
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        
        {/* Floating Back Button - Glassmorphic */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-white hover:text-primary transition-all bg-white/10 backdrop-blur-xl px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border border-white/20 hover:bg-white/20 shadow-lg touch-target group"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm sm:text-base font-semibold">Back</span>
        </button>

        {/* Title and Meta - Mobile Optimized */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 shadow-lg">
              {blog.category}
            </div>
            
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              {blog.title}
            </h1>
            
            {/* Meta Info - Compact for Mobile */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{blog.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{blog.readTime}</span>
              </div>
              <div className="font-medium">By {blog.author}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container with Mobile Padding */}
      <article className="max-w-3xl mx-auto px-5 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
        {/* Share Button - Pill Style */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 bg-card hover:bg-muted text-foreground px-4 py-2.5 rounded-full text-sm font-medium border border-border hover:border-primary/30 transition-all shadow-sm hover:shadow-md touch-target"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Blog Content with Premium Typography */}
        <div className="blog-content">
          {renderContent()}
        </div>

        {/* Tags Section - Modern Pills */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Topics</p>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center bg-muted/60 hover:bg-muted text-foreground px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Card - Premium Design */}
        <div className="mt-10 p-5 sm:p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl border border-border/50 shadow-sm">
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Written by</p>
          <p className="text-lg sm:text-xl font-bold text-foreground mb-1">{blog.author}</p>
          <p className="text-sm text-muted-foreground">Financial Content Specialist</p>
        </div>

        {/* Back to Home CTA - Full Width Premium Button */}
        <div className="mt-10 sm:mt-12">
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto sm:min-w-[240px] shadow-lg py-6 sm:py-7 text-base sm:text-lg font-semibold rounded-2xl hover:shadow-xl transition-all group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </div>
      </article>

      {/* Sticky Quick Action Bar - Bottom Glassmorphic */}
      {showStickyBar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 bg-white/80 dark:bg-card/80 backdrop-blur-xl px-4 py-3 rounded-full border border-border/50 shadow-2xl">
            {/* Back Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors touch-target"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors touch-target"
              aria-label="Share article"
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </button>

            {/* Divider */}
            {showScrollTop && <div className="h-6 w-px bg-border" />}

            {/* Scroll to Top - Only shows after scrolling further */}
            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg touch-target"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPost;
