import { useEffect, useState } from "react";
import { Search, Ticket, HelpCircle, LucideTicketPlus } from "lucide-react";
import { SearchView } from "./components/SearchView";
import { MyTicketsView } from "./components/MyTicketsView";
import { HelpView } from "./components/HelpView";
import { logEvent } from "./telemetry";
import { ALWAYS_MOCK_TICKET, type AppTicket } from "./tickets";
import "../styles/index.tw.css";

type View = "search" | "tickets" | "help";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("search");
  const [tickets, setTickets] = useState<AppTicket[]>([ALWAYS_MOCK_TICKET]);

  useEffect(() => {
    void logEvent({
      eventType: "view_open",
      view: currentView,
    });
  }, [currentView]);

  useEffect(() => {
    void logEvent({
      eventType: "custom",
      view: "app",
      elementId: "seed_mock_ticket",
      details: {
        ticketId: ALWAYS_MOCK_TICKET.id,
      },
    });
  }, []);

  return (
    <div className="flex flex-col h-dvh bg-gray-50 lg:max-w-6/12 mx-auto">
      {/* Header */}
      <header className="bg-blue-400 text-white p-4 py-3.5 shadow-md flex flex-row items-center gap-x-2">
        <LucideTicketPlus className="w-8 h-8 mb-1" />
        <span>
          <h1 className="text-xl font-semibold">[[Appnamn]]</h1>
          <p className="text-sm opacity-90">Samlad resa i Mälardalen</p>
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {currentView === "search" && (
          <SearchView
            onShowTickets={() => setCurrentView("tickets")}
            onTicketPurchased={(ticket) => {
              setTickets((previousTickets) => [ticket, ...previousTickets]);
            }}
          />
        )}
        {currentView === "tickets" && <MyTicketsView tickets={tickets} />}
        {currentView === "help" && <HelpView />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 flex justify-around p-2 shadow-lg">
        <button
          onClick={() => {
            void logEvent({
              eventType: "button_click",
              view: "navigation",
              elementId: "nav_search",
            });
            setCurrentView("search");
          }}
          className={`flex flex-col items-center p-2 flex-1 rounded-lg transition-colors ${currentView === "search"
            ? "text-blue-500 bg-blue-50"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1">Sök resa</span>
        </button>
        <button
          onClick={() => {
            void logEvent({
              eventType: "button_click",
              view: "navigation",
              elementId: "nav_tickets",
            });
            setCurrentView("tickets");
          }}
          className={`flex flex-col items-center p-2 flex-1 rounded-lg transition-colors ${currentView === "tickets"
            ? "text-blue-500 bg-blue-50"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          <Ticket className="w-6 h-6" />
          <span className="text-xs mt-1">Mina biljetter</span>
        </button>
        <button
          onClick={() => {
            void logEvent({
              eventType: "button_click",
              view: "navigation",
              elementId: "nav_help",
            });
            setCurrentView("help");
          }}
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