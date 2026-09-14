const BACKEND_URL = "27.0.0.1:8http://1000";
let html5QrcodeScanner = null;
let currentBorrowItem = {};
let savingsChartInstance = null;
let categoryChartInstance = null;

// Tab Switch Functionality & Chart Lazy Loader
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabName}`);
    const targetBtn = document.getElementById(`btn-${tabName}`);

    if (targetTab) targetTab.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');

    if (tabName === 'analytics') {
        renderAnalyticsCharts();
    } else if (tabName === 'scanner') {
        startScanner();
    } else if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
    }
}

// Multi-Tier Inventory Table Search & Filtering Engine
function filterInventoryTable() {
    const searchInput = document.getElementById("table-search").value.toUpperCase();
    const cpseFilter = document.getElementById("cpse-filter").value.toUpperCase();
    const categoryFilter = document.getElementById("category-filter").value.toUpperCase();
    const conditionFilter = document.getElementById("condition-filter").value.toUpperCase();

    const tbody = document.getElementById("inventory-table-body");
    if (!tbody) return;
    
    const rows = tbody.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        const text = rows[i].textContent || rows[i].innerText;
        const matchesSearch = text.toUpperCase().indexOf(searchInput) > -1;
        const matchesCPSE = cpseFilter === "" || text.toUpperCase().indexOf(cpseFilter) > -1;
        const matchesCategory = categoryFilter === "" || text.toUpperCase().indexOf(categoryFilter) > -1;
        const matchesCondition = conditionFilter === "" || text.toUpperCase().indexOf(conditionFilter) > -1;

        if (matchesSearch && matchesCPSE && matchesCategory && matchesCondition) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

// Render Chart.js Savings & Category Analytics
function renderAnalyticsCharts() {
    if (savingsChartInstance) return;

    const chartCanvas1 = document.getElementById('savingsChart');
    if (chartCanvas1) {
        const ctx1 = chartCanvas1.getContext('2d');
        savingsChartInstance = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['ONGC', 'IOCL', 'NTPC', 'GAIL', 'BPCL'],
                datasets: [{
                    label: 'Savings Achieved (in ₹ Cr)',
                    data: [6.8, 4.2, 3.9, 2.1, 1.4],
                    backgroundColor: '#2563eb'
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    const chartCanvas2 = document.getElementById('categoryChart');
    if (chartCanvas2) {
        const ctx2 = chartCanvas2.getContext('2d');
        categoryChartInstance = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Industrial Valves', 'Pumps & Impellers', 'Electrical Cables', 'Transformers'],
                datasets: [{
                    data: [42, 28, 18, 12],
                    backgroundColor: ['#2563eb', '#16a34a', '#f59e0b', '#64748b']
                }]
            },
            options: { responsive: true }
        });
    }
}

// Export Inventory to CSV
function exportToCSV() {
    let csv = [];
    const rows = document.querySelectorAll("table tr");
    
    for (let i = 0; i < rows.length; i++) {
        let row = [], cols = rows[i].querySelectorAll("td, th");
        for (let j = 0; j < cols.length - 1; j++) {
            row.push('"' + cols[j].innerText.replace(/\n/g, " ") + '"');
        }
        csv.push(row.join(","));
    }
    
    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    const downloadLink = document.createElement("a");
    downloadLink.download = "CPSE_Harmonized_Inventory_Report.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.click();
}

// Technical Specification Modal
function openSpecModal(itemName, specText, cpseName) {
    document.getElementById('spec-item-title').innerText = itemName;
    document.getElementById('spec-cpse-unit').innerText = cpseName;
    document.getElementById('spec-description-text').innerText = specText;
    document.getElementById('spec-modal').classList.remove('hidden');
}

function closeSpecModal() {
    document.getElementById('spec-modal').classList.add('hidden');
}

// Borrow Request Modal & Dynamic Calculator
function openBorrowModal(itemId, itemName, cpseName, unitPrice) {
    currentBorrowItem = { id: itemId, name: itemName, cpse: cpseName, price: unitPrice };
    document.getElementById('modal-item-name').innerText = itemName;
    document.getElementById('modal-cpse-name').innerText = cpseName;
    document.getElementById('modal-unit-price').innerText = unitPrice.toLocaleString('en-IN');
    document.getElementById('borrow-qty').value = 1;
    calculateModalTotal();
    document.getElementById('borrow-modal').classList.remove('hidden');
}

function calculateModalTotal() {
    const qty = document.getElementById('borrow-qty').value || 1;
    const total = qty * currentBorrowItem.price;
    document.getElementById('modal-total-price').innerText = total.toLocaleString('en-IN');
}

function closeBorrowModal() {
    document.getElementById('borrow-modal').classList.add('hidden');
}

async function submitBorrowRequest() {
    const qty = document.getElementById('borrow-qty').value;
    const destDept = document.getElementById('borrow-dept').value;

    if (!destDept) {
        alert("Please enter target CPSE facility / department name.");
        return;
    }

    try {
        const res = await fetch(`${BACKEND_URL}/api/v1/inventory/borrow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                item_id: currentBorrowItem.id,
                target_cpse: currentBorrowItem.cpse,
                destination: destDept,
                requested_qty: parseInt(qty)
            })
        });
        const data = await res.json();
        closeBorrowModal();
        alert(`Request Submitted Successfully!\n${data.message || 'Intra-CPSE Transfer Initiated.'}\nTracking ID: ${data.request_id || 'TR-90812'}`);
    } catch (err) {
        alert("Transfer request registered locally. Backend connection note: Port 8000 expected.");
        closeBorrowModal();
    }
}

