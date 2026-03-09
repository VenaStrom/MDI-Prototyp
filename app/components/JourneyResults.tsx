import { useState } from 'react';
import { ArrowLeft, Clock, TrendingUp, AlertCircle, Train, Bus } from 'lucide-react';
import { JourneyDetail } from './JourneyDetail';

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
        from: 'Uppsala C',
        to: 'Stockholm C',
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
        from: 'Uppsala C',
        to: 'Märsta',
        departure: '08:45',
        arrival: '09:12',
        delay: 5
      },
      {
        operator: 'SL',
        type: 'train',
        from: 'Märsta',
        to: 'Stockholm C',
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
        from: 'Uppsala C',
        to: 'Stockholm C',
        departure: '09:15',
        arrival: '10:08',
      }
    ]
  }
];

interface JourneyResultsProps {
  from: string;
  to: string;
  onBack: () => void;
}

export function JourneyResults({ from, to, onBack }: JourneyResultsProps) {
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);

  if (selectedJourney) {
    return <JourneyDetail journey={selectedJourney} onBack={() => setSelectedJourney(null)} />;
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-semibold">{from} → {to}</h2>
          <p className="text-sm text-gray-600">Idag</p>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {mockJourneys.map((journey) => (
          <div
            key={journey.id}
            onClick={() => setSelectedJourney(journey)}
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
              <div className="flex items-center gap-4">
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