class GateKeeperAPI {

    static async getEvents() {

        try {

            const response = await fetch(`${CONFIG.apiUrl}/events`);

            if (!response.ok)
                throw new Error("Unable to load events.");

            return await response.json();

        }
        catch (err) {

            console.error(err);

            return [];

        }

    }

    static async checkIn(ticketNumber, eventId) {

        try {

            const response = await fetch(`${CONFIG.apiUrl}/tickets/checkin`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    ticketNumber,
                    eventId
                })

            });

            if (!response.ok)
                throw new Error("Check In failed.");

            return await response.json();

        }
        catch (err) {

            console.error(err);

            return {
                success: false,
                message: err.message
            };

        }

    }

}