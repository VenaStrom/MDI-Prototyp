import { useState } from "react";
import { Search, Ticket, HelpCircle } from "lucide-react";
import { SearchView } from "./components/SearchView";
import { MyTicketsView } from "./components/MyTicketsView";
import { HelpView } from "./components/HelpView";
import "../styles/index.tw.css";

type View = "search" | "tickets" | "help";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("search");

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-blue-400 text-white p-4 shadow-md">
        <h1 className="text-xl font-semibold">ReSam</h1>
        <p className="text-sm opacity-90">Samlad resa i Mälardalen</p>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {currentView === "search" && <SearchView />}
        {currentView === "tickets" && <MyTicketsView />}
        {currentView === "help" && <HelpView />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 flex justify-around p-2 shadow-lg">
        <button
          onClick={() => setCurrentView("search")}
          className={`flex flex-col items-center p-2 flex-1 rounded-lg transition-colors ${currentView === "search"
            ? "text-blue-500 bg-blue-50"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1">Sök resa</span>
        </button>
        <button
          onClick={() => setCurrentView("tickets")}
          className={`flex flex-col items-center p-2 flex-1 rounded-lg transition-colors ${currentView === "tickets"
            ? "text-blue-500 bg-blue-50"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          <Ticket className="w-6 h-6" />
          <span className="text-xs mt-1">Mina biljetter</span>
        </button>
        <button
          onClick={() => setCurrentView("help")}
          className={`flex flex-col items-center p-2 flex-1 rounded-lg transition-colors ${currentView === "help"
            ? "text-blue-500 bg-blue-50"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          <HelpCircle className="w-6 h-6" />
          <span className="text-xs mt-1">Hjälp</span>
        </button>
      </nav>
    </div>
  );
}