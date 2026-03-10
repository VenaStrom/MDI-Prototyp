import { useEffect, useRef, useState } from 'react';
import { QrCode, Calendar, Clock, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { logEvent } from '../telemetry';
import type { AppTicket } from '../tickets';

const QR_CYCLE_MS = 1400;
const QR_FLUFF_BLOBS = [
  'meta:wagon=07|zone=UL-STHLM|seat=free|fare=flex|control=standard|signature=F4A29C8ED31B6A0E92|padding=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'meta:wagon=11|zone=UL-STHLM|seat=free|fare=flex|control=night-shift|signature=8D77A90BE1C44F22AB|padding=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
  'meta:wagon=03|zone=UL-STHLM|seat=free|fare=flex|control=randomized|signature=2BC1D9EE7A18F50CF4|padding=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'
];

function buildTicketQrPayload(ticket: AppTicket, blob: string) {
  const url = new URL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  url.searchParams.set('ticketId', ticket.id);
  url.searchParams.set('from', ticket.from);
  url.searchParams.set('to', ticket.to);
  url.searchParams.set('validFrom', ticket.validFrom);
  url.searchParams.set('validUntil', ticket.validUntil);
  url.searchParams.set('bs', blob);
  return url.toString();
}

interface MyTicketsViewProps {
  tickets: AppTicket[];
}

export function MyTicketsView({ tickets }: MyTicketsViewProps) {
  const [qrFrame, setQrFrame] = useState(0);
  const ticketsScrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const previousActiveTicketIndexRef = useRef(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setQrFrame((previous) => previous + 1);
    }, QR_CYCLE_MS);

    return () => window.clearInterval(interval);
  }, []);

  const getCurrentTicketIndex = () => {
    const scroller = ticketsScrollerRef.current;

    if (!scroller || tickets.length === 0) {
      return 0;
    }

    const rawIndex = Math.round(scroller.scrollLeft / scroller.clientWidth);
    return Math.min(Math.max(rawIndex, 0), tickets.length - 1);
  };

  const updateActiveTicketIndexFromScroll = () => {
    if (tickets.length <= 1) {
      if (activeTicketIndex !== 0) {
        setActiveTicketIndex(0);
      }

      return;
    }

    const currentIndex = getCurrentTicketIndex();
    if (currentIndex !== activeTicketIndex) {
      setActiveTicketIndex(currentIndex);
    }
  };

  useEffect(() => {
    if (tickets.length === 0) {
      setActiveTicketIndex(0);
      previousActiveTicketIndexRef.current = 0;
      return;
    }

    const clampedIndex = Math.min(activeTicketIndex, tickets.length - 1);
    if (clampedIndex !== activeTicketIndex) {
      setActiveTicketIndex(clampedIndex);
      previousActiveTicketIndexRef.current = clampedIndex;
    }
  }, [activeTicketIndex, tickets.length]);

  useEffect(() => {
    if (previousActiveTicketIndexRef.current === activeTicketIndex) {
      return;
    }

    void logEvent({
      eventType: 'custom',
      view: 'tickets',
      elementId: 'ticket_swipe_change',
      details: {
        previousIndex: previousActiveTicketIndexRef.current,
        activeIndex: activeTicketIndex,
        ticketCount: tickets.length,
      },
    });

    previousActiveTicketIndexRef.current = activeTicketIndex;
  }, [activeTicketIndex, tickets.length]);

  useEffect(() => {
    updateActiveTicketIndexFromScroll();
  }, [tickets.length]);

  useEffect(() => {
    const scroller = ticketsScrollerRef.current;

    if (!scroller) {
      return;
    }

    const handleScroll = () => {
      updateActiveTicketIndexFromScroll();
    };

    scroller.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scroller.removeEventListener('scroll', handleScroll);
    };
  }, [activeTicketIndex, tickets.length]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Mina biljetter</h2>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold mb-2">Inga biljetter än</h3>
          <p className="text-gray-600 text-sm">
            När du köper en biljett kommer den att visas här
          </p>
        </div>
      ) : (
        <div>
          <div
            ref={ticketsScrollerRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
          >
            {tickets.map((ticket, ticketIndex) => {
              const blobIndex = (qrFrame + ticketIndex) % QR_FLUFF_BLOBS.length;
              const qrPayload = buildTicketQrPayload(ticket, QR_FLUFF_BLOBS[blobIndex]);

              return (
                <div key={ticket.id} className="w-full shrink-0 snap-start">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Ticket Header */}
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm opacity-90">Giltig biljett</span>
                        <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">
                          {ticket.operators.join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold">{ticket.from}</div>
                          <div className="text-sm opacity-90">Avgång från</div>
                        </div>
                        <ChevronRight className="w-6 h-6 opacity-75" />
                        <div className="text-right">
                          <div className="text-2xl font-bold">{ticket.to}</div>
                          <div className="text-sm opacity-90">Ankomst till</div>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="p-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{new Date(ticket.date).toLocaleDateString('sv-SE', {
                            day: 'numeric',
                            month: 'long'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>Giltig {ticket.validFrom}–{ticket.validUntil}</span>
                        </div>
                      </div>

                      {/* QR Code Section */}
                      <div className="bg-gray-100 rounded-lg p-6 flex flex-col items-center">
                        <div className="w-full max-w-[30rem] aspect-square bg-white rounded-lg flex items-center justify-center mb-3 p-2">
                          <QRCodeSVG
                            value={qrPayload}
                            size={512}
                            level="M"
                            marginSize={4}
                            className="w-full h-full"
                          />
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          Visa denna QR-kod för kontrollant
                        </p>
                      </div>

                      {/* Ticket Info */}
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <strong>Biljetten är flexibel:</strong> Du kan åka med vilken avgång som helst mellan {ticket.validFrom} och {ticket.validUntil}. Ej bunden till specifikt tåg.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 mt-3" aria-label="Aktiv biljett">
            {tickets.map((ticket, ticketIndex) => (
              <span
                key={ticket.id}
                className={`h-2 rounded-full transition-all ${ticketIndex === activeTicketIndex ? 'w-5 bg-blue-500' : 'w-2 bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-2">Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Dina biljetter sparas automatiskt i appen</li>
          <li>• Håll QR-koden redo vid påstigning</li>
          <li>• Biljetter kan återbetalas fram till 24h före avgång</li>
          <li>• Vid förseningar får du automatisk information</li>
        </ul>
      </div>
    </div>
  );
}