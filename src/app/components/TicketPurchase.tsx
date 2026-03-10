import { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, Check } from 'lucide-react';
import { logEvent } from '../telemetry';
import type { AppTicket } from '../tickets';

interface Journey {
  id: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  segments: Array<{
    operator: string;
    from: string;
    to: string;
  }>;
}

interface TicketPurchaseProps {
  journey: Journey;
  onBack: () => void;
  onShowTickets: () => void;
  onTicketPurchased: (ticket: AppTicket) => void;
}

const parseTimeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const formatMinutesToTime = (totalMinutes: number) => {
  const wrappedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(wrappedMinutes / 60);
  const minutes = wrappedMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const getCurrentLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const buildTicketFromJourney = (journey: Journey): AppTicket => {
  const validFrom = journey.departure;
  const validFromMinutes = parseTimeToMinutes(validFrom);
  const validUntil = validFromMinutes === null
    ? journey.arrival
    : formatMinutesToTime(validFromMinutes + 120);
  const operators = [...new Set(journey.segments.map((segment) => segment.operator))];

  return {
    id: `ticket-${Date.now()}-${journey.id}`,
    from: journey.segments[0].from,
    to: journey.segments[journey.segments.length - 1].to,
    date: getCurrentLocalDate(),
    validFrom,
    validUntil,
    price: journey.price,
    operators,
    status: 'active',
  };
};

export function TicketPurchase({ journey, onBack, onShowTickets, onTicketPurchased }: TicketPurchaseProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    void logEvent({
      eventType: 'view_open',
      view: 'ticket_purchase',
      details: {
        journeyId: journey.id,
        price: journey.price,
      },
    });
  }, [journey.id, journey.price]);

  useEffect(() => {
    if (!isPurchased) {
      return;
    }

    const redirectDelayMs = 1000;
    const timeoutId = window.setTimeout(() => {
      void logEvent({
        eventType: 'custom',
        view: 'ticket_purchase',
        elementId: 'auto_redirect_to_tickets_after_purchase',
        details: {
          targetView: 'tickets',
          delayMs: redirectDelayMs,
          journeyId: journey.id,
        },
      });
      onShowTickets();
    }, redirectDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isPurchased, journey.id, onShowTickets]);

  const handlePurchase = () => {
    const purchaseStartedAt = performance.now();

    void logEvent({
      eventType: 'button_click',
      view: 'ticket_purchase',
      elementId: 'confirm_payment',
      details: {
        journeyId: journey.id,
        price: journey.price,
      },
    });

    setIsPurchasing(true);
    // Simulate payment processing
    setTimeout(() => {
      const purchasedTicket = buildTicketFromJourney(journey);
      onTicketPurchased(purchasedTicket);

      setIsPurchasing(false);
      setIsPurchased(true);

      void logEvent({
        eventType: 'purchase_success',
        view: 'ticket_purchase',
        success: true,
        durationMs: Math.round(performance.now() - purchaseStartedAt),
        details: {
          journeyId: journey.id,
          ticketId: purchasedTicket.id,
          price: journey.price,
        },
      });

      void logEvent({
        eventType: 'custom',
        view: 'ticket_purchase',
        elementId: 'ticket_added_to_my_tickets',
        success: true,
        details: {
          ticketId: purchasedTicket.id,
          from: purchasedTicket.from,
          to: purchasedTicket.to,
          validFrom: purchasedTicket.validFrom,
          validUntil: purchasedTicket.validUntil,
        },
      });
    }, 1500);
  };

  if (isPurchased) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Köpet genomfört!</h2>
        <p className="text-gray-600 text-center mb-6">
          Din biljett finns nu under "Mina biljetter"
        </p>
        <p className="text-sm text-gray-500">Öppnar Mina biljetter…</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => {
            void logEvent({
              eventType: 'button_click',
              view: 'ticket_purchase',
              elementId: 'back_to_journey_detail',
              details: {
                journeyId: journey.id,
              },
            });
            onBack();
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isPurchasing}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold">Slutför köp</h2>
      </div>

      {/* Journey Summary */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="font-semibold mb-3">Sammanfattning</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Resa</span>
            <span className="font-medium">
              {journey.segments[0].from} → {journey.segments[journey.segments.length - 1].to}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avgång</span>
            <span className="font-medium">{journey.departure}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ankomst</span>
            <span className="font-medium">{journey.arrival}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Operatörer</span>
            <span className="font-medium">
              {journey.segments.map(s => s.operator).join(', ')}
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-200">
            <span className="font-semibold">Totalt</span>
            <span className="text-xl font-semibold text-blue-500">{journey.price} kr</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="font-semibold mb-3">Betalningsmetod</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border-2 border-blue-400 rounded-lg bg-blue-50">
            <input
              type="radio"
              id="card"
              name="payment"
              defaultChecked
              className="w-4 h-4"
            />
            <label htmlFor="card" className="flex items-center gap-2 flex-1 cursor-pointer">
              <CreditCard className="w-5 h-5 text-gray-700" />
              <span className="font-medium">Kort (Visa, Mastercard)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">Villkor</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>✓ Biljetten gäller i 2 timmar från {journey.departure}</li>
          <li>✓ Ej bunden till specifik avgång</li>
          <li>✓ Vid försening: automatisk ombokning eller ersättning</li>
          <li>✓ Återbetalningsbar fram till 24h före resa</li>
        </ul>
      </div>

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={isPurchasing}
        className="w-full bg-blue-400 text-white py-4 rounded-lg font-semibold hover:bg-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
      >
        {isPurchasing ? 'Behandlar betalning...' : `Betala ${journey.price} kr`}
      </button>

      <p className="text-xs text-center text-gray-500 mt-3">
        Säker betalning. Dina kortuppgifter lagras inte.
      </p>
    </div>
  );
}