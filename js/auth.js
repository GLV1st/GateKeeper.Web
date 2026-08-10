const GATEKEEPER_API =
    "https://ticketing-api-gybyg9c5eegaeuav.uksouth-01.azurewebsites.net";

const AUTH_KEY = "gatekeeper_authenticated";

async function checkGateKeeperAuth() {

    // Already authenticated on this device
    if (localStorage.getItem(AUTH_KEY) === "true") {
        return true;
    }

    // Not authenticated
    window.location.href = "auth.html";

    return false;
}


async function loginGateKeeper(password) {

    try {

        const response = await fetch(
            `${GATEKEEPER_API}/api/auth`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    password: password
                })
            }
        );


        if (response.ok) {

            const data = await response.json();

            if (data.authenticated === true) {

                localStorage.setItem(
                    AUTH_KEY,
                    "true"
                );

                return {
                    success: true
                };
            }
        }


        return {
            success: false,
            message: "Incorrect password."
        };

    } catch (error) {

        console.error(
            "GateKeeper authentication error:",
            error
        );

        return {
            success: false,
            message: "Unable to contact GateKeeper API."
        };
    }
}


function logoutGateKeeper() {

    localStorage.removeItem(
        AUTH_KEY
    );

    window.location.href = "auth.html";
}