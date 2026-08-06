let html5QrCode;

document.addEventListener("DOMContentLoaded", initialise);

async function initialise() {

    // Load selected event
    const eventName = localStorage.getItem("CurrentEventName");

    document.getElementById("eventName").textContent =
        eventName || "No Event Selected";

    // Start camera
    await startScanner();

}

async function startScanner() {

    try {

        html5QrCode = new Html5Qrcode("camera");

        await html5QrCode.start(

            { facingMode: "environment" },

            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250
                }
            },

            onScanSuccess

        );

    }
    catch (err) {

        console.error(err);

        document.getElementById("scanStatus").innerHTML =
            "🔴 Camera Failed";

    }

}

async function onScanSuccess(decodedText) {

    console.log("Scanned:", decodedText);

    document.getElementById("ticketNumber").textContent = decodedText;

    document.getElementById("scanStatus").innerHTML =
        "🟢 QR Code Read";

    // Stop duplicate reads
    await html5QrCode.pause(true);

    // Resume after 2 seconds
    setTimeout(async () => {

        document.getElementById("scanStatus").innerHTML =
            "🟢 READY TO SCAN";

        await html5QrCode.resume();

    }, 2000);

}