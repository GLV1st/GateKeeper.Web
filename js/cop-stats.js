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

        const passesSold =
            Number(stats.Total || 0);

        const normalTickets =
            Number(stats.NormalTickets || 0);

        const traderPasses =
            Number(stats.TraderPasses || 0);

        const peopleExpected =
            Number(stats.PeopleExpected || 0);

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

        let attendancePercent = 0;

        if (peopleExpected > 0) {
            attendancePercent =
                Math.round(
                    (peopleOnSite / peopleExpected) * 100
                );
        }

        setValue("passesSoldCount", passesSold);
        setValue("peopleExpectedCount", peopleExpected);
        setValue("peopleOnSiteCount", peopleOnSite);
        setValue("traderPassesCount", traderPasses);
        setValue("normalTicketsCount", normalTickets);
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
