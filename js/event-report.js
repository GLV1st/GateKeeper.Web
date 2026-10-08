let eventReport = null;

window.addEventListener("DOMContentLoaded", loadReport);

async function loadReport() {
    if (typeof checkAdminAuth === "function" && !checkAdminAuth()) {
        document.getElementById("status").textContent = "Admin authentication required.";
        document.getElementById("status").className = "status error";
        return;
    }

    const eventId = localStorage.getItem("CurrentEventId");
    const eventName = localStorage.getItem("CurrentEventName");

    if (!eventId) {
        showError("No event is currently selected.");
        return;
    }

    document.getElementById("eventName").textContent =
        eventName ? `${eventName} (${eventId})` : eventId;

    try {
        eventReport = await GateKeeperAPI.getEventReport(eventId);
        renderReport(eventReport);
        document.getElementById("downloadButton").disabled = false;
        showOk("Report data loaded successfully.");
    } catch (error) {
        console.error(error);
        showError(error.message || "Unable to load the event report.");
    }
}

function renderReport(report) {
    setText("ticketsSold", report.ticketsSold);
    setText("totalScans", report.totalScans);
    setText("totalIn", report.totalInScans);
    setText("totalOut", report.totalOutScans);
    setText("peakPeople", report.peakPeopleOnSite);
    setText("peakTime", formatDateTime(report.peakTime));
    setText("firstScan", formatTime(report.firstScan));
    setText("lastScan", formatTime(report.lastScan));

    if (report.busiestPeriod) {
        setText("busyPeriod", `${formatTime(report.busiestPeriod.start)}–${formatTime(report.busiestPeriod.end)}`);
        setText("busyPeriodCount", `${report.busiestPeriod.totalScans} scans (${report.busiestPeriod.in} IN / ${report.busiestPeriod.out} OUT)`);
    }

    renderTicketTypes(report.ticketTypes || []);
    renderPeriods(report.busiestPeriods || []);
    renderScanTypes(report.scanTypes || []);
}

function renderTicketTypes(rows) {
    const el = document.getElementById("ticketTypes");
    if (!rows.length) { el.innerHTML = '<div class="empty">No ticket sales found.</div>'; return; }

    el.innerHTML = `<table><thead><tr><th>Ticket Type</th><th class="num">Sold</th><th class="num">Scanned</th><th class="num">Not Scanned</th></tr></thead><tbody>${
        rows.map(r => `<tr><td>${escapeHtml(r.ticketType)}</td><td class="num">${r.sold}</td><td class="num">${r.scanned || 0}</td><td class="num">${Math.max(0, (r.sold || 0) - (r.scanned || 0))}</td></tr>`).join("")
    }</tbody></table>`;
}

function renderPeriods(rows) {
    const el = document.getElementById("busiestPeriods");
    if (!rows.length) { el.innerHTML = '<div class="empty">No scan history recorded for this event.</div>'; return; }

    const max = Math.max(...rows.map(r => r.totalScans), 1);
    el.innerHTML = rows.map(r => {
        const width = Math.round((r.totalScans / max) * 100);
        return `<div class="bar-row"><div>${formatTime(r.start)}–${formatTime(r.end)}</div><div class="bar"><div class="bar-fill" style="width:${width}%"></div></div><div class="num">${r.totalScans}</div></div>`;
    }).join("");
}

function renderScanTypes(rows) {
    const el = document.getElementById("scanTypes");
    if (!rows.length) { el.innerHTML = '<div class="empty">No scan history recorded for this event.</div>'; return; }
    el.innerHTML = `<table><thead><tr><th>Scan</th><th class="num">Count</th></tr></thead><tbody>${
        rows.map(r => `<tr><td>${escapeHtml(r.scanType)}</td><td class="num">${r.count}</td></tr>`).join("")
    }</tbody></table>`;
}

function downloadReport() {
    if (!eventReport) return;

    const rows = [];
    const add = (...values) => rows.push(values.map(csvEscape).join(","));

    add("GateKeeper End of Event Report");
    add("Event", eventReport.eventName);
    add("Event ID", eventReport.eventId);
    add("Event Date", eventReport.eventDate || "");
    add("");

    add("SUMMARY");
    add("Tickets / Passes Sold", eventReport.ticketsSold);
    add("Normal Tickets Sold", eventReport.normalTicketsSold);
    add("Trader Passes Sold", eventReport.traderPassesSold);
    add("Catering Passes Sold", eventReport.cateringPassesSold);
    add("Cancelled Tickets", eventReport.cancelledTickets);
    add("Total Scans", eventReport.totalScans);
    add("IN Scans", eventReport.totalInScans);
    add("OUT Scans", eventReport.totalOutScans);
    add("Peak People On Site", eventReport.peakPeopleOnSite);
    add("Peak Time", formatDateTime(eventReport.peakTime));
    add("Busiest Period", eventReport.busiestPeriod ? `${formatTime(eventReport.busiestPeriod.start)}-${formatTime(eventReport.busiestPeriod.end)}` : "");
    add("Busiest Period Scans", eventReport.busiestPeriod?.totalScans || 0);
    add("First Scan", formatDateTime(eventReport.firstScan));
    add("Last Scan", formatDateTime(eventReport.lastScan));
    add("");

    add("TICKETS SOLD BY TYPE");
    add("Ticket Type", "Sold", "Scanned", "Not Scanned");
    (eventReport.ticketTypes || []).forEach(r => add(r.ticketType, r.sold, r.scanned || 0, Math.max(0, (r.sold || 0) - (r.scanned || 0))));
    add("");

    add("SCAN ACTIVITY BY 15 MINUTES");
    add("Period", "IN", "OUT", "Total Scans");
    (eventReport.busiestPeriods || []).forEach(r => add(`${formatTime(r.start)}-${formatTime(r.end)}`, r.in, r.out, r.totalScans));
    add("");

    add("SCAN BREAKDOWN");
    add("Scan Type", "Count");
    (eventReport.scanTypes || []).forEach(r => add(r.scanType, r.count));

    const blob = new Blob(["\ufeff" + rows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (eventReport.eventName || eventReport.eventId || "Event").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    a.href = url;
    a.download = `${safeName}-Event-Report.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function csvEscape(value) {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
}

function formatTime(value) {
    if (!value) return "-";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(value) {
    if (!value) return "-";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

function setText(id, value) { document.getElementById(id).textContent = value ?? "-"; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
function showError(message) { const el = document.getElementById("status"); el.textContent = message; el.className = "status error"; }
function showOk(message) { const el = document.getElementById("status"); el.textContent = message; el.className = "status ok"; }
