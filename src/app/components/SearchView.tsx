import { useEffect, useState } from 'react';
import { ArrowRight, Calendar, Clock, History, MapPin, Star } from 'lucide-react';
import { JourneyResults } from './JourneyResults';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Location as L } from '../../locations';
import { logEvent } from '../telemetry';
import type { AppTicket } from '../tickets';

type TravelTimeMode = 'now' | 'departure' | 'arrival';
type SearchHistoryState = {
  mdiAppView?: 'search' | 'tickets' | 'help';
  mdiSearchResults?: boolean;
  mdiSearchFrom?: string;
  mdiSearchTo?: string;
  mdiSearchDate?: string;
  mdiSearchTime?: string;
  mdiSearchTravelTimeMode?: TravelTimeMode;
  [key: string]: unknown;
};
type RouteSelection = { from: string; to: string };

const stationOptions = [...new Set([
  L.UppsalaC,
  L.StockholmC,
  L.VästeråsC,
  L.ArlandaC,
  L.Märsta,
  ...Object.values(L),
])];

const normalizeStationName = (value: string) => (
  value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\s+c$/, '')
);

const stationOptionByNormalized = new Map(
  stationOptions.map((station) => [normalizeStationName(station), station])
);

const resolveStationOption = (value: string) => (
  stationOptionByNormalized.get(normalizeStationName(value))
);

const getCurrentLocalTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

const getCurrentLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

interface SearchViewProps {
  onShowTickets: () => void;
  onTicketPurchased: (ticket: AppTicket) => void;
}

