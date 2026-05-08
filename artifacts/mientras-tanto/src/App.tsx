import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";

import Inicio from "@/pages/inicio";
import ComoMeSiento from "@/pages/como-me-siento";
import Diario from "@/pages/diario";
import Pausa from "@/pages/pausa";
import HoyBasta from "@/pages/hoy-basta";
import ModoRespiracion from "@/pages/modo-respiracion";

const queryClient = new QueryClient();

// Pages that show the bottom nav
const NAV_ROUTES = ["/", "/como-me-siento", "/diario", "/pausa", "/hoy-basta"];

function Router() {
  const [location] = useLocation();
  const showNav = NAV_ROUTES.includes(location);

  return (
    <>
      <AnimatePresence mode="wait">
        <Switch location={location} key={location}>
          <Route path="/" component={Inicio} />
          <Route path="/como-me-siento" component={ComoMeSiento} />
          <Route path="/diario" component={Diario} />
          <Route path="/pausa" component={Pausa} />
          <Route path="/hoy-basta" component={HoyBasta} />
          <Route path="/respiracion" component={ModoRespiracion} />
          <Route>
            <div className="flex h-screen items-center justify-center text-foreground-soft font-serif text-xl">
              Nada aquí. Regresa.
            </div>
          </Route>
        </Switch>
      </AnimatePresence>

      {showNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            {/* Full-width layout — content width is managed per-page via PageTransition */}
            <div className="min-h-[100dvh] w-full bg-background transition-colors duration-700">
              <Router />
            </div>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
