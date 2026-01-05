import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Calculator from "./pages/Calculator";
import Focus from "./pages/Focus";
import Export from "./pages/Export";
import Api from "./pages/Api";
import IndicatorDetail from "./pages/IndicatorDetail";
import Alerts from "./pages/Alerts";
import Markets from "./pages/Markets";
import Data from "./pages/Data";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/focus" component={Focus} />
      <Route path="/export" component={Export} />
      <Route path="/api" component={Api} />
      <Route path="/indicator/:code" component={IndicatorDetail} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/markets" component={Markets} />
      <Route path="/data" component={Data} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
