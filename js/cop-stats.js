// =====================================
// GateKeeper - COP Carnival Dashboard
// =====================================

document.addEventListener("DOMContentLoaded", initialise);

async function initialise() {

    const eventId =
        localStorage.getItem("CurrentEventId");

    const eventName =
        localStorage.getItem("CurrentEventName");

    if (!eventId) {
        document.getElementById("eventName").textContent =
            "No Event Selected";
        return;
    }

    // This page is specifically for COP Carnival.
    // If it is opened directly for another event, return to
    // the normal dashboard rather than showing the wrong statistics.
    if (eventId !== "COP-CARN") {
        window.location.replace("stats.html");
        return;
    }

    document.getElementById("eventName").textContent =
        eventName || "COP Carnival";

    await updateDashboard();

    setInterval(updateDashboard, 10000);
}

async function updateDashboard() {

    const eventId =
        localStorage.getItem("CurrentEventId");

    if (!eventId) return;

    try {

        const stats =
            await GateKeeperAPI.getEventStats(eventId);

        const normalTickets =
            Number(stats.NormalTickets || 0);

        const traderPasses =
            Number(stats.TraderPasses || 0);

        const peopleExpected =
            Number(stats.PeopleExpected || 0);

        // The API's PeopleExpected is the combined normal-ticket
        // people plus trader people. COP-CARN admission is 1 person
        // per normal ticket, so the trader people figure is derived.
        const traderPeopleExpected =
            Math.max(0, peopleExpected - normalTickets);

        const peopleCheckedIn =
            Number(stats.PeopleCheckedIn || 0);

        const peopleCheckedOut =
            Number(stats.PeopleCheckedOut || 0);

        const peopleOnSite =
            Number(stats.PeopleOnSite || 0);

        const peopleNotYetIn =
            Number(stats.PeopleNotYetIn || 0);

        const cancelled =
            Number(stats.Cancelled || 0);

        const onsiteUnder14 =
            Number(stats.OnSiteUnder14 || 0);

        const onsiteOver14 =
            Number(stats.OnSiteOver14 || 0);

        // OnSite is the combined number of normal attendees and trader
        // people currently at the event. The normal attendee breakdown
        // is supplied by the API, so the trader portion can be derived.
        const onsiteTraders =
            Math.max(0, peopleOnSite - onsiteUnder14 - onsiteOver14);

        let attendancePercent = 0;

        if (peopleExpected > 0) {
            attendancePercent =
                Math.round(
                    (peopleOnSite / peopleExpected) * 100
                );
        }

        setValue("normalTicketsCount", normalTickets);
        setValue("peopleExpectedNormalCount", normalTickets);
        setValue("traderPassesCount", traderPasses);
        setValue("traderPeopleExpectedCount", traderPeopleExpected);
        setValue("peopleOnSiteCount", peopleOnSite);
        setValue("onsiteUnder14Count", onsiteUnder14);
        setValue("onsiteOver14Count", onsiteOver14);
        setValue("onsiteTradersCount", onsiteTraders);
        setValue("peopleCheckedInCount", peopleCheckedIn);
        setValue("peopleCheckedOutCount", peopleCheckedOut);
        setValue("peopleNotYetInCount", peopleNotYetIn);
        setValue("cancelledCount", cancelled);

        setValue("attendancePercent", attendancePercent + "%");

        const attendanceBar =
            document.getElementById("attendanceBar");

        if (attendanceBar) {
            attendanceBar.style.width =
                attendancePercent + "%";
        }

        setValue("breakdownCheckedIn", peopleCheckedIn);
        setValue("breakdownOnSite", peopleOnSite);
        setValue("breakdownLeft", peopleCheckedOut);

        const lastUpdated =
            document.getElementById("lastUpdated");

        if (lastUpdated) {
            lastUpdated.textContent =
                new Date().toLocaleTimeString();
        }

    }
    catch (err) {

        console.error(
            "COP Carnival dashboard update failed:",
            err
        );

    }
}

function setValue(elementId, value) {

    const element =
        document.getElementById(elementId);

    if (!element) return;

    element.textContent = value;
}
