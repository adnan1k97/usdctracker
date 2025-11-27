// Configuration
const CONFIG = {
    API_URL: 'https://api.etherscan.io/api',
    CONTRACT_ADDRESS: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    API_KEY: '7AGGIWF7SQAM3FRWNY24KWI34ZT6AUHYUQ',
    REFRESH_INTERVAL: 15000, // 15 seconds
    TOKEN_DECIMALS: 6 // USDC has 6 decimals
};

// State management
let balanceHistory = [];
let chart = null;
let refreshInterval = null;

// DOM Elements
const elements = {
    statusIndicator: document.getElementById('statusIndicator'),
    statusText: document.getElementById('statusText'),
    statusDot: document.querySelector('.status-dot'),
    lastUpdate: document.getElementById('lastUpdate'),
    refreshBtn: document.getElementById('refreshBtn'),
    numberLoading: document.getElementById('numberLoading'),
    chartLoading: document.getElementById('chartLoading'),
    tableLoading: document.getElementById('tableLoading'),
    balanceValue: document.getElementById('balanceValue'),
    balanceFormatted: document.getElementById('balanceFormatted'),
    tableBody: document.getElementById('tableBody')
};

// Initialize Chart
function initChart() {
    const ctx = document.getElementById('balanceChart');
    if (!ctx) return;

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'USDC Balance',
                data: [],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#a0aec0',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#1e2742',
                    titleColor: '#ffffff',
                    bodyColor: '#a0aec0',
                    borderColor: '#2d3748',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `Balance: ${formatUSDC(context.parsed.y)} USDC`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#718096',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: '#2d3748',
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: '#718096',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatUSDC(value);
                        }
                    },
                    grid: {
                        color: '#2d3748',
                        drawBorder: false
                    }
                }
            }
        }
    });
}

// Format USDC value (6 decimals)
function formatUSDC(value) {
    if (!value || value === '0') return '0.00';
    const num = typeof value === 'string' ? value : value.toString();
    const formatted = (BigInt(num) / BigInt(10 ** CONFIG.TOKEN_DECIMALS)).toString();
    const parts = formatted.split('.');
    if (parts.length === 1) {
        return parseFloat(formatted).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    return parseFloat(formatted).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
    });
}

// Format large numbers
function formatLargeNumber(value) {
    const num = parseFloat(value);
    if (num >= 1e12) {
        return (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}

// Update status indicator
function updateStatus(status, message) {
    elements.statusDot.className = 'status-dot ' + status;
    elements.statusText.textContent = message;
}

// Show loading state
function showLoading() {
    elements.numberLoading.classList.add('active');
    elements.chartLoading.classList.add('active');
    elements.tableLoading.classList.add('active');
    updateStatus('loading', 'Loading...');
}

// Hide loading state
function hideLoading() {
    elements.numberLoading.classList.remove('active');
    elements.chartLoading.classList.remove('active');
    elements.tableLoading.classList.remove('active');
}

// Fetch USDC balance from Etherscan API
async function fetchUSDCBalance() {
    try {
        showLoading();
        
        const url = `${CONFIG.API_URL}?module=account&action=tokenbalance&contractaddress=${CONFIG.CONTRACT_ADDRESS}&apikey=${CONFIG.API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === '1' && data.message === 'OK') {
            const balance = data.result;
            updateDashboard(balance);
            updateStatus('connected', 'Connected');
            hideLoading();
        } else {
            throw new Error(data.message || 'API returned an error');
        }
    } catch (error) {
        console.error('Error fetching USDC balance:', error);
        updateStatus('error', 'Connection Error');
        hideLoading();
        
        // Show error in UI
        elements.balanceValue.textContent = 'Error';
        elements.balanceFormatted.textContent = 'Failed to fetch data';
    }
}

// Update dashboard with new data
function updateDashboard(balance) {
    const formattedBalance = formatUSDC(balance);
    const numericBalance = parseFloat(BigInt(balance) / BigInt(10 ** CONFIG.TOKEN_DECIMALS));
    
    // Update number widget
    elements.balanceValue.textContent = formatLargeNumber(numericBalance);
    elements.balanceFormatted.textContent = `${formattedBalance} USDC`;
    
    // Update table
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    elements.tableBody.innerHTML = `
        <tr>
            <td>Balance (Wei)</td>
            <td>${balance}</td>
        </tr>
        <tr>
            <td>Balance (USDC)</td>
            <td>${formattedBalance} USDC</td>
        </tr>
        <tr>
            <td>Contract Address</td>
            <td>${CONFIG.CONTRACT_ADDRESS}</td>
        </tr>
        <tr>
            <td>Last Updated</td>
            <td>${dateString} ${timeString}</td>
        </tr>
        <tr>
            <td>API Status</td>
            <td>Active</td>
        </tr>
    `;
    
    // Update chart
    const timestamp = now.toLocaleTimeString('en-US', { 
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    balanceHistory.push({
        time: timestamp,
        value: numericBalance
    });
    
    // Keep only last 20 data points
    if (balanceHistory.length > 20) {
        balanceHistory.shift();
    }
    
    if (chart) {
        chart.data.labels = balanceHistory.map(item => item.time);
        chart.data.datasets[0].data = balanceHistory.map(item => item.value);
        chart.update('none'); // 'none' mode for smooth updates
    }
    
    // Update last update time
    elements.lastUpdate.textContent = `Last update: ${dateString} ${timeString}`;
}

// Manual refresh
function handleRefresh() {
    fetchUSDCBalance();
}

// Initialize auto-refresh
function initAutoRefresh() {
    // Clear existing interval if any
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // Set up new interval
    refreshInterval = setInterval(() => {
        fetchUSDCBalance();
    }, CONFIG.REFRESH_INTERVAL);
}

// Event Listeners
elements.refreshBtn.addEventListener('click', handleRefresh);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    fetchUSDCBalance();
    initAutoRefresh();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

