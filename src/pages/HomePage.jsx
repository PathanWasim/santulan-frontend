import { useState, useEffect } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { CriticalAlerts } from '../components/home/CriticalAlerts';
import { FleetOverview } from '../components/home/FleetOverview';
import { DepotStatusCards } from '../components/home/DepotStatusCards';
import { ActivePlansOverview } from '../components/home/ActivePlansOverview';
import { mockAlerts } from '../mock-data/alerts';
import api from '../services/api';
import styles from './HomePage.module.css';

export const HomePage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getDashboardSummary();
        console.log('HomePage: Dashboard data received:', response);
        setDashboardData(response);
      } catch (err) {
        console.error('HomePage: Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <>
        <PageLayout
          title="Command Center Dashboard"
          subtitle="Real-time PMPML fleet operations overview and control center"
          breadcrumbPath="Home"
        >
          <div style={{ 
            padding: '60px', 
            textAlign: 'center', 
            fontSize: '18px',
            color: 'var(--text-secondary)'
          }}>
            Loading dashboard data...
          </div>
        </PageLayout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageLayout
          title="Command Center Dashboard"
          subtitle="Real-time PMPML fleet operations overview and control center"
          breadcrumbPath="Home"
        >
          <div style={{ 
            padding: '60px', 
            textAlign: 'center', 
            fontSize: '18px',
            color: 'var(--signal-red)'
          }}>
            Error: {error}
          </div>
        </PageLayout>
      </>
    );
  }

  return (
    <>
      <PageLayout
        title="Command Center Dashboard"
        subtitle="Real-time PMPML fleet operations overview and control center"
        breadcrumbPath="Home"
      >
        <CriticalAlerts alerts={mockAlerts} />
        
        {/* Fleet & Depot - Two Column Layout */}
        <div className={styles.twoColumnSection}>
          {/* Left Column: Fleet + Active Plans */}
          <div className={styles.leftColumn}>
            <FleetOverview data={dashboardData} />
            <ActivePlansOverview />
          </div>
          
          {/* Right Column: Depot */}
          <DepotStatusCards data={dashboardData} />
        </div>
      </PageLayout>
    </>
  );
};
