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
        document.getElementById("downloadCsvButton").disabled = false;
        showOk("Report data loaded successfully.");
    } catch (error) {
        console.error(error);
        showError(error.message || "Unable to load the event report.");
    }
}

function renderReport(report) {
    // The API may return either camelCase or PascalCase JSON depending on
    // the deployed Functions runtime/version. Support both so the report
    // cannot silently show dashes when the API actually returned data.
    const r = normaliseReport(report);

    setText("ticketsSold", r.ticketsSold);
    setText("totalScans", r.totalScans);
    setText("totalIn", r.totalInScans);
    setText("totalOut", r.totalOutScans);
    setText("peakPeople", r.peakPeopleOnSite);
    setText("peakTime", formatDateTime(r.peakTime));
    setText("firstScan", formatTime(r.firstScan));
    setText("lastScan", formatTime(r.lastScan));

    if (r.busiestPeriod) {
        setText("busyPeriod", `${formatTime(r.busiestPeriod.start)}–${formatTime(r.busiestPeriod.end)}`);
        setText("busyPeriodCount", `${r.busiestPeriod.totalScans} scans (${r.busiestPeriod.in} IN / ${r.busiestPeriod.out} OUT)`);
    } else {
        setText("busyPeriod", "-");
        setText("busyPeriodCount", "-");
    }

    renderTicketTypes(r.ticketTypes);
    renderPeriods(r.busiestPeriods);
    renderScanTypes(r.scanTypes);

    // Keep the normalised version for the CSV export.
    eventReport = r;
}

function normaliseReport(report) {
    const get = (camel, pascal, fallback = null) =>
        report?.[camel] !== undefined ? report[camel] :
        report?.[pascal] !== undefined ? report[pascal] : fallback;

    const normaliseRow = row => ({
        ticketType: getRow(row, "ticketType", "TicketType", ""),
        sold: Number(getRow(row, "sold", "Sold", 0)) || 0,
        scanned: Number(getRow(row, "scanned", "Scanned", 0)) || 0,
        in: Number(getRow(row, "in", "In", 0)) || 0,
        out: Number(getRow(row, "out", "Out", 0)) || 0
    });

    const normalisePeriod = row => ({
        start: getRow(row, "start", "Start", null),
        end: getRow(row, "end", "End", null),
        in: Number(getRow(row, "in", "In", 0)) || 0,
        out: Number(getRow(row, "out", "Out", 0)) || 0,
        totalScans: Number(getRow(row, "totalScans", "TotalScans", 0)) || 0
    });

    const normaliseScanType = row => ({
        scanType: getRow(row, "scanType", "ScanType", ""),
        count: Number(getRow(row, "count", "Count", 0)) || 0
    });

    return {
        eventId: get("eventId", "EventId", ""),
        eventName: get("eventName", "EventName", ""),
        eventDate: get("eventDate", "EventDate", ""),
        ticketsSold: Number(get("ticketsSold", "TicketsSold", 0)) || 0,
        normalTicketsSold: Number(get("normalTicketsSold", "NormalTicketsSold", 0)) || 0,
        traderPassesSold: Number(get("traderPassesSold", "TraderPassesSold", 0)) || 0,
        cateringPassesSold: Number(get("cateringPassesSold", "CateringPassesSold", 0)) || 0,
        cancelledTickets: Number(get("cancelledTickets", "CancelledTickets", 0)) || 0,
        totalScans: Number(get("totalScans", "TotalScans", 0)) || 0,
        totalInScans: Number(get("totalInScans", "TotalInScans", 0)) || 0,
        totalOutScans: Number(get("totalOutScans", "TotalOutScans", 0)) || 0,
        firstScan: get("firstScan", "FirstScan", null),
        lastScan: get("lastScan", "LastScan", null),
        peakPeopleOnSite: Number(get("peakPeopleOnSite", "PeakPeopleOnSite", 0)) || 0,
        peakTime: get("peakTime", "PeakTime", null),
        busiestPeriod: normalisePeriodOrNull(get("busiestPeriod", "BusiestPeriod", null)),
        ticketTypes: (get("ticketTypes", "TicketTypes", []) || []).map(normaliseRow),
        scanTypes: (get("scanTypes", "ScanTypes", []) || []).map(normaliseScanType),
        busiestPeriods: (get("busiestPeriods", "BusiestPeriods", []) || []).map(normalisePeriod)
    };
}

