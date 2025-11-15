import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import CardListing from "./pages/CardListing";
import CardGenius from "./pages/CardGenius";
import BeatMyCard from "./pages/BeatMyCard";
import CardDetails from "./pages/CardDetails";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import RedirectInterstitial from "./pages/RedirectInterstitial";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ScrollToTop />
      <TooltipProvider>
        <ComparisonProvider maxCompare={3}>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cards" element={<CardListing />} />
            <Route path="/cards/:alias" element={<CardDetails />} />
            <Route path="/card-genius" element={<CardGenius />} />
            <Route path="/beat-my-card" element={<BeatMyCard />} />
            <Route path="/redirect" element={<RedirectInterstitial />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ComparisonProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
