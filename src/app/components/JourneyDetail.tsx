import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Train, Bus, AlertCircle, TrendingUp, ShoppingCart } from 'lucide-react';
import { TicketPurchase } from './TicketPurchase';
import { logEvent } from '../telemetry';

interface JourneySegment {
  operator: string;
  type: 'train' | 'bus';
  from: string;
  to: string;
  departure: string;
  arrival: string;
  delay?: number;
}

interface Journey {
  id: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  reliability: number;
  segments: JourneySegment[];
  delay?: number;
}

interface JourneyDetailProps {
  journey: Journey;
  onBack: () => void;
}

export function JourneyDetail({ journey, onBack }: JourneyDetailProps) {
  const [showPurchase, setShowPurchase] = useState(false);

  useEffect(() => {
    void logEvent({
      eventType: 'view_open',
      view: 'journey_detail',
      details: {
        journeyId: journey.id,
        price: journey.price,
      },
    });
  }, [journey.id, journey.price]);

  if (showPurchase) {
    return <TicketPurchase journey={journey} onBack={() => setShowPurchase(false)} />;
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => {
            void logEvent({
              eventType: 'button_click',
              view: 'journey_detail',
              elementId: 'back_to_results',
              details: { journeyId: journey.id },
            });
            onBack();
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-semibold">Resdetaljer</h2>
          <p className="text-sm text-gray-600">{journey.duration}</p>
        </div>
      </div>

      {/* Delay Alert */}
      {journey.delay && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Försenad avgång</p>
              <p className="text-sm text-amber-800 mt-1">
                {journey.segments[0].operator} rapporterar {journey.delay} minuters försening.
                Dina anslutningar är automatiskt säkrade.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Journey Segments */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="font-semibold mb-4">Din resa</h3>

        <div className="space-y-4">
          {journey.segments.map((segment, index) => (
            <div key={index}>
              {/* Segment */}
              <div className="flex gap-3">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  {index < journey.segments.length - 1 && (
                    <div className="w-0.5 h-full bg-blue-200 my-1 flex-1 min-h-[40px]"></div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold">
                        {segment.departure}
                        {segment.delay && (
                          <span className="ml-2 text-sm text-amber-600">+{segment.delay} min</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{segment.from}</div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                      {segment.type === 'train' ? (
                        <Train className="w-4 h-4" />
                      ) : (
                        <Bus className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{segment.operator}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="font-semibold">{segment.arrival}</div>
                    <div className="text-sm text-gray-600">{segment.to}</div>
                  </div>
                </div>
              </div>

              {/* Transfer info */}
              {index < journey.segments.length - 1 && (
                <div className="ml-6 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Byte:</strong> Ca 13 min bytestid. Plattform visas i realtid.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Coverage */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="font-semibold mb-3">Biljettens giltighet</h3>
        <div className="space-y-2">
          {journey.segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{segment.from} → {segment.to}</span>
              </div>
              <span className="text-xs font-medium text-blue-500 px-2 py-1 bg-blue-50 rounded">
                {segment.operator}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          En biljett täcker hela resan. Giltig 2 timmar från {journey.departure}.
        </p>
      </div>

      {/* Reliability */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="font-medium">Pålitlighet</span>
          </div>
          <span className="text-xl font-semibold text-green-600">{journey.reliability}%</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Baserat på historisk data från senaste 30 dagarna. Vid försening som påverkar din resa får du automatisk information om alternativ.
        </p>
      </div>

      {/* Purchase Button */}
      <button
        onClick={() => {
          void logEvent({
            eventType: 'purchase_start',
            view: 'journey_detail',
            elementId: 'start_purchase',
            details: {
              journeyId: journey.id,
              price: journey.price,
            },
          });
          setShowPurchase(true);
        }}
        className="w-full bg-blue-400 text-white py-4 rounded-lg font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-lg"
      >
        <ShoppingCart className="w-5 h-5" />
        Köp biljett - {journey.price} kr
      </button>

      {/* Price Info */}
      <p className="text-xs text-center text-gray-500 mt-3">
        Samma pris som att köpa separata biljetter. Inga dolda avgifter.
      </p>
    </div>
  );
}