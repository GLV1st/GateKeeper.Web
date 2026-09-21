class GateKeeperAPI {

    // =====================================
    // GET EVENTS
    // =====================================

    static async getEvents() {

        try {

            const response =
                await fetch(
                    `${CONFIG.apiUrl}/events`
                );

            if (!response.ok)
                throw new Error(
                    "Unable to load events."
                );

            return await response.json();

        }
        catch (err) {

            console.error(err);

            return [];

        }

    }


    // =====================================
    // CHECK IN
    // =====================================

    static async checkIn(
        ticketNumber,
        eventId
    ) {

        try {

            const response =
                await fetch(
                    `${CONFIG.apiUrl}/tickets/checkin`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            ticketNumber,
                            eventId

                        })

                    }
                );


            if (!response.ok)
                throw new Error(
                    "Check In failed."
                );


            return await response.json();

        }
        catch (err) {

            console.error(err);

            return {

                Status: "ERROR",
                Message: err.message

            };

        }

    }


    // =====================================
    // CHECK OUT
    // =====================================

    static async checkOut(
        ticketNumber,
        eventId
    ) {

        try {

            const response =
                await fetch(
                    `${CONFIG.apiUrl}/tickets/checkout`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            ticketNumber,
                            eventId

                        })

                    }
                );


            if (!response.ok)
                throw new Error(
                    "Check Out failed."
                );


            return await response.json();

        }
        catch (err) {

            console.error(err);

            return {

                Status: "ERROR",
                Message: err.message

            };

        }

    }


    // =====================================
    // GET EVENT STATISTICS
    // =====================================

    static async getEventStats(
        eventId
    ) {

        try {

            const response =
                await fetch(
                    `${CONFIG.apiUrl}/events/${encodeURIComponent(eventId)}/stats`
                );


            if (!response.ok)
                throw new Error(
                    "Unable to load event statistics."
                );


            return await response.json();

        }
        catch (err) {

            console.error(
                "Event stats error:",
                err
            );


            return {

                Total: 0,
                CheckedIn: 0,
                CheckedOut: 0,
                OnSite: 0,
                NotYetIn: 0,
                Cancelled: 0

            };

        }

    }


    // =====================================
    // GENERATE PHYSICAL TICKETS
    // =====================================

    static async generatePhysicalTickets(
        eventId,
        ticketType,
        quantity
    ) {

        try {

            const response =
                await fetch(
                    `${CONFIG.apiUrl}/tickets/generate-physical`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            eventId,
                            ticketType,
                            quantity

                        })

                    }
                );


            if (!response.ok) {

                let message =
                    "Unable to generate physical tickets.";


                try {

                    const error =
                        await response.json();


                    if (error.Message)
                        message = error.Message;

                }
                catch {

                    // Ignore JSON parsing errors

                }


                throw new Error(message);

            }


            return await response.json();

        }
        catch (err) {

            console.error(
                "Generate physical tickets error:",
                err
            );


            throw err;

        }

    }

}


// =====================================
// GLOBAL API OBJECT
// =====================================

window.GateKeeperAPI =
    GateKeeperAPI;