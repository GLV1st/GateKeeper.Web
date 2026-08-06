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

}