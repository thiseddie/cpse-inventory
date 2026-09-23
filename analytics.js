/* ==========================================================================
   SAVINGS ANALYTICS INTERACTIVE LOGIC - CPSE HARMONIZE AI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons if loaded
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Initialize Visualizations
  initSavingsTrendChart();
  initCategoryDistributionChart();
});

/**
 * 1. Line Chart: Monthly Procurement Cost Avoidance Trend
 */
function initSavingsTrendChart() {
  const canvas = document.getElementById('savingsTrendChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      datasets: [{
        label: 'Savings (in Lakhs ₹)',
        data: [12, 19, 15, 25, 22, 30, 38, 42, 48],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` Savings: ₹${context.raw} Lakhs`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 12 } }
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: { 
            color: '#64748b',
            callback: function(value) { return '₹' + value + ' L'; }
          }
        }
      }
    }
  });
}

/**
 * 2. Doughnut Chart: Asset Transfer Category Breakdown
 */
function initCategoryDistributionChart() {
  const canvas = document.getElementById('categoryChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Electrical Cables', 'Valves & Fittings', 'Pipes & Tubing', 'Heavy Machinery', 'Turbine Spares'],
      datasets: [{
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          '#3b82f6', // Electrical
          '#10b981', // Valves
          '#f59e0b', // Pipes
          '#8b5cf6', // Heavy Machinery
          '#64748b'  // Spares
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 15,
            color: '#475569',
            font: { size: 12, weight: '500' }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.label}: ${context.raw}% share`;
            }
          }
        }
      },
      cutout: '70%'
    }
  });
}

/**
 * Trigger ESG PDF/Print Export
 */
function exportESGReport() {
  window.print();
}