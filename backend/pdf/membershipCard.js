const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const CARD_WIDTH = 243;
const CARD_HEIGHT = 153;

const projectRoot = path.join(__dirname, "..", "..");

// =====================================================
// FILE PATHS
// =====================================================

const logoPath = path.join(
    projectRoot,
    "images",
    "logo.png"
);

const adhyakshSignaturePath = path.join(
    projectRoot,
    "images",
    "adhyaksh-signature.png"
);

const developerSignaturePath = path.join(
    projectRoot,
    "images",
    "developer-signature.png"
);


// =====================================================
// MEMBER PHOTO PATH
// =====================================================

function getMemberPhotoPath(photo) {

    if (!photo) {
        return null;
    }

    const cleanPhoto =
        String(photo)
            .replace(/\\/g, "/")
            .replace(/^\/+/, "");

    const possiblePaths = [

        // If database stores:
        // uploads/photos/filename.jpg
        path.join(
            projectRoot,
            "backend",
            cleanPhoto
        ),

        // If database stores:
        // backend/uploads/photos/filename.jpg
        path.join(
            projectRoot,
            cleanPhoto
        ),

        // Direct backend uploads path
        path.join(
            projectRoot,
            "backend",
            "uploads",
            "photos",
            path.basename(cleanPhoto)
        )

    ];

    for (const possiblePath of possiblePaths) {

        if (fs.existsSync(possiblePath)) {

            console.log(
                "MEMBER PHOTO FOUND:",
                possiblePath
            );

            return possiblePath;
        }
    }

    console.log(
        "MEMBER PHOTO NOT FOUND:",
        photo
    );

    console.log(
        "CHECKED PHOTO PATHS:",
        possiblePaths
    );

    return null;
}


// =====================================================
// DRAW MEMBERSHIP CARD
// =====================================================

