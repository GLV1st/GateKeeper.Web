document.addEventListener("DOMContentLoaded", initialise);

async function initialise() {

    const eventName =
        localStorage.getItem("CurrentEventName");

    document.getElementById("eventName").textContent =
        eventName || "No Event Selected";

    try {

        await Scanner.start(ticketScanned);

        document.getElementById("scanStatus").innerHTML =
            "🟢 READY TO SCAN";

    }
    catch (err) {

        console.error(err);

        document.getElementById("scanStatus").innerHTML =
            "🔴 CAMERA FAILED";

    }

}

// =====================================
// Ticket Scanned
// =====================================

async function ticketScanned(ticketNumber) {

    console.log("Ticket:", ticketNumber);

    document.getElementById("scanStatus").innerHTML =
        "⏳ Checking Ticket...";

    try {

        const result =
            await GateKeeperAPI.checkIn(

                ticketNumber,

                localStorage.getItem("CurrentEventId")

            );

        if (result.success) {

            document.getElementById("scanStatus").innerHTML =
                "🟢 CHECKED IN";

            document.getElementById("ticketNumber").textContent =
                result.ticketNumber || ticketNumber;

            document.getElementById("ticketHolder").textContent =
                result.holder || "-";

            document.getElementById("ticketType").textContent =
                result.ticketType || "-";

            document.getElementById("ticketTime").textContent =
                new Date().toLocaleTimeString();

            if (result.checkedInToday !== undefined) {

                document.getElementById("checkedInCount").textContent =
                    result.checkedInToday;

            }

            if (result.currentlyOnSite !== undefined) {

                document.getElementById("onSiteCount").textContent =
                    result.currentlyOnSite;

            }

        }
        else {

            document.getElementById("scanStatus").innerHTML =
                "🔴 " + (result.message || "Ticket Rejected");

        }

    }
    catch (err) {

        console.error(err);

        document.getElementById("scanStatus").innerHTML =
            "🔴 API ERROR";

    }

    setTimeout(() => {

        document.getElementById("scanStatus").innerHTML =
            "🟢 READY TO SCAN";

    }, 1500);

}

window.addEventListener("beforeunload", async () => {

    await Scanner.stop();

});