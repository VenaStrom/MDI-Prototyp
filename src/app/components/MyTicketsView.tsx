import { QrCode, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Location as L } from '../../locations';

const mockTickets = [
  {
    id: '1',
    from: L.UppsalaC,
    to: L.StockholmC,
    date: '2026-03-07',
    validFrom: '08:15',
    validUntil: '10:15',
    price: 145,
    operators: ['UL'],
    status: 'active'
  }
];

export function MyTicketsView() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Mina biljetter</h2>

      {mockTickets.length === 0 ? (
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
        <div className="space-y-3">
          {mockTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mb-3">
                    <QrCode className="w-32 h-32 text-gray-700" />
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
          ))}
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