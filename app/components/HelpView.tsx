import { MessageCircle, FileText, AlertCircle, Phone, Mail, Clock } from 'lucide-react';

export function HelpView() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Hjälp & Support</h2>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="font-semibold mb-3">Snabblänkar</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Begär ersättning</span>
            </div>
            <span className="text-sm text-blue-500">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Mina ärenden</span>
            </div>
            <span className="text-sm text-gray-600">→</span>
          </button>
        </div>
      </div>

      {/* Compensation Info */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="font-semibold mb-3">Ersättning vid försening</h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-medium text-green-900 mb-1">Automatisk hantering</p>
            <p className="text-green-800">
              Vid försening som påverkar din resa får du automatiskt information om alternativ och eventuell ersättning direkt i appen.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Ersättningsnivåer:</h4>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-700">20-59 min försening</span>
              <span className="font-medium">50% återbetalning</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-700">60+ min försening</span>
              <span className="font-medium">100% återbetalning</span>
            </div>
          </div>

          <p className="text-gray-600 text-xs pt-2 border-t border-gray-200">
            Ersättningen behandlas automatiskt och betalas ut inom 7 dagar till ditt konto.
          </p>
        </div>
      </div>

      {/* Responsibility Clarity */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="font-semibold mb-3">Vem ansvarar för vad?</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium mb-1">ReSam (denna app)</p>
            <ul className="space-y-1 text-gray-600 ml-4">
              <li>• Samordning mellan operatörer</li>
              <li>• Ersättningshantering</li>
              <li>• Biljettköp och giltighet</li>
              <li>• Support vid problem</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Trafikoperatörer (SL, UL, SJ, etc.)</p>
            <ul className="space-y-1 text-gray-600 ml-4">
              <li>• Trafik och tåg/bussar</li>
              <li>• Trafikinformation</li>
              <li>• Fordonens skick</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="font-semibold mb-3">Kontakta oss</h3>
        <div className="space-y-3">
          <a href="tel:0771123456" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium">Telefon</p>
              <p className="text-sm text-gray-600">0771-123 456</p>
            </div>
          </a>
          <a href="mailto:support@resam.se" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium">E-post</p>
              <p className="text-sm text-gray-600">support@resam.se</p>
            </div>
          </a>
          <button className="w-full flex items-center gap-3 p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Starta chatt</span>
          </button>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium">Öppettider support</h3>
        </div>
        <div className="text-sm text-gray-700 space-y-1">
          <p>Vardagar: 07:00 - 21:00</p>
          <p>Helger: 09:00 - 18:00</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Ersättningsärenden hanteras automatiskt dygnet runt
        </p>
      </div>
    </div>
  );
}