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
    // Beep
    // =====================================

    beep() {

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

            oscillator.type = "sine";

            oscillator.frequency.value = 1000;

            gain.gain.value = 0.15;

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.start();

            setTimeout(() => {

                oscillator.stop();
                audioContext.close();

            }, 120);

        }
        catch (err) {

            console.log(
                "[Scanner] Beep unavailable:",
                err
            );

        }

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

                console.error(
                    "[Scanner] Stop error:",
                    err
                );

            }

            this.html5 = null;

        }

    },


    // =====================================
    // Camera Selection
    // =====================================

    async getBestCamera() {

        const cameras =
            await Html5Qrcode.getCameras();

        this.log(
            `Found ${cameras.length} camera(s)`
        );

        cameras.forEach(
            (camera, index) => {

                this.log(
                    `${index}: ${camera.label}`
                );

            }
        );

        if (cameras.length === 0) {

            throw new Error(
                "No camera found."
            );

        }


        // ---------------------------------
        // Prefer Back Camera
        // ---------------------------------

        let camera =
            cameras.find(c =>

                (c.label || "")
                    .toLowerCase()
                    .includes("back")

            );


        // ---------------------------------
        // Other Rear Camera Names
        // ---------------------------------

        if (!camera) {

            camera =
                cameras.find(c => {

                    const label =
                        (c.label || "")
                            .toLowerCase();

                    return (

                        label.includes("rear") ||
                        label.includes("environment") ||
                        label.includes("wide") ||
                        label.includes("ultra")

                    );

                });

        }


        // ---------------------------------
        // Final Fallback
        // ---------------------------------

        if (!camera) {

            camera =
                cameras[cameras.length - 1];

        }


        this.log(
            "Using camera: " +
            camera.label
        );

        return camera.id;

    },


    // =====================================
    // Start Camera
    // =====================================

    async startCamera() {

        const cameraId =
            await this.getBestCamera();


        // ---------------------------------
        // Create Scanner
        // ---------------------------------

        this.html5 =
            new Html5Qrcode("camera");


        this.log(
            "Starting camera..."
        );


        // ---------------------------------
        // Start html5-qrcode
        // ---------------------------------

        await this.html5.start(

            cameraId,

            {

                fps: 10,


                // =================================
                // BARCODE SCAN AREA
                // =================================

                qrbox: (
                    viewfinderWidth,
                    viewfinderHeight
                ) => {

                    // Wide and short barcode window

                    const width =
                        Math.floor(
                            viewfinderWidth * 0.85
                        );


                    const height =
                        Math.floor(
                            Math.min(
                                viewfinderHeight * 0.30,
                                180
                            )
                        );


                    this.log(
                        `Barcode scan area: ${width} x ${height}`
                    );


                    return {

                        width: width,

                        height: height

                    };

                },


                // =================================
                // CAMERA ASPECT RATIO
                // =================================

                aspectRatio: 1.7778

            },


            // =====================================
            // SUCCESS
            // =====================================

            async (decodedText) => {

                if (!this.active)
                    return;


                if (this.scanLock)
                    return;


                // Lock immediately

                this.scanLock = true;


                const value =
                    decodedText.trim();


                this.log(
                    "Barcode: " + value
                );


                // =================================
                // BEEP
                // =================================

                this.beep();


                try {

                    if (this.callback) {

                        await this.callback(
                            value
                        );

                    }

                }
                catch (err) {

                    console.error(
                        "[Scanner] Callback error:",
                        err
                    );

                }
                finally {

                    // =================================
                    // SCAN LOCK
                    // =================================
                    //
                    // Prevent the same barcode
                    // firing repeatedly.
                    //

                    setTimeout(() => {

                        this.scanLock = false;

                    }, 1500);

                }

            },


            // =====================================
            // SCAN ERROR
            // =====================================

            error => {

                // Normal scanning failures are ignored

                if (
                    typeof error === "string" &&
                    error.includes(
                        "NotFoundException"
                    )
                ) {

                    return;

                }


                if (
                    typeof error === "string" &&
                    (
                        error.includes(
                            "No MultiFormat Readers"
                        ) ||
                        error.includes(
                            "QR code parse error"
                        )
                    )
                ) {

                    return;

                }


                console.log(
                    "[Scanner] Scan:",
                    error
                );

            }

        );


        this.log(
            "Camera started successfully."
        );

    }

};