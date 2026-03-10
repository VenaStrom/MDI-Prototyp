import { useEffect, useMemo, useState } from 'react';
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

const parseTimeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  return hours * 60 + minutes;
};

const formatMinutesToTime = (totalMinutes: number) => {
  const wrappedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(wrappedMinutes / 60);
  const minutes = wrappedMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const formatDuration = (durationMinutes: number) => {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (!hours) {
    return `${minutes} min`;
  }

  if (!minutes) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
};

const estimateBaseDuration = (from: string, to: string) => {
  const fromName = from.toLowerCase();
  const toName = to.toLowerCase();
  const route = `${fromName} ${toName}`;

  if (fromName === toName) {
    return 18;
  }

  if (route.includes('uppsala') && route.includes('stockholm')) {
    return 48;
  }

  if (route.includes('arlanda')) {
    return 35;
  }

  if (route.includes('märsta')) {
    return 32;
  }

  if (route.includes('västerås')) {
    return 56;
  }

  if (route.includes('stockholm')) {
    return 52;
  }

  return 45;
};

const getTransferStation = (from: string, to: string) => {
  const fallbackStations = [L.Märsta, L.ArlandaC, L.StockholmC, L.UppsalaC, L.VästeråsC];
  return fallbackStations.find((station) => station !== from && station !== to) ?? L.Märsta;
};

const formatJourneyDate = (isoDate: string) => {
  if (!isoDate) {
    return '';
  }

  const [year, month, day] = isoDate.split('-').map(Number);

  if (!year || !month || !day) {
    return isoDate;
  }

  const localDate = new Date(year, month - 1, day);

  return localDate.toLocaleDateString('sv-SE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

const buildJourneys = (
  from: string,
  to: string,
  travelTimeMode: TravelTimeMode,
  selectedTime: string,
): Journey[] => {
  const baseDuration = estimateBaseDuration(from, to);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const requestedMinutes = parseTimeToMinutes(selectedTime);
  const referenceMinutes = travelTimeMode === 'now' ? nowMinutes : requestedMinutes;

  const departureOffsets = [5, 25, 45];
  const arrivalOffsets = [0, 18, 36];
  const durationVariants = [0, 14, 8];

  const directOperators = ['UL', 'SJ', 'MTR'];
  const firstLegOperators = ['UL', 'VL', 'SL'];
  const secondLegOperators = ['SL', 'SJ', 'Mälartåg'];

  return departureOffsets.map((offset, index) => {
    const isTransferJourney = index === 1;
    const durationMinutes = baseDuration + durationVariants[index];
    const layoverMinutes = isTransferJourney ? 8 : 0;

    const departureMinutes = travelTimeMode === 'arrival'
      ? referenceMinutes + arrivalOffsets[index] - durationMinutes - layoverMinutes
      : referenceMinutes + offset;
    const arrivalMinutes = departureMinutes + durationMinutes + layoverMinutes;

    const departure = formatMinutesToTime(departureMinutes);
    const arrival = formatMinutesToTime(arrivalMinutes);

    const transferStation = getTransferStation(from, to);

    const segments = isTransferJourney
      ? (() => {
        const firstLegMinutes = Math.max(16, Math.round(durationMinutes * 0.45));
        const firstArrivalMinutes = departureMinutes + firstLegMinutes;
        const secondDepartureMinutes = firstArrivalMinutes + layoverMinutes;
        const firstLegType: 'train' | 'bus' = index % 2 === 0 ? 'train' : 'bus';

        return [
          {
            operator: firstLegOperators[index % firstLegOperators.length],
            type: firstLegType,
            from,
            to: transferStation,
            departure,
            arrival: formatMinutesToTime(firstArrivalMinutes),
            delay: 4,
          },
          {
            operator: secondLegOperators[index % secondLegOperators.length],
            type: 'train' as const,
            from: transferStation,
            to,
            departure: formatMinutesToTime(secondDepartureMinutes),
            arrival,
          }
        ];
      })()
      : [
        {
          operator: directOperators[index % directOperators.length],
          type: 'train' as const,
          from,
          to,
          departure,
          arrival,
        }
      ];

    const transferPenalty = isTransferJourney ? 18 : 0;
    const rawPrice = 45 + durationMinutes * 1.75 + transferPenalty;
    const price = Math.round(rawPrice / 5) * 5;
    const reliability = isTransferJourney ? 86 : 92 - index * 2;

    return {
      id: String(index + 1),
      departure,
      arrival,
      duration: formatDuration(durationMinutes + layoverMinutes),
      price,
      reliability,
      segments,
      delay: isTransferJourney ? 4 : undefined,
    };
  });
};

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
  const journeyDateLabel = useMemo(
    () => formatJourneyDate(selectedDate),
    [selectedDate],
  );
  const journeys = useMemo(
    () => buildJourneys(from, to, travelTimeMode, selectedTime),
    [from, to, travelTimeMode, selectedTime],
  );

  useEffect(() => {
    if (!selectedJourney) {
      return;
    }

    const updatedJourney = journeys.find((journey) => journey.id === selectedJourney.id) ?? null;
    setSelectedJourney(updatedJourney);
  }, [journeys, selectedJourney]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as JourneyResultsHistoryState | null;
      const selectedJourneyId = state?.mdiSearchJourneyDetailId;

      if (!selectedJourneyId) {
        setSelectedJourney(null);
        return;
      }

      const matchingJourney = journeys.find((journey) => journey.id === selectedJourneyId) ?? null;
      setSelectedJourney(matchingJourney);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [journeys]);

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
        {journeys.map((journey) => (
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

            {travelTimeMode !== 'now' && (
              <div className="mb-3 text-xs text-gray-600">
                {travelTimeMode === 'departure' ? 'Avresedatum:' : 'Ankomstdatum:'} {journeyDateLabel}
              </div>
            )}

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