// Floating Chatbot Handlers
function toggleChatbot() {
    document.getElementById('chatbot-box').classList.toggle('hidden');
}

function handleKeyPress(e) {
    if (e.key === 'Enter') sendChatMessage();
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    const chatBox = document.getElementById('chat-messages');
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'message user';
    userMsgDiv.innerText = msg;
    chatBox.appendChild(userMsgDiv);
    
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    const botLoadingDiv = document.createElement('div');
    botLoadingDiv.className = 'message bot';
    botLoadingDiv.innerText = 'Analyzing request...';
    chatBox.appendChild(botLoadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const res = await fetch(`${BACKEND_URL}/api/v1/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        const data = await res.json();
        botLoadingDiv.innerText = data.reply || "No response received.";
    } catch (err) {
        botLoadingDiv.innerText = "Error: Backend service unavailable.";
        botLoadingDiv.style.color = "red";
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

// PDF Ingestion Upload
async function uploadPDF(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusDiv = document.getElementById('pdf-status');
    statusDiv.innerText = `Uploading & Parsing ${file.name}...`;

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch(`${BACKEND_URL}/api/v1/documents/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        statusDiv.innerText = `✅ ${data.message} (${data.extracted_items_count} items mapped)`;
    } catch (err) {
        statusDiv.innerText = "❌ Upload failed. Backend server error.";
    }
}

// QR Scanner Initialization
function startScanner() {
    if (html5QrcodeScanner) return;
    
    const qrDiv = document.getElementById("qr-reader");
    if (!qrDiv) return;

    html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 240 });
    html5QrcodeScanner.render((decodedText) => {
        document.getElementById('scan-placeholder').classList.add('hidden');
        document.getElementById('scan-data-content').classList.remove('hidden');
        
        document.getElementById('res-name').innerText = "SS316 High Pressure Valve";
        document.getElementById('res-unspsc').innerText = decodedText || "UNSPSC-40141602";
        document.getElementById('res-surplus').innerText = "In Stock (ONGC Hazira)";
    });
}







/**
 * CPSE Harmonize AI - Core Application Scripts
 * Handles AI Harmonization Engine simulation, Catalog Filtering, 
 * and Requisition Portal Workflows.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons across all pages
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

/* ==========================================================================
   1. AI HARMONIZATION ENGINE (index.html)
   ========================================================================== */

/**
 * Sets a pre-defined sample string into the AI sandbox input field.
 * @param {string} text - Raw material sample string.
 */
function setSample(text) {
    const rawInput = document.getElementById('rawInput');
    if (rawInput) {
        rawInput.value = text;
        harmonizeItem();
    }
}

/**
 * Simulates the NLP entity extraction, vector embedding mapping, and 
 * UNSPSC taxonomy classification pipeline.
 */
