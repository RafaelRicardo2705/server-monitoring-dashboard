/**
 * Dashboard Frontend Logic
 * Handles API polling, DOM updates, log filtering, and UI state management.
 * Uses vanilla JavaScript with Fetch API and async/await.
 */

/* ─── State Management ─── */
const state = {
  logs: [],
  totalLogs: 0,
  currentLimit: 20,
  currentFilter: '',
  isLoadingStatus: false,
  isLoadingLogs: false,
  statusCountdown: 5,
  logsCountdown: 10,
  totalRequests: 0,
  activeConnections: 0
};

/* ─── DOM Element References ─── */
const elements = {
  /* Header */
  statusDot: document.getElementById('status-dot'),
  statusText: document.getElementById('status-text'),
  lastUpdated: document.getElementById('last-updated'),
  countdownValue: document.getElementById('countdown-value'),

  /* Metric Cards */
  serverStatusBadge: document.getElementById('server-status-badge'),
  uptimeValue: document.getElementById('uptime-value'),
  memoryPercentage: document.getElementById('memory-percentage'),
  memoryBar: document.getElementById('memory-bar'),
  memoryDetail: document.getElementById('memory-detail'),
  cpuValue: document.getElementById('cpu-value'),
  cpuBar: document.getElementById('cpu-bar'),
  totalRequests: document.getElementById('total-requests'),
  activeConnections: document.getElementById('active-connections'),

  /* Logs */
  logFilter: document.getElementById('log-filter'),
  logsTableBody: document.getElementById('logs-table-body'),
  logsTotal: document.getElementById('logs-total'),
  loadMoreBtn: document.getElementById('load-more-btn'),
  logsCountdown: document.getElementById('logs-countdown'),
  logsRefreshIcon: document.getElementById('logs-refresh-icon'),

  /* Footer */
  footerVersion: document.getElementById('footer-version'),
  footerApiDot: document.getElementById('footer-api-dot'),
  footerApiStatus: document.getElementById('footer-api-status')
};

/* ─── Utility Functions ─── */

/**
 * Convert seconds to human-readable duration string
 * @param {number} totalSeconds - Uptime in seconds
 * @returns {string} Formatted duration like "2d 5h 30m"
 */
const convertSecondsToDuration = (totalSeconds) => {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);

  return parts.join(' ');
};

/**
 * Format a timestamp string to locale-friendly display
 * @param {string} isoString - ISO 8601 timestamp
 * @returns {string} Formatted date/time string
 */
const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Format bytes to human-readable MB/GB string
 * @param {number} bytes - Byte count
 * @returns {string} Formatted string like "1.23 GB"
 */
const formatBytes = (bytes) => {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  }
  return `${(bytes / 1048576).toFixed(0)} MB`;
};

/**
 * Get CSS classes for a log level badge
 * @param {string} level - Log level (info|warn|error)
 * @returns {Object} CSS class strings for badge styling
 */
const getLevelStyles = (level) => {
  const styles = {
    info: {
      badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      icon: 'fa-info-circle'
    },
    warn: {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: 'fa-exclamation-triangle'
    },
    error: {
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: 'fa-times-circle'
    }
  };
  return styles[level] || styles.info;
};

/* ─── API Functions ─── */

/**
 * Fetch server status from /api/status
 */
const fetchStatus = async () => {
  if (state.isLoadingStatus) return;
  state.isLoadingStatus = true;

  try {
    const response = await fetch('/api/status');

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const { data } = await response.json();
    updateStatusUI(data);
    updateApiStatus(true);

    /* Simulate request tracking */
    state.totalRequests += Math.floor(Math.random() * 15) + 5;
    state.activeConnections = Math.floor(Math.random() * 50) + 10;
    elements.totalRequests.textContent = state.totalRequests.toLocaleString();
    elements.activeConnections.textContent = state.activeConnections;
  } catch (error) {
    handleFetchError('status', error);
  } finally {
    state.isLoadingStatus = false;
  }
};

/**
 * Fetch logs from /api/logs with current filter/limit
 */
