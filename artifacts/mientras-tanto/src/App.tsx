import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";

// Pages
import Inicio from "@/pages/inicio";
import ComoMeSiento from "@/pages/como-me-siento";
import Diario from "@/pages/diario";
import Pausa from "@/pages/pausa";
import HoyBasta from "@/pages/hoy-basta";

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/" component={Inicio} />
        <Route path="/como-me-siento" component={ComoMeSiento} />
        <Route path="/diario" component={Diario} />
        <Route path="/pausa" component={Pausa} />
        <Route path="/hoy-basta" component={HoyBasta} />
        <Route>
          <div className="flex h-screen items-center justify-center text-foreground-soft font-serif text-xl">
            No hay nada aqui. Regresa.
          </div>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <div className="min-h-[100dvh] w-full flex justify-center bg-background selection:bg-foreground selection:text-background transition-colors duration-1000">
              <div className="w-full max-w-[430px] relative shadow-2xl shadow-black/5 dark:shadow-none bg-background border-x border-background-secondary/30">
                <Router />
                <BottomNav />
              </div>
            </div>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
