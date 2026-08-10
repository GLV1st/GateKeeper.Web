// =====================================
// GateKeeper - Event Dashboard
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    initialise
);


// =====================================
// INITIALISE
// =====================================

async function initialise() {

    console.log(
        "================================="
    );

    console.log(
        "GateKeeper Event Dashboard"
    );

    console.log(
        "================================="
    );


    const eventId =
        localStorage.getItem(
            "CurrentEventId"
        );


    const eventName =
        localStorage.getItem(
            "CurrentEventName"
        );


    // =================================
    // CHECK EVENT
    // =================================

    if (!eventId) {

        console.error(
            "No current event selected."
        );


        document.getElementById(
            "eventName"
        ).textContent =
            "No Event Selected";


        return;

    }


    console.log(
        "Event ID:",
        eventId
    );


    console.log(
        "Event Name:",
        eventName
    );


    // =================================
    // DISPLAY EVENT
    // =================================

    document.getElementById(
        "eventName"
    ).textContent =
        eventName || "Current Event";


    // =================================
    // LOAD STATS
    // =================================

    await updateDashboard();


    // =================================
    // AUTO REFRESH
    // =================================

    setInterval(
        updateDashboard,
        10000
    );

}


// =====================================
// UPDATE DASHBOARD
// =====================================

async function updateDashboard() {

    const eventId =
        localStorage.getItem(
            "CurrentEventId"
        );


    if (!eventId) {

        console.warn(
            "No event selected."
        );

        return;

    }


    try {

        console.log(
            "Loading event statistics..."
        );


        const stats =
            await GateKeeperAPI.getEventStats(
                eventId
            );


        console.log(
            "Dashboard statistics:",
            stats
        );


        // =================================
        // VALUES
        // =================================

        const total =
            Number(stats.Total || 0);


        const checkedIn =
            Number(stats.CheckedIn || 0);


        const checkedOut =
            Number(stats.CheckedOut || 0);


        const onSite =
            Number(stats.OnSite || 0);


        const notYetIn =
            Number(stats.NotYetIn || 0);


        const cancelled =
            Number(stats.Cancelled || 0);


        // =================================
        // TOTAL SCANNED
        // =================================

        const scanned =
            checkedIn +
            checkedOut;


        // =================================
        // ATTENDANCE %
        // =================================

        let attendancePercent = 0;


        if (total > 0) {

            attendancePercent =
                Math.round(
                    (onSite / total) * 100
                );

        }


        // =================================
        // UPDATE MAIN CARDS
        // =================================

        setValue(
            "totalCount",
            total
        );


        setValue(
            "onSiteCount",
            onSite
        );


        setValue(
            "checkedInCount",
            checkedIn
        );


        setValue(
            "checkedOutCount",
            checkedOut
        );


        setValue(
            "notYetInCount",
            notYetIn
        );


        setValue(
            "cancelledCount",
            cancelled
        );


        // =================================
        // ATTENDANCE
        // =================================

        setValue(
            "attendancePercent",
            attendancePercent + "%"
        );


        const attendanceBar =
            document.getElementById(
                "attendanceBar"
            );


        if (attendanceBar) {

            attendanceBar.style.width =
                attendancePercent + "%";

        }


        // =================================
        // BREAKDOWN
        // =================================

        setValue(
            "scannedCount",
            scanned
        );


        setValue(
            "breakdownOnSite",
            onSite
        );


        setValue(
            "breakdownLeft",
            checkedOut
        );


        // =================================
        // LAST UPDATED
        // =================================

        const lastUpdated =
            document.getElementById(
                "lastUpdated"
            );


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


// =====================================
// SET VALUE
// =====================================

function setValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element)
        return;


    element.textContent =
        value;

}