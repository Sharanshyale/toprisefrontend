"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Filter } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SearchInput from "@/components/common/search/SearchInput";
import DynamicButton from "@/components/common/button/button";
import useDebounce from "@/utils/useDebounce";
import { getTickets } from "@/service/Ticket-service";
import { Ticket, TicketResponse, TicketStatus, TicketType } from "@/types/Ticket-types";
import GeneralTickets from "./components/GeneralTickets";
import UserTickets from "./components/UserTickets";

type TabType = "General" | "User";

interface TabConfig {
  id: TabType;
  label: string;
  component?: React.ComponentType<any>;
}

export default function ShowTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("General");

  
  // Dialog state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch tickets function
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTickets();
      
      if (response.success && response.data) {
        setTickets(response.data);
      } else {
        console.warn("Invalid response structure:", response);
        setTickets([]);
      }
    } catch (error) {
      console.log("error in fetch tickets", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

    // Tab configurations
  const tabConfigs: TabConfig[] = useMemo(() => [
    {
      id: "General",
      label: "General",
      component: GeneralTickets,
    },
    {
      id: "User",
      label: "User",
      component: UserTickets,
    },
  ], []);

  // Get current tab configuration
  const currentTabConfig = useMemo(
    () => tabConfigs.find((tab) => tab.id === activeTab) || tabConfigs[0],
    [tabConfigs, activeTab]
  );

  // Render tab content similar to ProductManagement
  const renderTabContent = useCallback(() => {
    const TabComponent = currentTabConfig.component;
    if (!TabComponent) return null;
    
    return (
      <TabComponent
        tickets={tickets}
        searchQuery={searchQuery}
        loading={loading}
        onViewTicket={handleViewTicketDetails}
        onTicketsRefresh={fetchTickets}
      />
    );
  }, [currentTabConfig, tickets, searchQuery, loading, fetchTickets]);

  // Debounced search functionality
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(false);
  }, []);

  const { debouncedCallback: debouncedSearch } = useDebounce(performSearch, 500);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setIsSearching(value.trim() !== "");
    debouncedSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearching(false);
  };



  // Handle opening ticket details dialog
  const handleViewTicketDetails = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsDialogOpen(true);
  };

  // Handle closing ticket details dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTicketId(null);
  };

  return (
    <div className="w-full">
      <Card className="shadow-sm rounded-none">
        {/* Header */}
        <CardHeader className="space-y-4 sm:space-y-6">
          <CardTitle className="text-[#000000] font-bold text-lg font-sans">
            <span>Support Tickets</span>
          </CardTitle>

          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4 w-full">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3 w-full lg:w-auto">
              <SearchInput
                placeholder="Search tickets"
                value={searchInput}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                isLoading={isSearching}
              />
              <div className="flex gap-2 sm:gap-3">
                <DynamicButton
                  variant="outline"
                  text="Filters"
                  icon={<Filter className="h-4 w-4 mr-2" />}
                />
              </div>
            </div>
          </div>

          {/* Tickets Section Header */}
          <div className="mb-4">
            <CardTitle className="font-sans font-bold text-lg text-[#000000]">
              {currentTabConfig.label}
            </CardTitle>
            <CardDescription className="text-sm text-[#737373] font-medium font-sans">
              Manage and track support tickets by category
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Tab Bar */}
          <div
            className="flex w-full items-center justify-between border-b border-gray-200 overflow-x-auto"
            aria-label="Ticket tabs"
          >
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabConfigs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm font-mono transition-colors
                    ${
                      activeTab === tab.id
                        ? "text-[#C72920] border-b-2 border-[#C72920]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <span>{tab.label}</span>
                  {/* Show count for each tab */}
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? "bg-[#C72920] text-white" 
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {tab.id === "General" 
                      ? tickets.filter(ticket => ticket.ticketType === "General").length
                      : tickets.filter(ticket => ticket.ticketType === "Order").length
                    }
                  </span>
                </button>
              ))}
            </nav>
          </div>
          {/* Tab Content */}
          <div className="min-h-[400px] font-sans">
            {renderTabContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
