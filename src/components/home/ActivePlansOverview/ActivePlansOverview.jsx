import { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, RefreshCw, X, FileText, Calendar } from 'lucide-react';
import { useApiData } from '@hooks/useApiData';
import api from '@services/api';
import styles from './ActivePlansOverview.module.css';

export const ActivePlansOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  
  // Fetch active plans with auto-refresh every 30 seconds
  const { data, loading, error, isRefreshing } = useApiData(
    api.getActivePlans,
    { refreshInterval: 30000 }
  );

  const plans = data?.active_plans || [];

  // Filter logic
  let filteredPlans = plans.filter(plan => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        plan.depot_id?.toLowerCase().includes(search) ||
        plan.depot_name?.toLowerCase().includes(search) ||
        plan.version?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Limit display to top 10 unless "Show All" is clicked
  const displayPlans = showAll ? filteredPlans : filteredPlans.slice(0, 10);
  const hasMore = filteredPlans.length > 10;

  // Calculate summary stats
  const totalVehicles = plans.reduce((sum, p) => sum + (p.total_vehicles || 0), 0);
  const totalDrivers = plans.reduce((sum, p) => sum + (p.total_drivers || 0), 0);
  const totalTrips = plans.reduce((sum, p) => sum + (p.total_trips || 0), 0);

  // Loading state
  if (loading && !data) {
    return (
      <section className={styles.plansSection}>
        <h2 className={styles.sectionTitle}>
          ACTIVE OPTIMIZATION PLANS
        </h2>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading active plans...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={styles.plansSection}>
        <h2 className={styles.sectionTitle}>
          ACTIVE OPTIMIZATION PLANS
        </h2>
        <div className={styles.errorState}>
          <AlertTriangle size={24} style={{ marginBottom: '8px' }} />
          <p>Failed to load active plans</p>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </section>
    );
  }

  // Empty state
  if (filteredPlans.length === 0) {
    return (
      <section className={styles.plansSection}>
        <h2 className={styles.sectionTitle}>
          ACTIVE OPTIMIZATION PLANS
          {isRefreshing && <RefreshCw className={styles.refreshIndicator} size={16} />}
        </h2>
        
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search by depot ID, name, or version..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button 
              className={styles.clearSearch}
              onClick={() => setSearchTerm('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className={styles.emptyState}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No active plans found</p>
          <p className={styles.emptyMessage}>
            {searchTerm ? `No plans matching "${searchTerm}"` : 'No optimization plans are currently active'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.plansSection}>
      <h2 className={styles.sectionTitle}>
        ACTIVE OPTIMIZATION PLANS
        {isRefreshing && <RefreshCw className={styles.refreshIndicator} size={16} />}
      </h2>

      {/* Summary Stats */}
      <div className={styles.plansSummary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue}>{plans.length}</span>
          <span className={styles.summaryLabel}>Active Plans</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue} style={{ color: 'var(--railway-blue)' }}>
            {totalVehicles}
          </span>
          <span className={styles.summaryLabel}>Total Vehicles</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue} style={{ color: 'var(--brass-accent)' }}>
            {totalDrivers}
          </span>
          <span className={styles.summaryLabel}>Total Drivers</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryValue} style={{ color: 'var(--signal-green)' }}>
            {totalTrips}
          </span>
          <span className={styles.summaryLabel}>Total Trips</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by depot ID, name, or version..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        {searchTerm && (
          <button 
            className={styles.clearSearch}
            onClick={() => setSearchTerm('')}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        Showing {displayPlans.length} of {filteredPlans.length} plans
        {searchTerm && ` matching "${searchTerm}"`}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.plansTable}>
          <thead>
            <tr>
              <th>DEPOT</th>
              <th>VERSION</th>
              <th>ACTIVATED</th>
              <th>RESOURCES</th>
              <th>EFFICIENCY</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {displayPlans.map((plan) => (
              <tr key={plan.plan_id}>
                <td>
                  <div className={styles.depotInfo}>
                    <div className={styles.depotId}>{plan.depot_id}</div>
                    <div className={styles.depotName}>{plan.depot_name || 'N/A'}</div>
                  </div>
                </td>
                <td className={styles.version}>
                  <span className={styles.versionBadge}>{plan.version}</span>
                </td>
                <td className={styles.activatedDate}>
                  <Calendar size={12} style={{ display: 'inline', marginRight: '4px', opacity: 0.6 }} />
                  {plan.activated_at ? new Date(plan.activated_at).toLocaleDateString('en-IN') : 'N/A'}
                </td>
                <td className={styles.resources}>
                  <div className={styles.resourceItem}>
                    <span className={styles.resourceLabel}>V:</span>
                    <span className={styles.resourceValue}>{plan.total_vehicles || 0}</span>
                  </div>
                  <div className={styles.resourceItem}>
                    <span className={styles.resourceLabel}>D:</span>
                    <span className={styles.resourceValue}>{plan.total_drivers || 0}</span>
                  </div>
                  <div className={styles.resourceItem}>
                    <span className={styles.resourceLabel}>T:</span>
                    <span className={styles.resourceValue}>{plan.total_trips || 0}</span>
                  </div>
                </td>
                <td className={styles.efficiency}>
                  <div className={styles.efficiencyMetric}>
                    <span className={styles.metricLabel}>Util:</span>
                    <span className={styles.metricValue}>
                      {plan.vehicle_utilization ? `${(plan.vehicle_utilization * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className={styles.efficiencyMetric}>
                    <span className={styles.metricLabel}>Cov:</span>
                    <span className={styles.metricValue}>
                      {plan.trip_coverage ? `${(plan.trip_coverage * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </td>
                <td className={styles.status}>
                  <span className={styles.statusBadge} data-status="active">
                    <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    ACTIVE
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More Button */}
      {hasMore && !showAll && (
        <div className={styles.showMoreContainer}>
          <button 
            className={styles.showMoreBtn}
            onClick={() => setShowAll(true)}
          >
            Show All {filteredPlans.length} Plans ↓
          </button>
        </div>
      )}

      {showAll && (
        <div className={styles.showMoreContainer}>
          <button 
            className={styles.showMoreBtn}
            onClick={() => setShowAll(false)}
          >
            Show Less ↑
          </button>
        </div>
      )}
    </section>
  );
};