export function SearchView({ onShowTickets, onTicketPurchased }: SearchViewProps) {
  const initialHistoryState = (window.history.state as SearchHistoryState | null) ?? {};
  const shouldUseInitialSearchState = initialHistoryState.mdiAppView === 'search';
  const [from, setFrom] = useState(shouldUseInitialSearchState ? (initialHistoryState.mdiSearchFrom ?? '') : '');
  const [to, setTo] = useState(shouldUseInitialSearchState ? (initialHistoryState.mdiSearchTo ?? '') : '');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [travelTimeMode, setTravelTimeMode] = useState<TravelTimeMode>(
    shouldUseInitialSearchState ? (initialHistoryState.mdiSearchTravelTimeMode ?? 'now') : 'now',
  );
  const [date, setDate] = useState(shouldUseInitialSearchState ? (initialHistoryState.mdiSearchDate ?? '') : '');
  const [time, setTime] = useState(shouldUseInitialSearchState ? (initialHistoryState.mdiSearchTime ?? getCurrentLocalTime()) : getCurrentLocalTime());
  const [showResults, setShowResults] = useState(
    shouldUseInitialSearchState && Boolean(initialHistoryState.mdiSearchResults),
  );

  useEffect(() => {
    void logEvent({
      eventType: 'view_open',
      view: 'search',
    });
  }, []);

  const handleTravelTimeModeChange = (nextMode: TravelTimeMode) => {
    void logEvent({
      eventType: 'button_click',
      view: 'search',
      elementId: 'travel_time_mode',
      details: { nextMode },
    });

    setTravelTimeMode(nextMode);

    const currentDate = getCurrentLocalDate();
    const currentTime = getCurrentLocalTime();

    if (nextMode === 'now') {
      setDate(currentDate);
      setTime(currentTime);
      return;
    }

    if (!date) {
      setDate(currentDate);
    }

    if (!time) {
      setTime(currentTime);
    }
  };

  const [favorites, setFavorites] = useState<RouteSelection[]>([
    { from: L.UppsalaC, to: L.StockholmC },
    { from: L.UppsalaC, to: L.ArlandaC },
  ]);

  const [recentSearches, setRecentSearches] = useState<RouteSelection[]>([
    { from: L.Märsta, to: L.StockholmC },
    { from: L.VästeråsC, to: L.UppsalaC },
    { from: L.UppsalaC, to: L.Märsta },
  ]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as SearchHistoryState | null;

      if (state?.mdiAppView !== 'search') {
        setShowResults(false);
        return;
      }

      if (typeof state?.mdiSearchFrom === 'string') {
        setFrom(state.mdiSearchFrom);
      }

      if (typeof state?.mdiSearchTo === 'string') {
        setTo(state.mdiSearchTo);
      }

      if (typeof state?.mdiSearchDate === 'string') {
        setDate(state.mdiSearchDate);
      }

      if (typeof state?.mdiSearchTime === 'string') {
        setTime(state.mdiSearchTime);
      }

      if (state?.mdiSearchTravelTimeMode) {
        setTravelTimeMode(state.mdiSearchTravelTimeMode);
      }

      setShowResults(Boolean(state?.mdiSearchResults));
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateToResults = (searchFrom: string, searchTo: string) => {
    const currentState = (window.history.state as SearchHistoryState | null) ?? {};
    const nextState: SearchHistoryState = {
      ...currentState,
      mdiSearchResults: true,
      mdiSearchFrom: searchFrom,
      mdiSearchTo: searchTo,
      mdiSearchDate: date,
      mdiSearchTime: time,
      mdiSearchTravelTimeMode: travelTimeMode,
    };

    window.history.pushState(nextState, '', window.location.href);
    setShowResults(true);
  };

  const navigateBackToSearch = () => {
    const state = window.history.state as SearchHistoryState | null;

    if (state?.mdiSearchResults) {
      window.history.back();
      return;
    }

    setShowResults(false);
  };

  const performSearch = (searchFrom: string, searchTo: string) => {
    const startedAt = performance.now();
    const trimmedFrom = searchFrom.trim();
    const trimmedTo = searchTo.trim();

    if (!trimmedFrom || !trimmedTo) {
      setSearchError('Ange både Från och Till innan du söker.');
      void logEvent({
        eventType: 'search_submit',
        view: 'search',
        elementId: 'search_submit',
        success: false,
        details: {
          reason: 'missing_from_or_to',
          from: trimmedFrom,
          to: trimmedTo,
        },
      });
      return;
    }

    const resolvedFrom = resolveStationOption(trimmedFrom);
    const resolvedTo = resolveStationOption(trimmedTo);

    if (!resolvedFrom || !resolvedTo) {
      setSearchError('Välj stationer från listan (skiftläge ignoreras, och " C" är valfritt).');
      void logEvent({
        eventType: 'search_submit',
        view: 'search',
        elementId: 'search_submit',
        success: false,
        details: {
          reason: 'invalid_station',
          from: trimmedFrom,
          to: trimmedTo,
        },
      });
      return;
    }

    setSearchError(null);

    const currentDate = getCurrentLocalDate();
    const currentTime = getCurrentLocalTime();

    setFrom(resolvedFrom);
    setTo(resolvedTo);
    setRecentSearches((previousSearches) => {
      const withoutCurrent = previousSearches.filter(
        (search) => !(search.from === resolvedFrom && search.to === resolvedTo)
      );

      return [{ from: resolvedFrom, to: resolvedTo }, ...withoutCurrent].slice(0, 5);
    });

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

    void logEvent({
      eventType: 'search_submit',
      view: 'search',
      elementId: 'search_submit',
      success: true,
      durationMs: Math.round(performance.now() - startedAt),
      details: {
        from: resolvedFrom,
        to: resolvedTo,
        travelTimeMode,
        date: date || currentDate,
        time: time || currentTime,
      },
    });

    navigateToResults(resolvedFrom, resolvedTo);
  };

  const handleSearch = (e: React.SubmitEvent) => {
    e.preventDefault();
    performSearch(from, to);
  };

  const addRouteToFavorites = (routeFrom: string, routeTo: string) => {
    const resolvedFrom = resolveStationOption(routeFrom);
    const resolvedTo = resolveStationOption(routeTo);

    if (!resolvedFrom || !resolvedTo) {
      return false;
    }

    let wasAdded = false;

    setFavorites((previousFavorites) => {
      const alreadyExists = previousFavorites.some(
        (favorite) => favorite.from === resolvedFrom && favorite.to === resolvedTo,
      );

      if (alreadyExists) {
        return previousFavorites;
      }

      wasAdded = true;
      return [{ from: resolvedFrom, to: resolvedTo }, ...previousFavorites].slice(0, 6);
    });

    return wasAdded;
  };
  if (showResults) {
    return (
      <JourneyResults
        from={from}
        to={to}
        travelTimeMode={travelTimeMode}
        onTravelTimeModeChange={handleTravelTimeModeChange}
        selectedDate={date || getCurrentLocalDate()}
        onDateChange={setDate}
        selectedTime={time}
        onTimeChange={setTime}
        onBack={navigateBackToSearch}
        onShowTickets={onShowTickets}
        onTicketPurchased={onTicketPurchased}
        onAddFavoriteRoute={addRouteToFavorites}
        isCurrentRouteFavorite={favorites.some((favorite) => favorite.from === from && favorite.to === to)}
      />
    );
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
                onChange={(e) => {
                  setFrom(e.target.value);

                  if (searchError) {
                    setSearchError(null);
                  }
                }}
                placeholder={L.UppsalaC}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent ${searchError ? 'border-red-400' : 'border-gray-300'}`}
                list="stations-from"
              />
              <datalist id="stations-from">
                {stationOptions.map((station) => (
                  <option key={station} value={station} />
                ))}
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
                onChange={(e) => {
                  setTo(e.target.value);

                  if (searchError) {
                    setSearchError(null);
                  }
                }}
                placeholder={L.StockholmC}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent ${searchError ? 'border-red-400' : 'border-gray-300'}`}
                list="stations-to"
              />
              <datalist id="stations-to">
                {stationOptions.map((station) => (
                  <option key={station} value={station} />
                ))}
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
                  handleTravelTimeModeChange(value as TravelTimeMode);
                }
              }}
              variant="outline"
              className="w-full *:text-xs"
            >
              <ToggleGroupItem value="now" className="flex-1 border-l border-border/60">
                Res nu
              </ToggleGroupItem>
              <ToggleGroupItem value="departure" className="flex-1 border-l border-border/60">
                Avresedatum
              </ToggleGroupItem>
              <ToggleGroupItem value="arrival" className="flex-1 border-l border-border/60">
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
            className="mb-10 w-full bg-blue-400 text-white py-3 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            Sök resor
            <ArrowRight className="w-5 h-5" />
          </button>

          {searchError && (
            <p className="-mt-8 mb-6 text-sm text-red-600" role="alert">
              {searchError}
            </p>
          )}


          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-500" />
              Favoriter
            </h3>
            <div className="space-y-2">
              {favorites.map((favorite) => (
                <button
                  key={`${favorite.from}-${favorite.to}`}
                  type="button"
                  onClick={() => {
                    void logEvent({
                      eventType: 'button_click',
                      view: 'search',
                      elementId: 'favorite_route',
                      details: {
                        from: favorite.from,
                        to: favorite.to,
                      },
                    });
                    performSearch(favorite.from, favorite.to);
                  }}
                  className="w-full text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Star className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-800">{favorite.from} → {favorite.to}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              Senaste sökningar
            </h3>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={`${search.from}-${search.to}-${index}`}
                  type="button"
                  onClick={() => {
                    void logEvent({
                      eventType: 'button_click',
                      view: 'search',
                      elementId: 'recent_search',
                      details: {
                        from: search.from,
                        to: search.to,
                      },
                    });
                    performSearch(search.from, search.to);
                  }}
                  className="w-full text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <History className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{search.from} → {search.to}</span>
                </button>
              ))}
            </div>
          </div>
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