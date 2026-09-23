/* ==========================================================================
   QR SCANNER & INSPECTION LOGIC - CPSE HARMONIZE AI
   ========================================================================== */

let html5QrCode = null;
let isCameraRunning = false;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

/**
 * Toggle Camera Stream
 */
function toggleCamera() {
  const btn = document.getElementById('toggleCamBtn');
  
  if (!isCameraRunning) {
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        onScanSuccess(decodedText);
        toggleCamera(); // stop camera after successful scan
      },
      (errorMessage) => {
        // quiet fail on scanning frame errors
      }
    ).then(() => {
      isCameraRunning = true;
      btn.innerHTML = `<i data-lucide="video-off" class="w-4 h-4"></i> Stop Camera`;
      lucide.createIcons();
    }).catch(err => {
      alert("Camera access denied or unavailable. Please use Demo Preset or File Upload.");
    });
  } else {
    if (html5QrCode) {
      html5QrCode.stop().then(() => {
        isCameraRunning = false;
        btn.innerHTML = `<i data-lucide="video" class="w-4 h-4"></i> Start Camera Scan`;
        lucide.createIcons();
      });
    }
  }
}

/**
 * Demo Quick Preset Scanner
 */
function demoQuickScan(presetCode) {
  onScanSuccess(presetCode);
}

/**
 * Manual Asset ID Fetch
 */
function lookupManualId() {
  const val = document.getElementById('manualAssetId').value.trim();
  if (!val) {
    alert("Please enter a valid Asset ID");
    return;
  }
  onScanSuccess(val);
}

/**
 * File Upload QR Scan
 */
function scanFromFile(e) {
  if (e.target.files.length === 0) return;
  const file = e.target.files[0];
  const html5QrCodeFile = new Html5Qrcode("reader");
  
  html5QrCodeFile.scanFile(file, true)
    .then(decodedText => {
      onScanSuccess(decodedText);
    })
    .catch(err => {
      // Fallback demo load on file upload test
      onScanSuccess("VALVE-SS316-ONGC");
    });
}

/**
 * Render Scanned Asset Audit Result
 */
function onScanSuccess(code) {
  document.getElementById('emptyState').classList.add('hidden');
  document.getElementById('assetResult').classList.remove('hidden');
  document.getElementById('scanTimestamp').innerText = `Verified: ${new Date().toLocaleTimeString()}`;

  // Mock Asset Payload (In production linked to SAP/Oracle ERP Endpoint)
  const mockAsset = {
    title: "Flanged Ball Valve 100mm SS316",
    category: "Valves & Fittings",
    unspsc: "UNSPSC: 40141607",
    price: "₹1,68,000",
    depot: "ONGC Hazira Plant, Gujarat (Bay 4-B)",
    stock: "14 Units",
    condition: "Unused / Surplus",
    health: "Grade A (Certified)",
    erpRef: `SAP-${code.toUpperCase().substring(0, 8)}`,
    year: "2024 Q3",
    co2: "-1.2 Tons CO₂"
  };

  document.getElementById('resTitle').innerText = mockAsset.title;
  document.getElementById('resCategory').innerText = mockAsset.category;
  document.getElementById('resUnspsc').innerText = mockAsset.unspsc;
  document.getElementById('resPrice').innerText = mockAsset.price;
  document.getElementById('resDepot').innerText = `Location: ${mockAsset.depot}`;
  document.getElementById('resStock').innerText = mockAsset.stock;
  document.getElementById('resCondition').innerText = mockAsset.condition;
  document.getElementById('resHealth').innerText = mockAsset.health;
  document.getElementById('resErpRef').innerText = mockAsset.erpRef;
  document.getElementById('resYear').innerText = mockAsset.year;
  document.getElementById('resCo2').innerText = mockAsset.co2;

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Redirect/Trigger Transfer
 */
function triggerTransferFromQR() {
  alert("Initiating Inter-CPSE Requisition in Requisitions Module...");
  window.location.href = "requisitions.html";
}

function printAssetTag() {
  window.print();
}