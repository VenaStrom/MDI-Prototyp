import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, TrendingUp, AlertCircle, Train, Bus } from 'lucide-react';
import { JourneyDetail } from './JourneyDetail';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Location as L } from '../../locations';

type TravelTimeMode = 'now' | 'departure' | 'arrival';
type JourneyResultsHistoryState = {
  mdiSearchResults?: boolean;
  mdiSearchJourneyDetailId?: string;
};

interface Journey {
  id: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  reliability: number;
  segments: Array<{
    operator: string;
    type: 'train' | 'bus';
    from: string;
    to: string;
    departure: string;
    arrival: string;
    delay?: number;
  }>;
  delay?: number;
}

const mockJourneys: Journey[] = [
  {
    id: '1',
    departure: '08:15',
    arrival: '09:03',
    duration: '48 min',
    price: 145,
    reliability: 95,
    segments: [
      {
        operator: 'UL',
        type: 'train',
        from: L.UppsalaC,
        to: L.StockholmC,
        departure: '08:15',
        arrival: '09:03',
      }
    ]
  },
  {
    id: '2',
    departure: '08:45',
    arrival: '09:52',
    duration: '1 h 7 min',
    price: 165,
    reliability: 88,
    delay: 5,
    segments: [
      {
        operator: 'UL',
        type: 'train',
        from: L.UppsalaC,
        to: L.Märsta,
        departure: '08:45',
        arrival: '09:12',
        delay: 5
      },
      {
        operator: 'SL',
        type: 'train',
        from: L.Märsta,
        to: L.StockholmC,
        departure: '09:25',
        arrival: '09:52',
      }
    ]
  },
  {
    id: '3',
    departure: '09:15',
    arrival: '10:08',
    duration: '53 min',
    price: 145,
    reliability: 92,
    segments: [
      {
        operator: 'SJ',
        type: 'train',
        from: L.UppsalaC,
        to: L.StockholmC,
        departure: '09:15',
        arrival: '10:08',
      }
    ]
  }
];

interface JourneyResultsProps {
  from: string;
  to: string;
  travelTimeMode: TravelTimeMode;
  onTravelTimeModeChange: (mode: TravelTimeMode) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  onBack: () => void;
}

export function JourneyResults({
  from,
  to,
  travelTimeMode,
  onTravelTimeModeChange,
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  onBack,
}: JourneyResultsProps) {
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as JourneyResultsHistoryState | null;
      const selectedJourneyId = state?.mdiSearchJourneyDetailId;

      if (!selectedJourneyId) {
        setSelectedJourney(null);
        return;
      }

      const matchingJourney = mockJourneys.find((journey) => journey.id === selectedJourneyId) ?? null;
      setSelectedJourney(matchingJourney);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateToJourneyDetail = (journey: Journey) => {
    const currentState = (window.history.state as JourneyResultsHistoryState | null) ?? {};
    const nextState: JourneyResultsHistoryState = {
      ...currentState,
      mdiSearchResults: true,
      mdiSearchJourneyDetailId: journey.id,
    };

    window.history.pushState(nextState, '', window.location.href);
    setSelectedJourney(journey);
  };

  const navigateBackFromJourneyDetail = () => {
    const state = window.history.state as JourneyResultsHistoryState | null;

    if (state?.mdiSearchJourneyDetailId) {
      window.history.back();
      return;
    }

    setSelectedJourney(null);
  };

  if (selectedJourney) {
    return <JourneyDetail journey={selectedJourney} onBack={navigateBackFromJourneyDetail} />;
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold">{from} → {to}</h2>
        </div>

        {/* Time & date */}
        <div className="mt-2 space-y-2">
          <ToggleGroup
            type="single"
            value={travelTimeMode}
            onValueChange={(value) => {
              if (value) {
                onTravelTimeModeChange(value as TravelTimeMode);
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

          {travelTimeMode !== 'now' && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => onDateChange(event.target.value)}
                  className="text-sm text-gray-600 bg-transparent border border-gray-300 rounded pl-9 pr-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Resedatum"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(event) => onTimeChange(event.target.value)}
                  className="text-sm text-gray-600 bg-transparent border border-gray-300 rounded pl-9 pr-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Restid"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {mockJourneys.map((journey) => (
          <div
            key={journey.id}
            onClick={() => navigateToJourneyDetail(journey)}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* Delay Alert */}
            {journey.delay && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-amber-50 border border-amber-200 rounded">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-900">
                  Försenad {journey.delay} min - anslutningar säkrade
                </span>
              </div>
            )}

            {/* Time and Duration */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center justify-between gap-4 w-full px-10">
                <div>
                  <div className="text-xl font-semibold">{journey.departure}</div>
                  <div className="text-xs text-gray-500">{journey.segments[0].from}</div>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="w-4 h-4 text-gray-400 mb-1" />
                  <div className="text-xs text-gray-600">{journey.duration}</div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{journey.arrival}</div>
                  <div className="text-xs text-gray-500">{journey.segments[journey.segments.length - 1].to}</div>
                </div>
              </div>
            </div>

            {/* Operators */}
            <div className="flex items-center gap-2 mb-3">
              {journey.segments.map((segment, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  {segment.type === 'train' ? (
                    <Train className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Bus className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                    {segment.operator}
                  </span>
                  {idx < journey.segments.length - 1 && (
                    <span className="text-xs text-gray-400 mx-1">→</span>
                  )}
                </div>
              ))}
              {journey.segments.length > 1 && (
                <span className="text-xs text-gray-500">
                  ({journey.segments.length - 1} byte)
                </span>
              )}
            </div>

            {/* Price and Reliability */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  {journey.reliability}% pålitlig
                </span>
              </div>
              <div className="text-xl font-semibold text-blue-500">
                {journey.price} kr
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          <strong>Flexibla biljetter:</strong> Alla biljetter gäller 2 timmar från första avgång. Du kan åka med vilken avgång som helst inom tidsperioden.
        </p>
      </div>
    </div>
  );
}