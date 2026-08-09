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
                // DYNAMIC SCAN AREA
                // =================================
                //
                // IMPORTANT:
                //
                // Do NOT use:
                //
                // width: 280
                // height: 280
                //
                // The scan box now follows the
                // actual camera view dimensions.
                //

              qrbox: (
    viewfinderWidth,
    viewfinderHeight
) => {

    // Barcode-shaped scan area
    const width = Math.floor(viewfinderWidth * 0.85);

    const height = Math.floor(
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


                this.scanLock = true;


                const value =
                    decodedText
                        .trim();


                this.log(
                    "QR: " + value
                );


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

                    /*
                     * Prevent the same QR code
                     * being processed repeatedly.
                     */

                    setTimeout(() => {

                        this.scanLock = false;

                    }, 750);

                }

            },


            // =====================================
            // SCAN ERROR
            // =====================================

            error => {

                /*
                 * html5-qrcode produces lots of
                 * "not found" messages while it is
                 * searching.
                 *
                 * Ignore those.
                 */

                if (
                    typeof error === "string" &&
                    error.includes(
                        "NotFoundException"
                    )
                ) {

                    return;

                }


                /*
                 * Ignore normal frame scanning
                 * failures.
                 */

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