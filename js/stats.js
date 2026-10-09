// =====================================
// GateKeeper - Event Dashboard
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    initialise
);

async function initialise() {

    const eventId =
        localStorage.getItem("CurrentEventId");

    const eventName =
        localStorage.getItem("CurrentEventName");

    if (!eventId) {

        console.error("No current event selected.");

        document.getElementById("eventName").textContent =
            "No Event Selected";

        return;
    }

    console.log("Event ID:", eventId);
    console.log("Event Name:", eventName);

    document.getElementById("eventName").textContent =
        eventName || "Current Event";

    await updateDashboard();

    setInterval(
        updateDashboard,
        10000
    );
}

async function updateDashboard() {

    const eventId =
        localStorage.getItem("CurrentEventId");

    if (!eventId) {
        console.warn("No event selected.");
        return;
    }

    try {

        const stats =
            await GateKeeperAPI.getEventStats(eventId);

        console.log("Dashboard statistics:", stats);

        const total =
            Number(stats.Total || 0);

        const checkedIn =
            Number(stats.CheckedIn || 0);

        const checkedOut =
            Number(stats.CheckedOut || 0);

        const onSite =
            Number(stats.OnSite || 0);

        const onSiteUnder14 =
            Number(stats.OnSiteUnder14 || 0);

        const onSiteOver14 =
            Number(stats.OnSiteOver14 || 0);

        const notYetIn =
            Number(stats.NotYetIn || 0);

        const cancelled =
            Number(stats.Cancelled || 0);

        const scanned =
            checkedIn + checkedOut;

        // Attendance must compare people onsite with people expected,
        // not the number of ticket/pass records sold. A single pass can
        // represent more than one person (for example, trader/catering).
        const peopleExpected =
            Number(stats.PeopleExpected || stats.peopleExpected || total);

        let attendancePercent = 0;

        if (peopleExpected > 0) {
            attendancePercent =
                Math.round(
                    (onSite / peopleExpected) * 100
                );
        }

        // Keep the progress bar within its visual range.
        const attendanceBarPercent =
            Math.min(100, Math.max(0, attendancePercent));

        setValue("totalCount", total);
        setValue("onSiteCount", onSite);
        setValue("checkedInCount", checkedIn);
        setValue("checkedOutCount", checkedOut);
        setValue("notYetInCount", notYetIn);
        setValue("cancelledCount", cancelled);

        setValue(
            "onSiteUnder14Count",
            onSiteUnder14
        );

        setValue(
            "onSiteOver14Count",
            onSiteOver14
        );

        setValue(
            "attendancePercent",
            attendancePercent + "%"
        );

        const attendanceBar =
            document.getElementById("attendanceBar");

        if (attendanceBar) {

            attendanceBar.style.width =
                attendanceBarPercent + "%";
        }

        setValue("scannedCount", scanned);
        setValue("breakdownOnSite", onSite);
        setValue("breakdownLeft", checkedOut);

        const lastUpdated =
            document.getElementById("lastUpdated");

        if (lastUpdated) {

            lastUpdated.textContent =
                new Date().toLocaleTimeString();
        }

    }
    catch (err) {

        console.error(
            "Dashboard update failed:",
            err
        );
    }
}

function setValue(
    elementId,
    value
) {

    const element =
        document.getElementById(elementId);

    if (!element)
        return;

    element.textContent =
        value;
}
