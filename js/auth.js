const GATEKEEPER_API =
    "https://ticketing-api-gybyg9c5eegaeuav.uksouth-01.azurewebsites.net";

const AUTH_KEY = "gatekeeper_authenticated";
const ADMIN_AUTH_KEY = "gatekeeper_admin_authenticated";


/* =========================================================
   NORMAL GATEKEEPER AUTHENTICATION
   COP27
   ========================================================= */

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

        console.log(
            "GateKeeper auth response:",
            data
        );


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


/* =========================================================
   EVENT ADMIN AUTHENTICATION
   COPADMIN
   ========================================================= */

function isAdminAuthenticated() {

    return localStorage.getItem(
        ADMIN_AUTH_KEY
    ) === "true";
}


function checkAdminAuth() {

    if (!isGateKeeperAuthenticated()) {

        window.location.replace(
            "auth.html"
        );

        return false;
    }


    if (isAdminAuthenticated()) {

        return true;
    }


    window.location.replace(
        "admin.html"
    );

    return false;
}


async function loginAdmin(password) {

    try {

        const response = await fetch(
            `${GATEKEEPER_API}/api/event-auth`,
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


        let data = {};

        try {

            data = await response.json();

        } catch (jsonError) {

            console.warn(
                "Event admin auth response was not JSON."
            );
        }


        console.log(
            "GateKeeper event admin auth response:",
            data
        );


        const authenticated =
            data.authenticated === true ||
            data.Authenticated === true;


        if (response.ok && authenticated) {

            localStorage.setItem(
                ADMIN_AUTH_KEY,
                "true"
            );

            return {
                success: true
            };
        }


        if (response.status === 401) {

            return {
                success: false,
                message: "Incorrect admin password."
            };
        }


        return {
            success: false,
            message:
                data.message ||
                data.Message ||
                "Admin authentication failed."
        };


    } catch (error) {

        console.error(
            "GateKeeper event admin authentication error:",
            error
        );

        return {
            success: false,
            message:
                "Unable to contact GateKeeper API."
        };
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutGateKeeper() {

    localStorage.removeItem(
        AUTH_KEY
    );

    localStorage.removeItem(
        ADMIN_AUTH_KEY
    );

    window.location.replace(
        "auth.html"
    );
}