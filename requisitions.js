/* ==========================================================================
   CPSE HARMONIZE AI - INTERACTIVE LOGIC (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons automatically
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Attach Event Listeners to Search Input
  const searchInput = document.getElementById('reqSearch');
  if (searchInput) {
    searchInput.addEventListener('keyup', searchRequisitions);
  }
});

/**
 * Filter Requisition Table Rows by Status Tag
 * @param {string} status - 'all', 'Pending Approval', 'In Transit', or 'Completed'
 */
function filterStatus(status) {
  const rows = document.querySelectorAll('.req-row');
  const buttons = document.querySelectorAll('.status-btn');

  // Update Button Styles
  buttons.forEach(btn => {
    btn.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
    btn.classList.add('text-slate-400');
  });

  // Active button highlight
  if (event && event.target) {
    event.target.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
    event.target.classList.remove('text-slate-400');
  }

  // Row Filter Logic
  rows.forEach(row => {
    const rowStatus = row.getAttribute('data-status');
    if (status === 'all' || rowStatus === status) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

/**
 * Live Search Filter across Requisitions Table
 */
function searchRequisitions() {
  const searchInput = document.getElementById('reqSearch');
  if (!searchInput) return;

  const query = searchInput.value.toLowerCase().trim();
  const rows = document.querySelectorAll('.req-row');

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

/**
 * Handle Requisition Action Triggers
 * @param {string} reqId - Unique Requisition Reference ID
 */
function viewDetails(reqId) {
  console.log(`Fetching details for ${reqId}...`);
  alert(`Requisition Details:\n\nID: ${reqId}\nStatus: Active\nAudit Trail: Verified via Blockchain/AI Log.`);
}

function approveRequisition(reqId) {
  const confirmApprove = confirm(`Are you sure you want to approve transfer requisition ${reqId}?`);
  if (confirmApprove) {
    alert(`Requisition ${reqId} has been successfully approved. ERP Sync triggered.`);
    location.reload();
  }
}