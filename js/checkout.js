document.addEventListener(
    "DOMContentLoaded",
    initialise
);


// =====================================
// INITIALISE
// =====================================

async function initialise() {

    const eventName =
        localStorage.getItem("CurrentEventName");


    document.getElementById(
        "eventName"
    ).textContent =
        eventName || "No Event Selected";


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
        "Ticket:",
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
            "CurrentEventId is missing"
        );


        return;

    }


    try {

        console.log(
            "Sending check-out request:",
            {
                eventId:
                    eventId,

                ticketNumber:
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


                document.getElementById(
                    "ticketNumber"
                ).textContent =
                    result.TicketNumber ||
                    ticketNumber;


                document.getElementById(
                    "ticketHolder"
                ).textContent =
                    result.CustomerName ||
                    "-";


                document.getElementById(
                    "ticketType"
                ).textContent =
                    result.TicketType ||
                    "-";


                document.getElementById(
                    "ticketTime"
                ).textContent =
                    new Date()
                        .toLocaleTimeString();


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


                document.getElementById(
                    "ticketNumber"
                ).textContent =
                    result.TicketNumber ||
                    ticketNumber;


                document.getElementById(
                    "ticketHolder"
                ).textContent =
                    result.CustomerName ||
                    "-";


                document.getElementById(
                    "ticketType"
                ).textContent =
                    result.TicketType ||
                    "-";


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


                document.getElementById(
                    "ticketNumber"
                ).textContent =
                    result.TicketNumber ||
                    ticketNumber;


                document.getElementById(
                    "ticketHolder"
                ).textContent =
                    result.CustomerName ||
                    "-";


                document.getElementById(
                    "ticketType"
                ).textContent =
                    result.TicketType ||
                    "-";


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
                    "Unknown API response:",
                    result
                );


                break;

        }

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
// STOP SCANNER WHEN LEAVING
// =====================================

window.addEventListener(
    "beforeunload",
    async () => {

        await Scanner.stop();

    }
);