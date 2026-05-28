import { MapPin, BatteryCharging, Minus, Plus } from "lucide-react";

const BANGALORE_AREAS = [
  "Indiranagar","Koramangala","Whitefield","HSR Layout","Jayanagar","Marathahalli",
  "Electronic City","MG Road","Brigade Road","Hebbal","Yelahanka","BTM Layout",
  "JP Nagar","Banashankari","Rajajinagar","Malleshwaram","Basavanagudi","Bellandur",
  "Sarjapur Road","Domlur","Frazer Town","Cunningham Road","Ulsoor","Vijayanagar",
  "RT Nagar","Kalyan Nagar","CV Raman Nagar","Bommanahalli","Kengeri","KR Puram",
];

interface Props {
  location: string;
  onLocationChange: (v: string) => void;
  battery: number;
  onBatteryChange: (v: number) => void;
}

export const InputCard = ({ location, onLocationChange, battery, onBatteryChange }: Props) => {
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  return (
    <section className="bg-card rounded-3xl border border-border shadow-card p-5 sm:p-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Location */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-primary" /> Your location
          </label>
          <div className="relative">
            <input
              list="bangalore-areas"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Type any area in Bangalore"
              className="w-full h-12 px-4 rounded-2xl bg-secondary/60 border border-border text-sm font-medium outline-none focus:ring-2 focus:ring-primary/40 focus:bg-card transition-smooth"
            />
            <datalist id="bangalore-areas">
              {BANGALORE_AREAS.map((a) => (
                <option key={a} value={`${a}, Bangalore`} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Battery */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
            <BatteryCharging className="w-3.5 h-3.5 text-primary" /> Battery level
          </label>
          <div className="flex items-center gap-2 h-12 px-2 rounded-2xl bg-secondary/60 border border-border">
            <button
              onClick={() => onBatteryChange(clamp(battery - 5))}
              className="w-9 h-9 rounded-xl bg-card hover:bg-accent transition-smooth flex items-center justify-center border border-border"
              aria-label="Decrease"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 flex items-center justify-center gap-1">
              <input
                inputMode="numeric"
                value={battery}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  onBatteryChange(v === "" ? 0 : clamp(parseInt(v, 10)));
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") onBatteryChange(clamp(battery + 1));
                  if (e.key === "ArrowDown") onBatteryChange(clamp(battery - 1));
                }}
                className="w-14 text-center bg-transparent text-2xl font-bold outline-none"
              />
              <span className="text-lg font-bold text-muted-foreground">%</span>
            </div>
            <button
              onClick={() => onBatteryChange(clamp(battery + 5))}
              className="w-9 h-9 rounded-xl bg-card hover:bg-accent transition-smooth flex items-center justify-center border border-border"
              aria-label="Increase"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
