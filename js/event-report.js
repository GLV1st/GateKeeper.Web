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
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showError("PDF generator did not load. Please refresh the page and try again.");
        return;
    }

    const r = eventReport;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const safeName = (r.eventName || r.eventId || "Event").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    let y = 14;

    function heading(title) {
        if (y > pageH - 24) { pdf.addPage(); y = 14; }
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(15); pdf.setTextColor(16, 43, 85);
        pdf.text(title, margin, y); y += 8;
        pdf.setDrawColor(220, 229, 240); pdf.line(margin, y - 3, pageW - margin, y - 3);
    }
    function ensureSpace(required = 10) {
        if (y + required > pageH - margin) { pdf.addPage(); y = 14; }
    }
    function drawTable(headers, rows, widths) {
        const rowH = 7;
        const x0 = margin;
        ensureSpace(12);
        pdf.setFontSize(8); pdf.setFont("helvetica", "bold");
        pdf.setFillColor(237, 242, 248); pdf.rect(x0, y - 4.5, widths.reduce((a,b)=>a+b,0), rowH, "F");
        let x = x0;
        headers.forEach((h, i) => { pdf.text(String(h), x + 2, y); x += widths[i]; });
        y += 5;
        pdf.setFont("helvetica", "normal");
        rows.forEach(row => {
            if (y + rowH > pageH - margin) { pdf.addPage(); y = 14; }
            x = x0;
            row.forEach((cell, i) => {
                const text = pdf.splitTextToSize(String(cell ?? ""), widths[i] - 4)[0] || "";
                pdf.text(text, x + 2, y);
                x += widths[i];
            });
            pdf.setDrawColor(225, 231, 239); pdf.line(x0, y + 2, x0 + widths.reduce((a,b)=>a+b,0), y + 2);
            y += rowH;
        });
        y += 5;
    }

    pdf.setFont("helvetica", "bold"); pdf.setFontSize(21); pdf.setTextColor(16, 43, 85);
    pdf.text("GateKeeper End of Event Report", margin, y); y += 8;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(80, 95, 115);
    pdf.text(`${r.eventName || r.eventId} (${r.eventId})${r.eventDate ? " | " + r.eventDate : ""}`, margin, y); y += 10;

    heading("Event Summary");
    const metrics = [
        ["Tickets / Passes Sold", r.ticketsSold ?? 0], ["Total Scans", r.totalScans ?? 0],
        ["IN Scans", r.totalInScans ?? 0], ["OUT Scans", r.totalOutScans ?? 0],
        ["Peak People On Site", `${r.peakPeopleOnSite ?? 0}${r.peakTime ? " at " + formatDateTime(r.peakTime) : ""}`],
        ["Busiest 15 Minutes", r.busiestPeriod ? `${formatTime(r.busiestPeriod.start)}-${formatTime(r.busiestPeriod.end)} (${r.busiestPeriod.totalScans || 0} scans)` : "-"],
        ["First Scan", formatDateTime(r.firstScan)], ["Last Scan", formatDateTime(r.lastScan)]
    ];
    const boxGap = 3, boxW = (pageW - margin * 2 - boxGap * 3) / 4, boxH = 17;
    metrics.forEach((m, i) => {
        const row = Math.floor(i / 4), col = i % 4;
        const x = margin + col * (boxW + boxGap), yy = y + row * (boxH + 3);
        pdf.setFillColor(242, 245, 249); pdf.roundedRect(x, yy - 4, boxW, boxH, 2, 2, "F");
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(90, 105, 125); pdf.text(String(m[0]), x + 3, yy + 1);
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(23, 36, 58);
        pdf.text(pdf.splitTextToSize(String(m[1] ?? "-"), boxW - 6)[0], x + 3, yy + 8);
    });
    y += boxH * 2 + 10;

    heading("Scan Activity Graph - Scans per 15-Minute Period");
    const periods = r.busiestPeriods || [];
    const chartX = margin + 8, chartY = y + 3, chartW = pageW - margin * 2 - 16, chartH = 48;
    if (periods.length) {
        const max = Math.max(1, ...periods.map(p => Number(p.totalScans) || 0));
        pdf.setDrawColor(210, 220, 232); pdf.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);
        const slotW = chartW / periods.length;
        periods.forEach((p, i) => {
            const value = Number(p.totalScans) || 0;
            const barH = (value / max) * (chartH - 5);
            const bx = chartX + i * slotW + Math.max(0.4, slotW * 0.12);
            const bw = Math.max(0.8, slotW * 0.76);
            pdf.setFillColor(40, 120, 215); pdf.rect(bx, chartY + chartH - barH, bw, barH, "F");
            if (periods.length <= 18 || i % Math.ceil(periods.length / 18) === 0) {
                pdf.setFont("helvetica", "normal"); pdf.setFontSize(6); pdf.setTextColor(66, 81, 106);
                pdf.text(formatTime(p.start), bx + bw / 2, chartY + chartH + 5, { angle: 45, align: "right" });
            }
        });
        y = chartY + chartH + 15;
    } else {
        pdf.setFontSize(10); pdf.setTextColor(100, 116, 139); pdf.text("No scan history recorded for this event.", chartX, chartY + 8); y = chartY + 18;
    }

    heading("Tickets Sold by Type");
    drawTable(["Ticket Type", "Sold", "Scanned", "Not Scanned", "IN", "OUT"],
        (r.ticketTypes || []).map(t => [t.ticketType, t.sold || 0, t.scanned || 0, Math.max(0, (t.sold || 0) - (t.scanned || 0)), t.in || 0, t.out || 0]),
        [75, 25, 28, 32, 20, 20]);

    heading("Scan Activity by 15 Minutes");
    drawTable(["Period", "IN", "OUT", "Total Scans"],
        periods.map(p => [`${formatTime(p.start)}-${formatTime(p.end)}`, p.in || 0, p.out || 0, p.totalScans || 0]),
        [85, 30, 30, 35]);

    heading("Scan Breakdown by Type");
    drawTable(["Scan Type", "Count"], (r.scanTypes || []).map(t => [t.scanType, t.count || 0]), [100, 35]);

    const pages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        pdf.setPage(i); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(120, 130, 145);
        pdf.text(`Generated by GateKeeper | ${new Date().toLocaleString()} | Page ${i} of ${pages}`, margin, pageH - 5);
    }
    pdf.save(`${safeName}-Event-Report.pdf`);
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
