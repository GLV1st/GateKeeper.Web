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

        const result = await GateKeeperAPI.checkIn(

            ticketNumber,

            localStorage.getItem("CurrentEventId")

        );

        switch (result.Status) {

            case "SUCCESS":

                document.getElementById("scanStatus").innerHTML =
                    "🟢 " + result.Message;

                document.getElementById("ticketNumber").textContent =
                    result.TicketNumber;

                document.getElementById("ticketHolder").textContent =
                    result.CustomerName;

                document.getElementById("ticketType").textContent =
                    result.TicketType;

                document.getElementById("ticketTime").textContent =
                    new Date().toLocaleTimeString();

                break;

            case "ALREADY_CHECKED_IN":

                document.getElementById("scanStatus").innerHTML =
                    "🟠 " + result.Message;

                document.getElementById("ticketNumber").textContent =
                    result.TicketNumber;

                document.getElementById("ticketHolder").textContent =
                    result.CustomerName;

                document.getElementById("ticketType").textContent =
                    result.TicketType;

                break;

            case "CANCELLED":

                document.getElementById("scanStatus").innerHTML =
                    "🔴 " + result.Message;

                break;

            case "NOT_FOUND":

                document.getElementById("scanStatus").innerHTML =
                    "🔴 " + result.Message;

                break;

            default:

                document.getElementById("scanStatus").innerHTML =
                    "🔴 Unknown response";

                console.log(result);

                break;

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