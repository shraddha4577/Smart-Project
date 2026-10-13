import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginView from './views/LoginView';
import AdminDashboardView from './views/AdminDashboardView';
import ManageWasteDataView from './views/ManageWasteDataView';
import AIDetectionView from './views/AIDetectionView';
import DigitalTwinView from './components/DigitalTwinView';
import AIRecommendationsView from './views/AIRecommendationsView';
import CollectionManagementView from './views/CollectionManagementView';
import ReportsAnalyticsView from './views/ReportsAnalyticsView';
import SystemSettingsView from './views/SystemSettingsView';
import UserDashboardView from './views/UserDashboardView';
import CampusMap from './components/CampusMap';
import { api } from './api/client';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ecotwin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeView, setActiveView] = useState('dashboard');
  const [bins, setBins] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedTwinBin, setSelectedTwinBin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync view when role changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setActiveView('dashboard');
      } else {
        setActiveView('user-dashboard');
      }
    }
  }, [currentUser?.role]);

  // Fetch live system data
  const fetchData = async () => {
    try {
      const [binsRes, statsRes, alertsRes] = await Promise.all([
        api.getBins(),
        api.getDashboardStats(),
        api.getCollections(),
      ]);
      setBins(binsRes);
      setStats(statsRes);
      setAlerts(alertsRes);
      if (!selectedTwinBin && binsRes.length > 0) {
        setSelectedTwinBin(binsRes[0]);
      }
    } catch (e) {
      console.error('Failed to fetch data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh interval (every 8 seconds to reflect simulated IoT changes)
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('ecotwin_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ecotwin_user');
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onSimulateTick={fetchData}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          role={currentUser.role}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Admin Flows */}
          {activeView === 'dashboard' && (
            <AdminDashboardView
              bins={bins}
              stats={stats}
              alerts={alerts}
              onRefreshData={fetchData}
              onSelectTwinBin={(bin) => setSelectedTwinBin(bin)}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'bins' && (
            <ManageWasteDataView
              bins={bins}
              onRefreshBins={fetchData}
              onSelectTwinBin={(bin) => setSelectedTwinBin(bin)}
              setActiveView={setActiveView}
            />
          )}

          {activeView === 'vision' && (
            <AIDetectionView />
          )}

          {activeView === 'digital-twin' && (
            <DigitalTwinView
              bins={bins}
              selectedBinId={selectedTwinBin?.id}
              onRefreshBins={fetchData}
            />
          )}

          {activeView === 'recommendations' && (
            <AIRecommendationsView />
          )}

          {activeView === 'collections' && (
            <CollectionManagementView
              alerts={alerts}
              bins={bins}
              onRefreshData={fetchData}
            />
          )}

          {activeView === 'reports' && (
            <ReportsAnalyticsView
              bins={bins}
              stats={stats}
            />
          )}

          {activeView === 'settings' && (
            <SystemSettingsView
              onRefreshAll={fetchData}
            />
          )}

          {/* Student / User Flows */}
          {activeView === 'user-dashboard' && (
            <UserDashboardView
              bins={bins}
              currentUser={currentUser}
              setActiveView={setActiveView}
              onSelectTwinBin={(bin) => {
                setSelectedTwinBin(bin);
                setActiveView('digital-twin');
              }}
            />
          )}

          {activeView === 'map-locator' && (
            <div className="space-y-4">
              <div className="bg-navy-850 rounded-2xl p-5 border border-navy-750">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Interactive Campus Smart Bin Locator
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Locate all smart receptacles across academic buildings, dining halls, and student dormitories.
                </p>
              </div>
              <div className="h-[600px] rounded-2xl overflow-hidden border border-navy-750">
                <CampusMap
                  bins={bins}
                  onSelectTwinBin={(bin) => {
                    setSelectedTwinBin(bin);
                    setActiveView('digital-twin');
                  }}
                />
              </div>
            </div>
          )}

          {activeView === 'report-issue' && (
            <UserDashboardView
              bins={bins}
              currentUser={currentUser}
              setActiveView={setActiveView}
              onSelectTwinBin={(bin) => {
                setSelectedTwinBin(bin);
                setActiveView('digital-twin');
              }}
            />
          )}

          {activeView === 'user-reports' && (
            <ReportsAnalyticsView
              bins={bins}
              stats={stats}
            />
          )}
        </main>
      </div>
    </div>
  );
}
