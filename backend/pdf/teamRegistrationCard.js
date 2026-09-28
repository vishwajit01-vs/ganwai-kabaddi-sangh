const PDFDocument = require("pdfkit");
const fs = require("fs");


// =====================================================
// CREATE TEAM REGISTRATION CARD
// SIZE: 243 x 153 POINTS
// SAME SIZE AS MEMBERSHIP CARD
// =====================================================

function createTeamRegistrationCard({
                                        outputPath,
                                        logoPath,
                                        team
                                    }) {

    return new Promise((resolve, reject) => {

        try {

            const doc =
                new PDFDocument({
                    size: [243, 153],
                    margin: 0
                });


            const stream =
                fs.createWriteStream(
                    outputPath
                );


            stream.on(
                "finish",
                () => {
                    resolve(outputPath);
                }
            );


            stream.on(
                "error",
                reject
            );


            doc.pipe(stream);


            // =================================================
            // BACKGROUND
            // =================================================

            doc
                .rect(
                    0,
                    0,
                    243,
                    153
                )
                .fill("#ffffff");


            // =================================================
            // BORDER
            // =================================================

            doc
                .rect(
                    1,
                    1,
                    241,
                    151
                )
                .lineWidth(1)
                .strokeColor("#0b2341")
                .stroke();


            // =================================================
            // HEADER
            // =================================================

            doc
                .rect(
                    1,
                    1,
                    241,
                    36
                )
                .fill("#0b2341");


            // =================================================
// LOGO
// =================================================

            if (
                logoPath &&
                fs.existsSync(
                    logoPath
                )
            ) {

                doc.save();

                doc
                    .circle(
                        21,
                        18,
                        11
                    )
                    .clip();

                doc.image(
                    logoPath,
                    10,
                    7,
                    {
                        fit: [22, 22],
                        align: "center",
                        valign: "center"
                    }
                );

                doc.restore();

            }


            // =================================================
            // HEADER TITLE
            // =================================================

            doc
                .fillColor("#ffffff")
                .font("Helvetica-Bold")
                .fontSize(10)
                .text(
                    "GANWAI KABADDI SANGH",
                    38,
                    8,
                    {
                        width: 195
                    }
                );


            doc
                .fillColor("#f6a623")
                .font("Helvetica-Bold")
                .fontSize(6.5)
                .text(
                    "OFFICIAL TEAM REGISTRATION",
                    38,
                    21,
                    {
                        width: 195
                    }
                );


            // =================================================
            // REGISTRATION ID
            // =================================================

            doc
                .fillColor("#f28c00")
                .font("Helvetica-Bold")
                .fontSize(8.5)
                .text(
                    team.registrationId ||
                    "PENDING",
                    135,
                    42,
                    {
                        width: 96,
                        align: "right"
                    }
                );


            // =================================================
            // TEAM DETAILS
            // =================================================

            let y = 55;


            function drawRow(
                label,
                value
            ) {

                doc
                    .fillColor("#667085")
                    .font("Helvetica")
                    .fontSize(5.5)
                    .text(
                        label,
                        12,
                        y,
                        {
                            width: 62
                        }
                    );


                doc
                    .fillColor("#0b2341")
                    .font("Helvetica-Bold")
                    .fontSize(6.8)
                    .text(
                        String(
                            value || "-"
                        ),
                        75,
                        y - 0.5,
                        {
                            width: 155,
                            height: 10,
                            ellipsis: true
                        }
                    );


                y += 12;

            }


            drawRow(
                "TEAM NAME",
                team.teamName
            );


            drawRow(
                "CAPTAIN",
                team.captainName
            );


            drawRow(
                "TOURNAMENT",
                team.tournamentId?.tournamentName ||
                "Ganwai Kabaddi Sangh Tournament"
            );


            drawRow(
                "PLAYERS",
                team.players?.length || 0
            );


            drawRow(
                "LOCATION",
                team.location
            );


            // =================================================
            // STATUS
            // =================================================

            doc
                .fillColor("#16803c")
                .font("Helvetica-Bold")
                .fontSize(7)
                .text(
                    "APPROVED",
                    12,
                    119,
                    {
                        width: 70
                    }
                );


            // =================================================
            // DIVIDER
            // =================================================

            doc
                .moveTo(
                    12,
                    128
                )
                .lineTo(
                    231,
                    128
                )
                .lineWidth(0.5)
                .strokeColor("#d9dee7")
                .stroke();


            // =================================================
            // SIGNATURE NAMES
            // =================================================

            doc
                .fillColor("#0b2341")
                .font("Helvetica-Bold")
                .fontSize(7)
                .text(
                    "SHIVAM MISHRA",
                    20,
                    130,
                    {
                        width: 85,
                        align: "center"
                    }
                );


            doc
                .fillColor("#0b2341")
                .font("Helvetica-Bold")
                .fontSize(7)
                .text(
                    "VISHWAJIT CHAUBEY",
                    135,
                    130,
                    {
                        width: 90,
                        align: "center"
                    }
                );


            // =================================================
            // SIGNATURE LABELS
            // =================================================

            doc
                .fillColor("#667085")
                .font("Helvetica")
                .fontSize(4.5)
                .text(
                    "Adhyaksh",
                    20,
                    141,
                    {
                        width: 85,
                        align: "center"
                    }
                );


            doc
                .fillColor("#667085")
                .font("Helvetica")
                .fontSize(4.5)
                .text(
                    "Digital Platform Developer",
                    135,
                    141,
                    {
                        width: 90,
                        align: "center"
                    }
                );


            // =================================================
            // FINISH
            // =================================================

            doc.end();


        } catch (error) {

            reject(error);

        }

    });

}


module.exports = {
    createTeamRegistrationCard
};