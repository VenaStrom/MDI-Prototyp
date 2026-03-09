import { useState } from 'react';
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import { JourneyResults } from './JourneyResults';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

type TravelTimeMode = 'now' | 'departure' | 'arrival';

const getCurrentLocalTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

export function SearchView() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [travelTimeMode, setTravelTimeMode] = useState<TravelTimeMode>('now');
  const [date, setDate] = useState('');
  const [time, setTime] = useState(getCurrentLocalTime);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (from && to) {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = getCurrentLocalTime();

      if (travelTimeMode === 'now') {
        setDate(currentDate);
        setTime(currentTime);
      } else {
        if (!date) {
          setDate(currentDate);
        }

        if (!time) {
          setTime(currentTime);
        }
      }

      setShowResults(true);
    }
  };

  if (showResults) {
    return <JourneyResults from={from} to={to} onBack={() => setShowResults(false)} />;
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Planera din resa</h2>

        <form onSubmit={handleSearch} className="space-y-4">
          {/* From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Från
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Uppsala C"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                list="stations-from"
              />
              <datalist id="stations-from">
                <option value="Uppsala C" />
                <option value="Stockholm C" />
                <option value="Västerås C" />
                <option value="Arlanda C" />
                <option value="Märsta" />
              </datalist>
            </div>
          </div>

          {/* To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Till
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Stockholm C"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                list="stations-to"
              />
              <datalist id="stations-to">
                <option value="Uppsala C" />
                <option value="Stockholm C" />
                <option value="Västerås C" />
                <option value="Arlanda C" />
                <option value="Märsta" />
              </datalist>
            </div>
          </div>

          {/* Travel Time Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              När vill du resa?
            </label>
            <ToggleGroup
              type="single"
              value={travelTimeMode}
              onValueChange={(value) => {
                if (value) {
                  setTravelTimeMode(value as TravelTimeMode);
                }
              }}
              variant="outline"
              className="w-full"
            >
              <ToggleGroupItem value="now" className="flex-1">
                Res nu
              </ToggleGroupItem>
              <ToggleGroupItem value="departure" className="flex-1">
                Avresedatum
              </ToggleGroupItem>
              <ToggleGroupItem value="arrival" className="flex-1">
                Ankomstdatum
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {travelTimeMode !== 'now' && (
            <>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {travelTimeMode === 'departure' ? 'Avresedatum' : 'Ankomstdatum'}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tid
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className="w-full bg-blue-400 text-white py-3 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            Sök resor
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Quick Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Fördelar med [[Appnamn]]</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>✓ En biljett för hela resan</li>
          <li>✓ Flexibla biljetter - ej bundna till avgång</li>
          <li>✓ Realtidsinfo om förseningar</li>
          <li>✓ Tydlig ersättningshantering</li>
        </ul>
      </div>
    </div>
  );
}