function normalisePeriodOrNull(row) {
    if (!row) return null;
    return {
        start: getRow(row, "start", "Start", null),
        end: getRow(row, "end", "End", null),
        in: Number(getRow(row, "in", "In", 0)) || 0,
        out: Number(getRow(row, "out", "Out", 0)) || 0,
        totalScans: Number(getRow(row, "totalScans", "TotalScans", 0)) || 0
    };
}

function getRow(row, camel, pascal, fallback = null) {
    if (row?.[camel] !== undefined) return row[camel];
    if (row?.[pascal] !== undefined) return row[pascal];
    return fallback;
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

    const r = eventReport;
    const periods = r.busiestPeriods || [];
    const width = 900, height = 340, left = 58, right = 24, top = 28, bottom = 76;
    const plotW = width - left - right, plotH = height - top - bottom;
    const max = Math.max(1, ...periods.map(p => Number(p.totalScans) || 0));
    const barGap = periods.length > 40 ? 2 : 5;
    const barW = periods.length ? Math.max(2, (plotW / periods.length) - barGap) : 0;
    const bars = periods.map((p, i) => {
        const value = Number(p.totalScans) || 0;
        const bh = (value / max) * plotH;
        const x = left + i * (plotW / Math.max(1, periods.length)) + barGap / 2;
        const y = top + plotH - bh;
        const label = `${formatTime(p.start)}–${formatTime(p.end)}`;
        const showLabel = periods.length <= 24 || i % Math.ceil(periods.length / 24) === 0;
        return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(0,bh).toFixed(1)}" rx="2" fill="#2878d7"><title>${escapeHtml(label)}: ${value} scans</title></rect>${showLabel ? `<text x="${(x+barW/2).toFixed(1)}" y="${height-bottom+18}" transform="rotate(-45 ${(x+barW/2).toFixed(1)} ${height-bottom+18})" font-size="10" text-anchor="end" fill="#42516a">${escapeHtml(formatTime(p.start))}</text>` : ""}`;
    }).join("");
    const grid = [0, .25, .5, .75, 1].map(f => {
        const y = top + plotH - plotH*f;
        return `<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}" stroke="#dce3ed"/><text x="${left-10}" y="${y+4}" text-anchor="end" font-size="11" fill="#42516a">${Math.round(max*f)}</text>`;
    }).join("");
    const chart = periods.length
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Scans per 15 minute period">${grid}<line x1="${left}" y1="${top+plotH}" x2="${width-right}" y2="${top+plotH}" stroke="#8795aa"/>${bars}<text x="${left}" y="15" font-size="12" fill="#42516a">Scans per 15-minute period</text></svg>`
        : '<p>No scan history recorded for this event.</p>';

    const ticketRows = (r.ticketTypes || []).map(t => `<tr><td>${escapeHtml(t.ticketType)}</td><td>${t.sold||0}</td><td>${t.scanned||0}</td><td>${Math.max(0,(t.sold||0)-(t.scanned||0))}</td><td>${t.in||0}</td><td>${t.out||0}</td></tr>`).join("");
    const periodRows = periods.map(p => `<tr><td>${escapeHtml(formatTime(p.start))}–${escapeHtml(formatTime(p.end))}</td><td>${p.in||0}</td><td>${p.out||0}</td><td>${p.totalScans||0}</td></tr>`).join("");
    const scanTypeRows = (r.scanTypes || []).map(t => `<tr><td>${escapeHtml(t.scanType)}</td><td>${t.count||0}</td></tr>`).join("");
    const safeName = (r.eventName || r.eventId || "Event").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(r.eventName || r.eventId)} - Event Report</title><style>
      body{font-family:Arial,sans-serif;color:#17243a;margin:28px;line-height:1.4}h1{margin-bottom:4px;color:#102b55}h2{margin-top:28px;border-bottom:2px solid #dce5f0;padding-bottom:7px}.muted{color:#64748b}.metrics{display:grid;grid-template-columns:repeat(4,minmax(130px,1fr));gap:12px;margin:22px 0}.metric{background:#f2f5f9;border-radius:9px;padding:14px}.metric span{display:block;color:#64748b;font-size:12px}.metric strong{font-size:22px}table{border-collapse:collapse;width:100%;margin:12px 0 24px;font-size:13px}th,td{padding:8px;border-bottom:1px solid #dce3ed;text-align:left}th{background:#edf2f8}svg{width:100%;height:auto;max-height:520px}.chart-wrap{border:1px solid #dce3ed;border-radius:10px;padding:12px;margin-top:12px}.print{margin-bottom:20px;padding:9px 14px;background:#2878d7;color:#fff;border:0;border-radius:6px;cursor:pointer}@media print{.print{display:none}body{margin:12mm}.metrics{grid-template-columns:repeat(4,1fr)}h2{break-after:avoid}.chart-wrap,table{break-inside:avoid}}@media(max-width:650px){.metrics{grid-template-columns:repeat(2,1fr)}}
      </style></head><body><button class="print" onclick="window.print()">Print / Save as PDF</button><h1>GateKeeper End of Event Report</h1><div class="muted">${escapeHtml(r.eventName || r.eventId)} (${escapeHtml(r.eventId)})${r.eventDate ? ` · ${escapeHtml(r.eventDate)}` : ""}</div>
      <h2>Event Summary</h2><div class="metrics">
      <div class="metric"><span>Tickets / Passes Sold</span><strong>${r.ticketsSold||0}</strong></div><div class="metric"><span>Total Scans</span><strong>${r.totalScans||0}</strong></div><div class="metric"><span>IN Scans</span><strong>${r.totalInScans||0}</strong></div><div class="metric"><span>OUT Scans</span><strong>${r.totalOutScans||0}</strong></div>
      <div class="metric"><span>Peak People On Site</span><strong>${r.peakPeopleOnSite||0}</strong><div>${escapeHtml(formatDateTime(r.peakTime))}</div></div><div class="metric"><span>Busiest 15 Minutes</span><strong>${r.busiestPeriod ? `${escapeHtml(formatTime(r.busiestPeriod.start))}–${escapeHtml(formatTime(r.busiestPeriod.end))}` : "-"}</strong><div>${r.busiestPeriod?.totalScans||0} scans</div></div><div class="metric"><span>First Scan</span><strong>${escapeHtml(formatTime(r.firstScan))}</strong></div><div class="metric"><span>Last Scan</span><strong>${escapeHtml(formatTime(r.lastScan))}</strong></div></div>
      <h2>Scan Activity Graph</h2><p class="muted">Each bar shows the total number of scans in a 15-minute period. Hover over a bar for its count.</p><div class="chart-wrap">${chart}</div>
      <h2>Tickets Sold by Type</h2><table><thead><tr><th>Ticket Type</th><th>Sold</th><th>Scanned</th><th>Not Scanned</th><th>IN</th><th>OUT</th></tr></thead><tbody>${ticketRows || '<tr><td colspan="6">No ticket sales found.</td></tr>'}</tbody></table>
      <h2>Scan Activity by 15 Minutes</h2><table><thead><tr><th>Period</th><th>IN</th><th>OUT</th><th>Total Scans</th></tr></thead><tbody>${periodRows || '<tr><td colspan="4">No scan history recorded for this event.</td></tr>'}</tbody></table>
      <h2>Scan Breakdown</h2><table><thead><tr><th>Scan Type</th><th>Count</th></tr></thead><tbody>${scanTypeRows || '<tr><td colspan="2">No scan history recorded for this event.</td></tr>'}</tbody></table>
      <p class="muted">Generated by GateKeeper · ${escapeHtml(new Date().toLocaleString())}</p></body></html>`;
    const blob = new Blob([html], {type:"text/html;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}-Event-Report.html`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function downloadCsvReport() {
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
