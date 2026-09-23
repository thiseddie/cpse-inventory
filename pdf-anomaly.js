/* ==========================================================================
   PDF INGESTION & ANOMALY LOGIC - CPSE HARMONIZE AI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

function handleFileUpload(e) {
  if (e.target.files.length > 0) {
    parseSamplePDF('clean');
  }
}

function parseSamplePDF(type) {
  document.getElementById('pdfEmptyState').classList.add('hidden');
  document.getElementById('pdfAuditResult').classList.remove('hidden');
  document.getElementById('pdfAuditStatus').innerText = `Processed at ${new Date().toLocaleTimeString()}`;

  const riskBanner = document.getElementById('riskBanner');
  const riskTitle = document.getElementById('riskTitle');
  const riskDesc = document.getElementById('riskDesc');
  const riskIcon = document.getElementById('riskIcon');

  if (type === 'anomaly') {
    riskBanner.className = "risk-banner bg-amber-50 border-amber-300";
    riskTitle.className = "font-bold text-sm text-amber-900";
    riskTitle.innerText = "⚠️ Valuation Anomaly Flagged (+42% Variance)";
    riskDesc.className = "text-xs text-amber-800";
    riskDesc.innerText = "Unit cost is ₹8,500/m compared to standard GeM rate of ₹5,200/m. Flagged for finance review.";
    
    document.getElementById('docType').innerText = "Purchase Order";
    document.getElementById('docUnspsc').innerText = "26121603";
    document.getElementById('docVendor').innerText = "BHEL Haridwar Depot";
    document.getElementById('docPrice').innerText = "₹12,80,000";
    document.getElementById('docBench').innerText = "₹8,90,000";
    document.getElementById('docConfidence').innerText = "96.8%";
  } else {
    riskBanner.className = "risk-banner bg-emerald-50 border-emerald-200";
    riskTitle.className = "font-bold text-sm text-emerald-900";
    riskTitle.innerText = "✓ Zero Anomalies Detected";
    riskDesc.className = "text-xs text-emerald-700";
    riskDesc.innerText = "Document prices match historical GeM portal benchmarks and internal CPSE transfer ledgers.";
    
    document.getElementById('docType').innerText = "Tax Invoice";
    document.getElementById('docUnspsc').innerText = "40141607";
    document.getElementById('docVendor').innerText = "ONGC Hazira Depot";
    document.getElementById('docPrice').innerText = "₹5,55,000";
    document.getElementById('docBench').innerText = "₹5,40,000";
    document.getElementById('docConfidence').innerText = "99.1%";
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function pushToInventory() {
  alert("Extracted document metadata successfully synchronized with SAP ERP and added to Material Inventory!");
  window.location.href = "index.html";
}