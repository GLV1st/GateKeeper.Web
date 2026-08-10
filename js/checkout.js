document.addEventListener(
    "DOMContentLoaded",
    initialise
);


// =====================================
// INITIALISE
// =====================================

async function initialise() {

    console.log("=================================");
    console.log("GateKeeper Check Out Started");
    console.log("=================================");


    // =====================================
    // LOAD EVENT
    // =====================================

    const eventName =
        localStorage.getItem(
            "CurrentEventName"
        );

    const eventNameElement =
        document.getElementById(
            "eventName"
        );

    if (eventNameElement) {

        eventNameElement.textContent =
            eventName ||
            "No Event Selected";

    }


    const eventId =
        localStorage.getItem(
            "CurrentEventId"
        );


    if (!eventId) {

        console.error(
            "No CurrentEventId found."
        );

        document.getElementById(
            "scanStatus"
        ).innerHTML =
            "🔴 NO EVENT SELECTED";

        return;

    }


    console.log(
        "Current Event ID:",
        eventId
    );

    console.log(
        "Current Event Name:",
        eventName
    );


    // =====================================
    // LOAD LIVE STATISTICS
    // =====================================

    await updateStats();


    // =====================================
    // START SCANNER
    // =====================================

    try {

        await Scanner.start(
            ticketScanned
        );


        document.getElementById(
            "scanStatus"
        ).innerHTML =
            "🟢 READY TO SCAN";

    }

    catch (err) {

        console.error(
            "Camera error:",
            err
        );


        document.getElementById(
            "scanStatus"
        ).innerHTML =
            "🔴 CAMERA FAILED";

    }

}


// =====================================
// UPDATE STATISTICS
// =====================================

async function updateStats() {

    const eventId =
        localStorage.getItem(
            "CurrentEventId"
        );


    if (!eventId) {

        console.warn(
            "Cannot update statistics - no event selected."
        );

        return;

    }


    console.log(
        "Loading statistics for event:",
        eventId
    );


    const stats =
        await GateKeeperAPI.getEventStats(
            eventId
        );


    if (!stats) {

        console.error(
            "No statistics returned."
        );

        return;

    }


    console.log(
        "Event statistics:",
        stats
    );


    // =====================================
    // CHECKED IN
    // =====================================

    const checkedInCount =
        document.getElementById(
            "checkedInCount"
        );


    if (checkedInCount) {

        checkedInCount.textContent =
            stats.CheckedIn ?? 0;

    }


    // =====================================
    // CHECKED OUT
    // =====================================

    const checkedOutCount =
        document.getElementById(
            "checkedOutCount"
        );


    if (checkedOutCount) {

        checkedOutCount.textContent =
            stats.CheckedOut ?? 0;

    }

}


// =====================================
// BEEP
// =====================================

function beep() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext)
            return;


        const audioContext =
            new AudioContext();


        const oscillator =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        oscillator.type =
            "sine";


        oscillator.frequency.value =
            900;


        gain.gain.value =
            0.15;


        oscillator.connect(
            gain
        );


        gain.connect(
            audioContext.destination
        );


        oscillator.start();


        oscillator.stop(
            audioContext.currentTime + 0.12
        );

    }

    catch (err) {

        console.log(
            "Beep unavailable:",
            err
        );

    }

}


// =====================================
// TICKET SCANNED
// =====================================

async function ticketScanned(
    ticketNumber
) {

    console.log(
        "================================="
    );


    console.log(
        "Ticket scanned:",
        ticketNumber
    );


    const status =
        document.getElementById(
            "scanStatus"
        );


    status.innerHTML =
        "⏳ CHECKING TICKET...";


    const eventId =
        localStorage.getItem(
            "CurrentEventId"
        );


    // =====================================
    // CHECK EVENT
    // =====================================

    if (!eventId) {

        status.innerHTML =
            "🔴 NO EVENT SELECTED";


        console.error(
            "CurrentEventId is missing."
        );


        return;

    }


    try {

        console.log(
            "Sending check-out request:",
            {
                eventId,
                ticketNumber
            }
        );


        // =====================================
        // CHECK OUT
        // =====================================

        const result =
            await GateKeeperAPI.checkOut(
                ticketNumber,
                eventId
            );


        console.log(
            "Check-out response:",
            result
        );


        // =====================================
        // API RESPONSE
        // =====================================

        switch (
            result.Status
        ) {


            // =================================
            // SUCCESS
            // =================================

            case "SUCCESS":

                beep();


                status.innerHTML =
                    "🟢 " +
                    (
                        result.Message ||
                        "CHECKED OUT"
                    );


                showTicket(
                    result,
                    ticketNumber
                );


                break;


            // =================================
            // ALREADY CHECKED OUT
            // =================================

            case "ALREADY_CHECKED_OUT":

                status.innerHTML =
                    "🟠 " +
                    (
                        result.Message ||
                        "ALREADY CHECKED OUT"
                    );


                showTicket(
                    result,
                    ticketNumber
                );


                break;


            // =================================
            // NOT CHECKED IN
            // =================================

            case "NOT_CHECKED_IN":

                status.innerHTML =
                    "🟠 " +
                    (
                        result.Message ||
                        "TICKET IS NOT CHECKED IN"
                    );


                showTicket(
                    result,
                    ticketNumber
                );


                break;


            // =================================
            // CANCELLED
            // =================================

            case "CANCELLED":

                status.innerHTML =
                    "🔴 " +
                    (
                        result.Message ||
                        "TICKET CANCELLED"
                    );

                break;


            // =================================
            // NOT FOUND
            // =================================

            case "NOT_FOUND":

                status.innerHTML =
                    "🔴 " +
                    (
                        result.Message ||
                        "TICKET NOT FOUND"
                    );

                break;


            // =================================
            // ERROR
            // =================================

            case "ERROR":

                status.innerHTML =
                    "🔴 " +
                    (
                        result.Message ||
                        "API ERROR"
                    );


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
                    "Unknown response:",
                    result
                );

                break;

        }


        // =====================================
        // REFRESH STATISTICS
        // =====================================

        await updateStats();

    }

    catch (err) {

        console.error(
            "Check-out request failed:",
            err
        );


        status.innerHTML =
            "🔴 API ERROR";


        alert(
            err.message ||
            err
        );

    }


    // =====================================
    // READY FOR NEXT SCAN
    // =====================================

    setTimeout(
        () => {

            status.innerHTML =
                "🟢 READY TO SCAN";

        },
        1500
    );

}


// =====================================
// SHOW TICKET INFORMATION
// =====================================

function showTicket(
    result,
    ticketNumber
) {

    const ticket =
        document.getElementById(
            "ticketNumber"
        );

    const holder =
        document.getElementById(
            "ticketHolder"
        );

    const type =
        document.getElementById(
            "ticketType"
        );

    const time =
        document.getElementById(
            "ticketTime"
        );


    if (ticket) {

        ticket.textContent =
            result.TicketNumber ||
            ticketNumber ||
            "-";

    }


    if (holder) {

        holder.textContent =
            result.CustomerName ||
            "-";

    }


    if (type) {

        type.textContent =
            result.TicketType ||
            "-";

    }


    if (time) {

        time.textContent =
            new Date()
                .toLocaleTimeString();

    }

}


// =====================================
// STOP SCANNER WHEN LEAVING
// =====================================

window.addEventListener(
    "beforeunload",
    async () => {

        try {

            await Scanner.stop();

        }

        catch (err) {

            console.warn(
                "Scanner stop failed:",
                err
            );

        }

    }
);