async function drawMembershipCard(doc, membership) {

    // =================================================
    // BACKGROUND
    // =================================================

    doc
        .rect(
            0,
            0,
            CARD_WIDTH,
            CARD_HEIGHT
        )
        .fill("#ffffff");


    // =================================================
    // HEADER
    // =================================================

    doc
        .rect(
            0,
            0,
            CARD_WIDTH,
            42
        )
        .fill("#0b1f3a");

    doc
        .rect(
            0,
            38,
            CARD_WIDTH,
            4
        )
        .fill("#f39c12");


    // =================================================
    // LOGO
    // =================================================

    if (fs.existsSync(logoPath)) {

        try {

            doc.save();

            doc
                .circle(
                    24,
                    21,
                    16
                )
                .clip();

            doc.image(
                logoPath,
                8,
                5,
                {
                    width: 32,
                    height: 32
                }
            );

            doc.restore();

            doc
                .circle(
                    24,
                    21,
                    16
                )
                .lineWidth(2)
                .strokeColor("#f39c12")
                .stroke();

        } catch (error) {

            console.log(
                "Logo rendering error:",
                error.message
            );
        }
    }


    // =================================================
    // SANGH NAME
    // =================================================

    doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
            "GANWAI KABADDI SANGH",
            48,
            9,
            {
                width: 180
            }
        );

    doc
        .fillColor("#f39c12")
        .font("Helvetica")
        .fontSize(6.5)
        .text(
            "DIGITAL MEMBERSHIP CARD",
            48,
            24,
            {
                width: 180
            }
        );


    // =================================================
    // MEMBER PHOTO
    // =================================================

    const photoPath =
        getMemberPhotoPath(
            membership.photo
        );

    console.log(
        "MEMBER PHOTO DATABASE VALUE:",
        membership.photo
    );

    console.log(
        "MEMBER PHOTO FINAL PATH:",
        photoPath
    );


    if (
        photoPath &&
        fs.existsSync(photoPath)
    ) {

        try {

            doc.image(
                photoPath,
                12,
                50,
                {
                    width: 55,
                    height: 62
                }
            );

            doc
                .lineWidth(1)
                .strokeColor("#d6d6d6")
                .rect(
                    12,
                    50,
                    55,
                    62
                )
                .stroke();

        } catch (error) {

            console.log(
                "Photo rendering error:",
                error.message
            );

            doc
                .rect(
                    12,
                    50,
                    55,
                    62
                )
                .fill("#eeeeee");

            doc
                .fillColor("#777777")
                .font("Helvetica")
                .fontSize(7)
                .text(
                    "PHOTO",
                    12,
                    77,
                    {
                        width: 55,
                        align: "center"
                    }
                );
        }

    } else {

        doc
            .rect(
                12,
                50,
                55,
                62
            )
            .fill("#eeeeee");

        doc
            .fillColor("#777777")
            .font("Helvetica")
            .fontSize(7)
            .text(
                "PHOTO",
                12,
                77,
                {
                    width: 55,
                    align: "center"
                }
            );
    }


    // =================================================
    // MEMBER DETAILS
    // =================================================

    const detailsX = 75;


    // =================================================
    // MEMBER NAME
    // =================================================

    doc
        .fillColor("#777777")
        .font("Helvetica")
        .fontSize(6.5)
        .text(
            "MEMBER NAME",
            detailsX,
            51
        );

    doc
        .fillColor("#111111")
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text(
            membership.fullName || "-",
            detailsX,
            59,
            {
                width: 100
            }
        );


    // =================================================
    // FATHER NAME
    // =================================================

    doc
        .fillColor("#777777")
        .font("Helvetica")
        .fontSize(6.5)
        .text(
            "FATHER'S NAME",
            detailsX,
            73
        );

    doc
        .fillColor("#111111")
        .font("Helvetica")
        .fontSize(7.5)
        .text(
            membership.fatherName || "-",
            detailsX,
            81,
            {
                width: 100
            }
        );


    // =================================================
    // MEMBERSHIP ID
    // =================================================

    doc
        .fillColor("#777777")
        .font("Helvetica")
        .fontSize(6.5)
        .text(
            "MEMBERSHIP ID",
            detailsX,
            95
        );

    doc
        .fillColor("#0b1f3a")
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(
            membership.membershipId || "-",
            detailsX,
            103,
            {
                width: 100
            }
        );


    // =================================================
    // ACTIVE STATUS
    // =================================================

    doc
        .roundedRect(
            184,
            49,
            46,
            15,
            3
        )
        .fill("#e8f7ed");

    doc
        .fillColor("#16803c")
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .text(
            "ACTIVE",
            184,
            54,
            {
                width: 46,
                align: "center"
            }
        );


    // =================================================
    // VALID YEAR
    // =================================================

    doc
        .fillColor("#777777")
        .font("Helvetica")
        .fontSize(6)
        .text(
            "VALID YEAR",
            184,
            70,
            {
                width: 46,
                align: "center"
            }
        );

    doc
        .fillColor("#0b1f3a")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
            String(
                membership.membershipYear ||
                new Date().getFullYear()
            ),
            184,
            78,
            {
                width: 46,
                align: "center"
            }
        );


    // =================================================
    // VALIDITY
    // =================================================

    doc
        .fillColor("#777777")
        .font("Helvetica")
        .fontSize(6)
        .text(
            "VALIDITY",
            184,
            90,
            {
                width: 46,
                align: "center"
            }
        );

    doc
        .fillColor("#111111")
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .text(
            "1 YEAR",
            184,
            98,
            {
                width: 46,
                align: "center"
            }
        );


    // =================================================
    // QR CODE
    // =================================================

    const verificationBaseUrl =
        process.env.PUBLIC_BASE_URL ||
        "";

    const verificationUrl =
        `${verificationBaseUrl}/verify.html?id=${encodeURIComponent(
            membership.membershipId || ""
        )}`;

    try {

        const QRCode =
            require("qrcode");

        const qrDataUrl =
            await QRCode.toDataURL(
                verificationUrl,
                {
                    width: 32,
                    margin: 0
                }
            );

        doc.image(
            qrDataUrl,
            207,
            107,
            {
                width: 23,
                height: 23
            }
        );

    } catch (error) {

        console.log(
            "QR generation error:",
            error.message
        );
    }


    // =================================================
    // BOTTOM SEPARATOR
    // =================================================

    doc
        .lineWidth(0.7)
        .strokeColor("#d6d6d6")
        .moveTo(
            10,
            132
        )
        .lineTo(
            233,
            132
        )
        .stroke();


    // =================================================
    // ADHYAKSH SIGNATURE
    // =================================================

    if (
        fs.existsSync(
            adhyakshSignaturePath
        )
    ) {

        try {

            doc.image(
                adhyakshSignaturePath,
                20,
                134,
                {
                    width: 52,
                    height: 8
                }
            );

        } catch (error) {

            console.log(
                "Adhyaksh signature error:",
                error.message
            );
        }
    }


    doc
        .fillColor("#555555")
        .font("Helvetica")
        .fontSize(5.5)
        .text(
            "ADHYAKSH",
            15,
            144,
            {
                width: 62,
                align: "center"
            }
        );


    // =================================================
    // DEVELOPER SIGNATURE
    // =================================================

    if (
        fs.existsSync(
            developerSignaturePath
        )
    ) {

        try {

            doc.image(
                developerSignaturePath,
                157,
                134,
                {
                    width: 62,
                    height: 8
                }
            );

        } catch (error) {

            console.log(
                "Developer signature error:",
                error.message
            );
        }
    }


    doc
        .fillColor("#555555")
        .font("Helvetica")
        .fontSize(5.5)
        .text(
            "DIGITAL PLATFORM DEVELOPER",
            143,
            144,
            {
                width: 90,
                align: "center"
            }
        );
}