const fetchLogs = async () => {
  if (state.isLoadingLogs) return;
  state.isLoadingLogs = true;

  /* Spin refresh icon */
  elements.logsRefreshIcon.classList.add('fa-spin');

  try {
    const params = new URLSearchParams({ limit: state.currentLimit });
    if (state.currentFilter) {
      params.set('level', state.currentFilter);
    }

    const response = await fetch(`/api/logs?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const { data } = await response.json();
    state.logs = data.logs;
    state.totalLogs = data.total;
    renderLogs();
    updateApiStatus(true);
  } catch (error) {
    handleFetchError('logs', error);
  } finally {
    state.isLoadingLogs = false;
    elements.logsRefreshIcon.classList.remove('fa-spin');
  }
};

/* ─── UI Update Functions ─── */

/**
 * Update all status-related UI elements
 * @param {Object} data - Status response data
 */
const updateStatusUI = (data) => {
  const { serverStatus, uptime, timestamp, memoryUsage, cpuLoad, version } = data;

  /* Server status indicator */
  const isOnline = serverStatus === 'online';
  elements.statusText.textContent = isOnline ? 'Online' : 'Offline';
  elements.statusText.className = `text-xs font-medium uppercase tracking-wide ${
    isOnline ? 'text-emerald-400' : 'text-rose-400'
  }`;

  /* Status badge in card */
  const badgeColor = isOnline ? 'emerald' : 'rose';
  elements.serverStatusBadge.className = `inline-flex items-center gap-2 px-3 py-1.5 bg-${badgeColor}-500/10 border border-${badgeColor}-500/20 rounded-full`;
  elements.serverStatusBadge.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-${badgeColor}-500"></span>
    <span class="text-sm font-semibold text-${badgeColor}-400">${isOnline ? 'Online' : 'Offline'}</span>
  `;

  /* Uptime */
  elements.uptimeValue.textContent = convertSecondsToDuration(uptime);

  /* Memory */
  elements.memoryPercentage.textContent = `${memoryUsage.percentage}%`;
  elements.memoryBar.style.width = `${Math.min(memoryUsage.percentage, 100)}%`;
  elements.memoryDetail.textContent = `${formatBytes(memoryUsage.used)} / ${formatBytes(memoryUsage.total)}`;

  /* CPU */
  const cpuPercent = (cpuLoad * 100).toFixed(1);
  elements.cpuValue.textContent = `${cpuPercent}%`;
  elements.cpuBar.style.width = `${Math.min(cpuPercent, 100)}%`;

  /* Last updated */
  elements.lastUpdated.textContent = new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });

  /* Footer version */
  elements.footerVersion.textContent = `v${version}`;
};

/**
 * Render log entries into the table
 */
const renderLogs = () => {
  if (state.logs.length === 0) {
    elements.logsTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-12 text-center text-slate-500">
          <i class="fas fa-inbox text-2xl mb-3 block"></i>
          No logs found
        </td>
      </tr>
    `;
    elements.logsTotal.textContent = 'No logs';
    elements.loadMoreBtn.classList.add('hidden');
    return;
  }

  elements.logsTableBody.innerHTML = state.logs
    .map((log) => {
      const styles = getLevelStyles(log.level);
      return `
        <tr class="log-row border-b border-slate-800/50">
          <td class="px-4 py-3 whitespace-nowrap">
            <span class="text-xs font-mono text-slate-400">${formatTimestamp(log.timestamp)}</span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium border rounded-full ${styles.badge}">
              <i class="fas ${styles.icon} text-[10px]"></i>
              ${log.level.toUpperCase()}
            </span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap">
            <span class="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">${log.source}</span>
          </td>
          <td class="px-4 py-3">
            <span class="text-sm text-slate-300">${log.message}</span>
          </td>
        </tr>
      `;
    })
    .join('');

  /* Update totals and load-more button */
  elements.logsTotal.textContent = `Showing ${state.logs.length} of ${state.totalLogs} logs`;
  if (state.logs.length < state.totalLogs) {
    elements.loadMoreBtn.classList.remove('hidden');
  } else {
    elements.loadMoreBtn.classList.add('hidden');
  }
};

/**
 * Update the API connection status in the footer
 * @param {boolean} connected - Whether API is reachable
 */
const updateApiStatus = (connected) => {
  elements.footerApiDot.className = `w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`;
  elements.footerApiStatus.textContent = connected ? 'API Connected' : 'API Disconnected';
};

/**
 * Handle fetch errors with fallback UI
 * @param {string} type - Type of fetch (status|logs)
 * @param {Error} error - The error object
 */
const handleFetchError = (type, error) => {
  console.error(`Failed to fetch ${type}:`, error.message);
  updateApiStatus(false);

  if (type === 'status') {
    elements.statusText.textContent = 'Offline';
    elements.statusText.className = 'text-xs text-rose-400 font-medium uppercase tracking-wide';
  }
};

/* ─── Polling & Countdown Timers ─── */

/**
 * Start the status polling cycle (every 5 seconds)
 */
const startStatusPolling = () => {
  state.statusCountdown = 5;

  /* Fetch immediately on start */
  fetchStatus();

  /* Countdown timer */
  setInterval(() => {
    state.statusCountdown--;
    elements.countdownValue.textContent = state.statusCountdown;

    if (state.statusCountdown <= 0) {
      state.statusCountdown = 5;
      fetchStatus();
    }
  }, 1000);
};

/**
 * Start the logs polling cycle (every 10 seconds)
 */
const startLogsPolling = () => {
  state.logsCountdown = 10;

  /* Fetch immediately on start */
  fetchLogs();

  /* Countdown timer */
  setInterval(() => {
    state.logsCountdown--;
    elements.logsCountdown.textContent = `${state.logsCountdown}s`;

    if (state.logsCountdown <= 0) {
      state.logsCountdown = 10;
      fetchLogs();
    }
  }, 1000);
};

/* ─── Event Listeners ─── */

/* Filter dropdown change */
elements.logFilter.addEventListener('change', (e) => {
  state.currentFilter = e.target.value;
  state.currentLimit = 20;
  fetchLogs();
});

/* Load more button */
elements.loadMoreBtn.addEventListener('click', () => {
  state.currentLimit += 20;
  fetchLogs();
});

/* ─── Initialize Dashboard ─── */
const initDashboard = () => {
  startStatusPolling();
  startLogsPolling();
};

/* Wait for DOM to be fully loaded */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
