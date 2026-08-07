document.addEventListener("DOMContentLoaded", initialise);


// =====================================
// INITIALISE
// =====================================

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

        console.error("Camera error:", err);

        document.getElementById("scanStatus").innerHTML =
            "🔴 CAMERA FAILED";

    }

}


// =====================================
// TICKET SCANNED
// =====================================

async function ticketScanned(ticketNumber) {

    console.log("Ticket:", ticketNumber);

    const status =
        document.getElementById("scanStatus");

    status.innerHTML =
        "⏳ CHECKING TICKET...";


    const eventId =
        localStorage.getItem("CurrentEventId");


    // =====================================
    // Check Event Selected
    // =====================================

    if (!eventId) {

        status.innerHTML =
            "🔴 NO EVENT SELECTED";

        console.error(
            "CurrentEventId is missing"
        );

        return;

    }


    try {

        console.log("Sending check-in request:", {

            eventId: eventId,

            ticketNumber: ticketNumber

        });


        const result =
            await GateKeeperAPI.checkIn(

                ticketNumber,

                eventId

            );


        console.log(
            "Check-in response:",
            result
        );


        // =====================================
        // API RESPONSE
        // =====================================

        switch (result.Status) {


            // =================================
            // SUCCESS
            // =================================

            case "SUCCESS":

                status.innerHTML =
                    "🟢 " +
                    (result.Message || "WELCOME!");

                document.getElementById(
                    "ticketNumber"
                ).textContent =
                    result.TicketNumber || ticketNumber;

                document.getElementById(
                    "ticketHolder"
                ).textContent =
                    result.CustomerName || "-";

                document.getElementById(
                    "ticketType"
                ).textContent =
                    result.TicketType || "-";

                document.getElementById(
                    "ticketTime"
                ).textContent =
                    new Date().toLocaleTimeString();

                break;


            // =================================
            // ALREADY CHECKED IN
            // =================================

            case "ALREADY_CHECKED_IN":

                status.innerHTML =
                    "🟠 " +
                    (result.Message ||
                     "ALREADY CHECKED IN");

                document.getElementById(
                    "ticketNumber"
                ).textContent =
                    result.TicketNumber || ticketNumber;

                document.getElementById(
                    "ticketHolder"
                ).textContent =
                    result.CustomerName || "-";

                document.getElementById(
                    "ticketType"
                ).textContent =
                    result.TicketType || "-";

                break;


            // =================================
            // CANCELLED
            // =================================

            case "CANCELLED":

                status.innerHTML =
                    "🔴 " +
                    (result.Message ||
                     "TICKET CANCELLED");

                break;


            // =================================
            // NOT FOUND
            // =================================

            case "NOT_FOUND":

                status.innerHTML =
                    "🔴 " +
                    (result.Message ||
                     "TICKET NOT FOUND");

                break;


            // =================================
            // ERROR
            // =================================

            case "ERROR":

                status.innerHTML =
                    "🔴 " +
                    (result.Message ||
                     "API ERROR");

                console.error(
                    "API returned an error:",
                    result
                );

                break;


            // =================================
            // UNKNOWN
            // =================================

            default:

                status.innerHTML =
                    "🔴 UNKNOWN RESPONSE";

                console.warn(
                    "Unknown API response:",
                    result
                );

                break;

        }

    }
    catch (err) {

        console.error(
            "Check-in request failed:",
            err
        );

        alert(
            err.message || err
        );

        status.innerHTML =
            "🔴 API ERROR";

    }


    // =====================================
    // READY FOR NEXT SCAN
    // =====================================

    setTimeout(() => {

        status.innerHTML =
            "🟢 READY TO SCAN";

    }, 1500);

}


// =====================================
// STOP SCANNER WHEN LEAVING
// =====================================

window.addEventListener(
    "beforeunload",
    async () => {

        await Scanner.stop();

    }
);