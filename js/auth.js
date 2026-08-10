const GATEKEEPER_API =
    "https://ticketing-api-gybyg9c5eegaeuav.uksouth-01.azurewebsites.net";

const AUTH_KEY = "gatekeeper_authenticated";


function isGateKeeperAuthenticated() {

    return localStorage.getItem(AUTH_KEY) === "true";
}


function checkGateKeeperAuth() {

    if (isGateKeeperAuthenticated()) {
        return true;
    }

    window.location.replace("auth.html");

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


        const data = await response.json();

        console.log("GateKeeper auth response:", data);


        // Accept either camelCase or PascalCase
        const authenticated =
            data.authenticated === true ||
            data.Authenticated === true;


        if (response.ok && authenticated) {

            localStorage.setItem(
                AUTH_KEY,
                "true"
            );

            return {
                success: true
            };
        }


        if (response.status === 401) {

            return {
                success: false,
                message: "Incorrect password."
            };
        }


        return {
            success: false,
            message:
                data.message ||
                data.Message ||
                "Authentication failed."
        };


    } catch (error) {

        console.error(
            "GateKeeper authentication error:",
            error
        );

        return {
            success: false,
            message:
                "Unable to contact GateKeeper API."
        };
    }
}


function logoutGateKeeper() {

    localStorage.removeItem(AUTH_KEY);

    window.location.replace("auth.html");
}