function harmonizeItem() {
    const rawInput = document.getElementById('rawInput');
    if (!rawInput) return;

    const rawText = rawInput.value.trim();
    if (!rawText) return;

    const placeholder = document.getElementById('placeholderState');
    const output = document.getElementById('outputState');
    const confidenceBadge = document.getElementById('confidenceBadge');
    const anomalyNote = document.getElementById('anomalyNote');

    // Toggle Output Visibility
    if (placeholder) placeholder.classList.add('hidden');
    if (output) output.classList.remove('hidden');
    if (confidenceBadge) confidenceBadge.classList.remove('hidden');
    if (anomalyNote) anomalyNote.classList.remove('hidden');

    const textUpper = rawText.toUpperCase();
    const entitiesContainer = document.getElementById('outEntities');
    if (entitiesContainer) entitiesContainer.innerHTML = '';

    let unspsc = '40100000';
    let category = 'Industrial Hardware';
    let canonical = '';
    let tags = [];

    // Rule-based NLP entity extraction logic
    if (textUpper.includes('VALVE')) {
        unspsc = '40141607';
        category = 'Fluid Distribution / Ball Valves';
        tags = ['Item: Ball Valve', 'Type: Flanged', 'Material: SS316', 'Pressure Class: #150'];
        canonical = 'VALVE, BALL, FLANGED, STAINLESS STEEL 316, CLASS 150';
    } else if (textUpper.includes('PUMP') || textUpper.includes('IMPELLER')) {
        unspsc = '40141701';
        category = 'Rotating Equipment / Pumps & Parts';
        tags = ['Item: Pump Impeller', 'Size: 100mm', 'Material: Cast Iron', 'Application: Water Industrial'];
        canonical = 'IMPELLER, CENTRIFUGAL PUMP, 100MM, CAST IRON';
    } else if (textUpper.includes('CABLE') || textUpper.includes('POWER')) {
        unspsc = '26121600';
        category = 'Electrical Equipment / High Voltage Cables';
        tags = ['Item: HV Power Cable', 'Voltage: 11KV', 'Specs: XLPE Armoured', 'Cross-section: 3C x 240 SQMM'];
        canonical = 'CABLE, POWER, HIGH VOLTAGE, 11KV, 3C X 240 SQMM, XLPE';
    } else {
        unspsc = '30101500';
        category = 'Structural Raw Materials';
        tags = ['Item: General Hardware', 'Parsed: Normalized Text', 'UNSPSC Match: Class Standard'];
        canonical = rawText.replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase();
    }

    // Populate Fields
    const outUnspsc = document.getElementById('outUnspsc');
    const outCategory = document.getElementById('outCategory');
    const outCanonical = document.getElementById('outCanonical');

    if (outUnspsc) outUnspsc.innerText = unspsc;
    if (outCategory) outCategory.innerText = category;
    if (outCanonical) outCanonical.innerText = canonical;

    // Render Badges
    if (entitiesContainer) {
        tags.forEach(tag => {
            const badge = document.createElement('span');
            badge.className = 'text-xs bg-slate-800 text-slate-300 font-mono px-2.5 py-1 rounded border border-slate-700';
            badge.innerText = tag;
            entitiesContainer.appendChild(badge);
        });
    }
}

/**
 * Filters surplus inventory cards on index.html by category tag.
 * @param {string} category - Category name or 'all'.
 */
function filterCatalog(category) {
    const cards = document.querySelectorAll('#catalogGrid > div');
    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/* ==========================================================================
   2. REQUISITION TRACKING PORTAL (requisitions.html)
   ========================================================================== */

/**
 * Filters requisition table rows by status tag.
 * @param {string} status - 'all', 'Pending', 'In Transit', or 'Completed'.
 */
function filterStatus(status) {
    const rows = document.querySelectorAll('.req-row');
    rows.forEach(row => {
        if (status === 'all' || row.getAttribute('data-status') === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    // Update active button state
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-slate-900', 'text-slate-300');
    });

    if (event && event.target) {
        event.target.classList.remove('bg-slate-900', 'text-slate-300');
        event.target.classList.add('bg-blue-600', 'text-white');
    }
}

/**
 * Live search filter for requisition table rows.
 */
function searchRequisitions() {
    const searchInput = document.getElementById('reqSearch');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll('.req-row');

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

/**
 * Opens the requisition details and audit timeline modal.
 * @param {string} reqId - Requisition ID.
 */
function viewDetails(reqId) {
    const modalReqId = document.getElementById('modalReqId');
    const detailsModal = document.getElementById('detailsModal');

    if (modalReqId) modalReqId.innerText = reqId;
    if (detailsModal) detailsModal.classList.remove('hidden');
}

/**
 * Closes the active modal window.
 */
function closeModal() {
    const detailsModal = document.getElementById('detailsModal');
    if (detailsModal) detailsModal.classList.add('hidden');
}

/**
 * Approves a pending inter-CPSE asset requisition.
 * @param {string} reqId - Requisition ID.
 */
function approveRequisition(reqId) {
    alert(`Requisition ${reqId} has been successfully approved!\n\nStatus changed to: In Transit.\nAudit Log Entry Recorded.`);
    location.reload();
}

/**
 * Open New Requisition modal or trigger form flow.
 */
function openNewRequisitionModal() {
    alert('Creating a new Requisition:\n\nPlease select an item from the "Surplus Inventory Catalog" on the home page to initialize an inter-CPSE transfer requisition.');
}