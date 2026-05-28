import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import logo from "@/assets/dyanocharge-logo.png";

export const Header = () => {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-card shadow-soft border border-border overflow-hidden flex items-center justify-center">
            <img src={logo} alt="DyanoCharge logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight leading-none">
              DYANO<span className="text-primary">CHARGE</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
              Smart EV Charging Recommendation System
            </p>
          </div>
        </div>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="w-10 h-10 rounded-full bg-secondary hover:bg-accent transition-smooth flex items-center justify-center border border-border"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
