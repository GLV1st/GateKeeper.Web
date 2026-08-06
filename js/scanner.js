// =====================================
// GateKeeper Scanner
// =====================================

window.Scanner = {

    html5: null,
    callback: null,
    active: false,
    scanLock: false,

    // =====================================
    // Logging
    // =====================================

    log(message) {

        console.log("[Scanner]", message);

    },

    // =====================================
    // Start Scanner
    // =====================================

    async start(callback) {

        this.callback = callback;
        this.active = true;
        this.scanLock = false;

        await this.startCamera();

    },

    // =====================================
    // Stop Scanner
    // =====================================

    async stop() {

        this.active = false;
        this.scanLock = false;

        if (this.html5) {

            try {

                await this.html5.stop();
                await this.html5.clear();

            }
            catch (err) {

                console.error(err);

            }

            this.html5 = null;

        }

    },

    // =====================================
    // Camera Selection
    // =====================================

    async getBestCamera() {

        const cameras = await Html5Qrcode.getCameras();

        this.log(`Found ${cameras.length} camera(s)`);

        cameras.forEach((camera, index) => {

            this.log(`${index}: ${camera.label}`);

        });

        if (cameras.length === 0)
            throw new Error("No camera found.");

        // Force "Back Camera" if present
        let camera = cameras.find(c =>
            (c.label || "").toLowerCase().includes("back")
        );

        // Otherwise look for any rear camera
        if (!camera) {

            camera = cameras.find(c => {

                const label = (c.label || "").toLowerCase();

                return label.includes("rear") ||
                       label.includes("environment") ||
                       label.includes("wide") ||
                       label.includes("ultra");

            });

        }

        // Final fallback
        if (!camera) {

            camera = cameras[cameras.length - 1];

        }

        this.log("Using camera: " + camera.label);

        return camera.id;

    },

    // =====================================
    // Start Camera
    // =====================================

    async startCamera() {

        const cameraId = await this.getBestCamera();

        this.html5 = new Html5Qrcode("camera");

        this.log("Starting camera...");

        await this.html5.start(

            cameraId,

            {
                fps: 10,

                qrbox: {
                    width: 280,
                    height: 280
                },

                aspectRatio: 1.7778
            },

            async (decodedText) => {

                if (!this.active)
                    return;

                if (this.scanLock)
                    return;

                this.scanLock = true;

                this.log("QR: " + decodedText);

                try {

                    if (this.callback) {

                        await this.callback(decodedText.trim());

                    }

                }
                finally {

                    setTimeout(() => {

                        this.scanLock = false;

                    }, 750);

                }

            },

            error => {

                if (!error.includes("NotFoundException")) {

                    console.log(error);

                }

            }

        );

    }

};