// =====================================================
// GENERATE MEMBERSHIP CARD
// =====================================================

async function generateMembershipCard(
    membership,
    output
) {

    return new Promise(
        async (resolve, reject) => {

            try {

                const doc =
                    new PDFDocument({
                        size: [
                            CARD_WIDTH,
                            CARD_HEIGHT
                        ],
                        margin: 0
                    });


                // =================================================
                // EXPRESS RESPONSE
                // =================================================

                if (
                    output &&
                    typeof output.setHeader === "function"
                ) {

                    output.setHeader(
                        "Content-Type",
                        "application/pdf"
                    );

                    output.setHeader(
                        "Content-Disposition",
                        `inline; filename="membership-${membership.membershipId || "card"}.pdf"`
                    );

                    doc.pipe(output);

                    await drawMembershipCard(
                        doc,
                        membership
                    );

                    doc.end();

                    resolve();

                    return;
                }


                // =================================================
                // FILE PATH
                // =================================================

                if (
                    typeof output !== "string"
                ) {

                    throw new TypeError(
                        "PDF output must be a file path or ServerResponse"
                    );
                }


                const stream =
                    fs.createWriteStream(
                        output
                    );

                doc.pipe(stream);

                await drawMembershipCard(
                    doc,
                    membership
                );

                doc.end();

                stream.on(
                    "finish",
                    () => {

                        resolve(output);
                    }
                );

                stream.on(
                    "error",
                    reject
                );

            } catch (error) {

                reject(error);
            }
        }
    );
}


// =====================================================
// CREATE PDF BUFFER
// =====================================================

async function createMembershipCardBuffer(
    membership
) {

    return new Promise(
        async (resolve, reject) => {

            try {

                const doc =
                    new PDFDocument({
                        size: [
                            CARD_WIDTH,
                            CARD_HEIGHT
                        ],
                        margin: 0
                    });

                const chunks = [];

                doc.on(
                    "data",
                    chunk => {
                        chunks.push(chunk);
                    }
                );

                doc.on(
                    "end",
                    () => {

                        resolve(
                            Buffer.concat(chunks)
                        );
                    }
                );

                doc.on(
                    "error",
                    reject
                );

                await drawMembershipCard(
                    doc,
                    membership
                );

                doc.end();

            } catch (error) {

                reject(error);
            }
        }
    );
}


// =====================================================
// EXPORTS
// =====================================================

module.exports =
    generateMembershipCard;

module.exports.generateMembershipCard =
    generateMembershipCard;

module.exports.createMembershipCardBuffer =
    createMembershipCardBuffer;