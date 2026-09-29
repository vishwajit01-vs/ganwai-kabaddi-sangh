const express = require("express");
const path = require("path");
const fs = require("fs");

const Team = require("../models/Team");
const Tournament = require("../models/Tournament");
const Account = require("../models/Account");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const upload = require("../config/teamUpload");
const { sendEmail } = require("../config/mailer");

const {
    createTeamRegistrationCard
} = require("../pdf/teamRegistrationCard");

const router = express.Router();


// =====================================================
// HELPER: GENERATE TEAM REGISTRATION ID
// =====================================================

async function getNextTeamRegistrationId() {

    const currentYear =
        new Date().getFullYear();

    const lastTeam =
        await Team.findOne({
            registrationId: {
                $regex:
                    `^GKS-TEAM-${currentYear}-`
            }
        }).sort({
            registrationId: -1
        });

    let nextNumber = 1;

    if (
        lastTeam &&
        lastTeam.registrationId
    ) {

        const parts =
            lastTeam.registrationId.split("-");

        const lastNumber =
            parseInt(
                parts[3],
                10
            );

        if (!isNaN(lastNumber)) {
            nextNumber =
                lastNumber + 1;
        }
    }

    return (
        `GKS-TEAM-${currentYear}-` +
        `${String(nextNumber).padStart(4, "0")}`
    );
}


// =====================================================
// POST: REGISTER TEAM
// =====================================================

router.post(
    "/",
    authMiddleware,

    upload.fields([

        {
            name: "teamLogo",
            maxCount: 1
        },

        ...Array.from(
            { length: 15 },
            (_, index) => ({
                name: `playerPhoto_${index}`,
                maxCount: 1
            })
        )

    ]),

    async (req, res) => {

        try {

            const {
                teamName,
                captainName,
                captainMobile,
                email,
                location,
                tournamentId,
                players,
                registrationFee,
                paymentReference
            } = req.body;


            // =================================================
            // BASIC VALIDATION
            // =================================================

            if (
                !teamName ||
                !captainName ||
                !captainMobile ||
                !email ||
                !location ||
                !tournamentId ||
                !players ||
                !paymentReference
            ) {

                return res.status(400).json({
                    message:
                        "Please fill all required fields."
                });

            }


            // =================================================
            // STRICT VALIDATION
            // =================================================

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            const mobileRegex =
                /^\d{10}$/;

            const utrRegex =
                /^\d{12}$/;


            // Captain mobile

            if (
                !mobileRegex.test(
                    String(captainMobile).trim()
                )
            ) {

                return res.status(400).json({
                    message:
                        "Captain mobile number must be exactly 10 digits."
                });

            }


            // UTR

            if (
                !utrRegex.test(
                    String(paymentReference).trim()
                )
            ) {

                return res.status(400).json({
                    message:
                        "UTR number must be exactly 12 digits."
                });

            }


            // Email

            if (
                !emailRegex.test(
                    String(email).trim()
                )
            ) {

                return res.status(400).json({
                    message:
                        "Please enter a valid team email."
                });

            }


            // =================================================
            // TEAM REGISTRATION FEE
            // =================================================

            if (
                Number(registrationFee) !== 51
            ) {

                return res.status(400).json({
                    message:
                        "Team registration fee must be ₹51."
                });

            }


            // =================================================
            // PLAYERS JSON
            // =================================================

            let parsedPlayers;

            try {

                parsedPlayers =
                    typeof players === "string"
                        ? JSON.parse(players)
                        : players;

            } catch (error) {

                return res.status(400).json({
                    message:
                        "Invalid players data."
                });

            }


            // =================================================
            // PLAYER COUNT
            // =================================================

            if (
                !Array.isArray(parsedPlayers) ||
                parsedPlayers.length < 1 ||
                parsedPlayers.length > 15
            ) {

                return res.status(400).json({
                    message:
                        "A team must have between 1 and 15 players."
                });

            }


            // =================================================
            // TOURNAMENT CHECK
            // =================================================

            const tournament =
                await Tournament.findById(
                    tournamentId
                );


            if (!tournament) {

                return res.status(404).json({
                    message:
                        "Tournament not found."
                });

            }


            if (
                tournament.status !==
                "Registration Open"
            ) {

                return res.status(400).json({
                    message:
                        "Team registration is currently closed for this tournament."
                });

            }


            // =================================================
            // TEAM LOGO
            // =================================================

            let teamLogo = "";


            if (
                req.files &&
                req.files.teamLogo &&
                req.files.teamLogo.length > 0
            ) {

                teamLogo =
                    `/backend/uploads/teams/${req.files.teamLogo[0].filename}`;

            }


            // =================================================
            // PLAYER DATA
            // =================================================

            const finalPlayers = [];


            for (
                let i = 0;
                i < parsedPlayers.length;
                i++
            ) {

                const player =
                    parsedPlayers[i];


                // ---------------------------------------------
                // REQUIRED PLAYER FIELDS
                // ---------------------------------------------

                if (
                    !player.name ||
                    !player.dob ||
                    !player.gender ||
                    !player.weight ||
                    !player.mobile
                ) {

                    return res.status(400).json({
                        message:
                            `Please fill all required details for Player ${i + 1}.`
                    });

                }


                // ---------------------------------------------
                // PLAYER MOBILE
                // ---------------------------------------------

                const playerMobile =
                    String(
                        player.mobile
                    ).trim();


                if (
                    !mobileRegex.test(
                        playerMobile
                    )
                ) {

                    return res.status(400).json({
                        message:
                            `Player ${i + 1} mobile number must be exactly 10 digits.`
                    });

                }


                // ---------------------------------------------
                // PLAYER DOB
                // ---------------------------------------------

                const dobValue =
                    String(
                        player.dob
                    ).trim();


                const dobRegex =
                    /^\d{4}-\d{2}-\d{2}$/;


                if (
                    !dobRegex.test(
                        dobValue
                    )
                ) {

                    return res.status(400).json({
                        message:
                            `Player ${i + 1} DOB year must contain exactly 4 digits.`
                    });

                }


                const dobYear =
                    dobValue.substring(
                        0,
                        4
                    );


                const numericYear =
                    Number(dobYear);


                if (
                    dobYear.length !== 4 ||
                    !Number.isInteger(
                        numericYear
                    ) ||
                    numericYear < 1900 ||
                    numericYear >
                    new Date().getFullYear()
                ) {

                    return res.status(400).json({
                        message:
                            `Player ${i + 1} has an invalid DOB year.`
                    });

                }


                // ---------------------------------------------
                // PLAYER PHOTO
                // ---------------------------------------------

                const playerFile =
                    req.files &&
                    req.files[
                        `playerPhoto_${i}`
                        ];


                if (
                    !playerFile ||
                    playerFile.length === 0
                ) {

                    return res.status(400).json({
                        message:
                            `Player ${i + 1} photo is required.`
                    });

                }


                const playerPhoto =
                    `/backend/uploads/player-photos/${playerFile[0].filename}`;


                // ---------------------------------------------
                // ADD PLAYER
                // ---------------------------------------------

                finalPlayers.push({

                    name:
                        String(
                            player.name
                        ).trim(),

                    dob:
                    dobValue,

                    gender:
                    player.gender,

                    weight:
                        Number(
                            player.weight
                        ),

                    mobile:
                    playerMobile,

                    photo:
                    playerPhoto,

                    membershipId:
                        player.membershipId ||
                        "",

                    playerRole:
                        player.playerRole ||
                        undefined,

                    jerseyNumber:
                        player.jerseyNumber !==
                        undefined &&
                        player.jerseyNumber !== ""
                            ? Number(
                                player.jerseyNumber
                            )
                            : undefined

                });

            }


            // =================================================
            // CREATE TEAM
            // =================================================

            const team =
                new Team({

                    teamName:
                        String(
                            teamName
                        ).trim(),

                    captainName:
                        String(
                            captainName
                        ).trim(),

                    captainMobile:
                        String(
                            captainMobile
                        ).trim(),

                    email:
                        String(
                            email
                        )
                            .trim()
                            .toLowerCase(),

                    location:
                        String(
                            location
                        ).trim(),

                    teamLogo,

                    tournamentId,

                    players:
                    finalPlayers,

                    registrationFee:
                        51,

                    paymentReference:
                        String(
                            paymentReference
                        ).trim(),

                    paymentStatus:
                        "Pending Verification",

                    registrationStatus:
                        "Pending",

                    createdBy:
                    req.accountId

                });


            await team.save();


            // =================================================
            // RESPONSE
            // =================================================

            return res.status(201).json({

                message:
                    "Team registration submitted successfully. Payment verification is pending.",

                team: {

                    id:
                    team._id,

                    teamName:
                    team.teamName,

                    registrationStatus:
                    team.registrationStatus,

                    paymentStatus:
                    team.paymentStatus

                }

            });


        } catch (error) {

            console.error(
                "Team Registration Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Server error while registering team."

            });

        }

    }
);


// =====================================================
// GET: MY TEAM REGISTRATIONS
// =====================================================

router.get(
    "/my-teams",
    authMiddleware,
    async (req, res) => {

        try {

            const teams =
                await Team.find({
                    createdBy:
                    req.accountId
                })
                    .populate(
                        "tournamentId",
                        "tournamentName tournamentDate status"
                    )
                    .sort({
                        createdAt: -1
                    });


            return res.json({
                teams
            });


        } catch (error) {

            console.error(
                "My Teams Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to load your team registrations."

            });

        }

    }
);


// =====================================================
// GET: ALL TEAMS
// ADMIN ONLY
// =====================================================

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const teams =
                await Team.find()
                    .populate(
                        "tournamentId",
                        "tournamentName tournamentDate status"
                    )
                    .populate(
                        "createdBy",
                        "fullName email mobile"
                    )
                    .sort({
                        createdAt: -1
                    });


            return res.json({
                teams
            });


        } catch (error) {

            console.error(
                "Get Teams Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to load teams."

            });

        }

    }
);


// =====================================================
// GET: TEAM PDF
// ADMIN ONLY
// =====================================================

router.get(
    "/:id/pdf",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const team =
                await Team.findById(
                    req.params.id
                )
                    .populate(
                        "tournamentId",
                        "tournamentName tournamentDate"
                    );


            if (!team) {

                return res.status(404).json({

                    message:
                        "Team not found."

                });

            }


            if (
                team.registrationStatus !==
                "Approved"
            ) {

                return res.status(400).json({

                    message:
                        "Team must be approved before generating the PDF."

                });

            }


            if (!team.registrationId) {

                return res.status(400).json({

                    message:
                        "Team registration ID is not available."

                });

            }


            // =================================================
            // PROJECT ROOT
            // =================================================

            const projectRoot =
                path.join(
                    __dirname,
                    "..",
                    ".."
                );


            // =================================================
            // LOGO PATH
            // =================================================

            const logoPath =
                path.join(
                    projectRoot,
                    "images",
                    "logo.png"
                );


            if (
                !fs.existsSync(
                    logoPath
                )
            ) {

                return res.status(500).json({

                    message:
                        "Sangh logo not found."

                });

            }


            // =================================================
            // PDF DIRECTORY
            // =================================================

            const pdfDirectory =
                path.join(
                    projectRoot,
                    "backend",
                    "uploads",
                    "team-cards"
                );


            if (
                !fs.existsSync(
                    pdfDirectory
                )
            ) {

                fs.mkdirSync(
                    pdfDirectory,
                    {
                        recursive: true
                    }
                );

            }


            // =================================================
            // PDF FILE
            // =================================================

            const pdfFileName =
                `Team-Registration-Card-${team.registrationId}.pdf`;


            const pdfPath =
                path.join(
                    pdfDirectory,
                    pdfFileName
                );


            // =================================================
            // GENERATE / REGENERATE PDF
            // =================================================

            await createTeamRegistrationCard({

                outputPath:
                pdfPath,

                logoPath:
                logoPath,

                team:
                team

            });


            console.log(
                "Team PDF generated for download:",
                pdfPath
            );


            // =================================================
            // DOWNLOAD PDF
            // =================================================

            return res.download(
                pdfPath,
                pdfFileName,
                (downloadError) => {

                    if (downloadError) {

                        console.error(
                            "Team PDF download error:",
                            downloadError
                        );

                    }

                }
            );


        } catch (error) {

            console.error(
                "Team PDF Route Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to generate team registration PDF."

            });

        }

    }
);


// =====================================================
// GET: SINGLE TEAM
// OWNER OR ADMIN
// =====================================================

router.get(
    "/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const team =
                await Team.findById(
                    req.params.id
                )
                    .populate(
                        "tournamentId",
                        "tournamentName tournamentDate status"
                    )
                    .populate(
                        "createdBy",
                        "fullName email mobile"
                    );


            if (!team) {

                return res.status(404).json({
                    message:
                        "Team not found."
                });

            }


            const account =
                await Account.findById(
                    req.accountId
                ).select("role");


            const isAdmin =
                account &&
                account.role === "admin";


            const isOwner =
                String(
                    team.createdBy?._id
                ) ===
                String(
                    req.accountId
                );


            if (
                !isAdmin &&
                !isOwner
            ) {

                return res.status(403).json({

                    message:
                        "You are not authorized to view this team."

                });

            }


            return res.json({
                team
            });


        } catch (error) {

            console.error(
                "Get Team Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to load team."

            });

        }

    }
);


// =====================================================
// PUT: VERIFY / REJECT TEAM PAYMENT
// =====================================================

router.put(
    "/:id/payment-status",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const {
                paymentStatus
            } = req.body;


            if (
                ![
                    "Verified",
                    "Rejected"
                ].includes(
                    paymentStatus
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid payment status."
                });

            }


            const team =
                await Team.findById(
                    req.params.id
                );


            if (!team) {

                return res.status(404).json({
                    message:
                        "Team not found."
                });

            }


            team.paymentStatus =
                paymentStatus;


            if (
                paymentStatus ===
                "Rejected"
            ) {

                team.registrationStatus =
                    "Rejected";

            }


            await team.save();


            return res.json({

                message:
                    `Team payment ${paymentStatus.toLowerCase()} successfully.`,

                team

            });


        } catch (error) {

            console.error(
                "Team Payment Status Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to update team payment status."

            });

        }

    }
);


// =====================================================
// PUT: APPROVE / REJECT TEAM
// =====================================================

router.put(
    "/:id/status",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const {
                registrationStatus
            } = req.body;


            if (
                ![
                    "Approved",
                    "Rejected",
                    "Pending"
                ].includes(
                    registrationStatus
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid registration status."
                });

            }


            const team =
                await Team.findById(
                    req.params.id
                )
                    .populate(
                        "tournamentId",
                        "tournamentName tournamentDate"
                    );


            if (!team) {

                return res.status(404).json({
                    message:
                        "Team not found."
                });

            }


            // =================================================
            // APPROVAL REQUIRES VERIFIED PAYMENT
            // =================================================

            if (
                registrationStatus ===
                "Approved" &&
                team.paymentStatus !==
                "Verified"
            ) {

                return res.status(400).json({

                    message:
                        "Team payment must be verified before approval."

                });

            }


            const wasAlreadyApproved =
                team.registrationStatus ===
                "Approved";


            team.registrationStatus =
                registrationStatus;


            // =================================================
            // GENERATE REGISTRATION ID
            // =================================================

            if (
                registrationStatus ===
                "Approved" &&
                !team.registrationId
            ) {

                team.registrationId =
                    await getNextTeamRegistrationId();


                team.approvedAt =
                    new Date();

            }


            await team.save();


            // =================================================
            // STATUS FLAGS
            // =================================================

            let pdfGenerated =
                false;

            let emailSent =
                false;

            let pdfError =
                null;

            let emailError =
                null;


            // =================================================
            // APPROVAL EMAIL + PDF
            // =================================================

            if (
                registrationStatus ===
                "Approved" &&
                !wasAlreadyApproved
            ) {

                const projectRoot =
                    path.join(
                        __dirname,
                        "..",
                        ".."
                    );


                // =================================================
                // LOGO
                // =================================================

                const logoPath =
                    path.join(
                        projectRoot,
                        "images",
                        "logo.png"
                    );


                // =================================================
                // PDF DIRECTORY
                // =================================================

                const pdfDirectory =
                    path.join(
                        projectRoot,
                        "backend",
                        "uploads",
                        "team-cards"
                    );


                if (
                    !fs.existsSync(
                        pdfDirectory
                    )
                ) {

                    fs.mkdirSync(
                        pdfDirectory,
                        {
                            recursive: true
                        }
                    );

                }


                // =================================================
                // PDF PATH
                // =================================================

                const pdfFileName =
                    `${team.registrationId}.pdf`;


                const pdfPath =
                    path.join(
                        pdfDirectory,
                        pdfFileName
                    );


                // =================================================
                // CREATE PDF CARD
                // =================================================

                try {

                    await createTeamRegistrationCard({

                        outputPath:
                        pdfPath,

                        logoPath:
                        logoPath,

                        team:
                        team

                    });


                    pdfGenerated =
                        true;


                    console.log(
                        "Team registration card created:",
                        pdfPath
                    );


                } catch (error) {

                    pdfError =
                        error.message;


                    console.error(
                        "Team PDF creation error:",
                        error
                    );

                }


                // =================================================
                // APPROVAL EMAIL
                // =================================================

                const emailHtml = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

body {
    margin: 0;
    padding: 0;
    background: #f4f7fb;
    font-family: Arial, sans-serif;
}

.container {
    max-width: 650px;
    margin: 30px auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
        0 5px 20px
        rgba(0,0,0,0.08);
}

.header {
    background: #0b2341;
    color: #ffffff;
    padding: 25px;
    text-align: center;
}

.header img {
    width: 70px;
    height: 70px;
    object-fit: contain;
    margin-bottom: 10px;
}

.header h1 {
    margin: 5px 0;
    font-size: 24px;
}

.header p {
    margin: 5px 0;
    color: #f6a623;
    font-weight: bold;
}

.content {
    padding: 30px;
}

.success {
    color: #16803c;
    font-size: 22px;
    font-weight: bold;
    text-align: center;
}

.info-box {
    margin-top: 25px;
    background: #f7f9fc;
    border-left: 5px solid #f6a623;
    padding: 20px;
    border-radius: 8px;
}

.info-row {
    margin-bottom: 12px;
}

.label {
    color: #667085;
    font-size: 13px;
}

.value {
    color: #0b2341;
    font-weight: bold;
    font-size: 15px;
}

.registration-id {
    color: #f28c00;
    font-size: 20px;
    font-weight: bold;
}

.signatures {
    margin-top: 35px;
    display: flex;
    justify-content: space-between;
    gap: 30px;
}

.signature-box {
    width: 45%;
    text-align: center;
}

.signature-name {
    font-size: 17px;
    font-weight: bold;
    color: #0b2341;
    margin-bottom: 8px;
}

.signature-line {
    border-top: 1px solid #ccc;
    padding-top: 7px;
    font-size: 12px;
    color: #667085;
}

.footer {
    background: #0b2341;
    color: #ffffff;
    padding: 15px;
    text-align: center;
    font-size: 12px;
}

</style>

</head>

<body>

<div class="container">

<div class="header">

<img
    src="cid:gks-logo"
    alt="Ganwai Kabaddi Sangh"
>

<h1>
    Ganwai Kabaddi Sangh
</h1>

<p>
    Official Team Registration
</p>

</div>


<div class="content">

<div class="success">
    Congratulations!
</div>


<p>

Dear
<strong>
    ${team.captainName}
</strong>,

</p>


<p>

Your team registration has been
successfully approved by
Ganwai Kabaddi Sangh.

</p>


<div class="info-box">

<div class="info-row">

<div class="label">
    Team Name
</div>

<div class="value">
    ${team.teamName}
</div>

</div>


<div class="info-row">

<div class="label">
    Tournament
</div>

<div class="value">

${
                    team.tournamentId?.tournamentName ||
                    "Ganwai Kabaddi Sangh Tournament"
                }

</div>

</div>


<div class="info-row">

<div class="label">
    Registration ID
</div>

<div class="registration-id">
    ${team.registrationId}
</div>

</div>


<div class="info-row">

<div class="label">
    Players
</div>

<div class="value">
    ${team.players.length}
</div>

</div>


<div class="info-row">

<div class="label">
    Registration Status
</div>

<div class="value">
    Approved
</div>

</div>

</div>


<p style="margin-top:25px;">

Please keep your Registration ID
safe for future reference.

</p>


<div class="signatures">

<div class="signature-box">

<div class="signature-name">
    SHIVAM MISHRA
</div>

<div class="signature-line">

    Adhyaksh
    <br>
    Ganwai Kabaddi Sangh

</div>

</div>


<div class="signature-box">

<div class="signature-name">
    VISHWAJIT CHAUBEY
</div>

<div class="signature-line">

    Digital Platform Developer
    <br>
    Ganwai Kabaddi Sangh

</div>

</div>

</div>

</div>


<div class="footer">

Ganwai Kabaddi Sangh © 2026

</div>

</div>

</body>

</html>

`;


                // =================================================
                // SEND EMAIL
                // =================================================

                try {

                    const attachments = [

                        {
                            filename:
                                "logo.png",

                            path:
                            logoPath,

                            cid:
                                "gks-logo"
                        }

                    ];


                    // PDF attachment

                    if (
                        pdfGenerated &&
                        fs.existsSync(
                            pdfPath
                        )
                    ) {

                        attachments.push({

                            filename:
                                `Team-Registration-Card-${team.registrationId}.pdf`,

                            path:
                            pdfPath

                        });

                    }


                    await sendEmail({

                        to:
                        team.email,

                        subject:
                            `Team Registration Approved - ${team.registrationId}`,

                        html:
                        emailHtml,

                        attachments:
                        attachments

                    });


                    emailSent =
                        true;


                    console.log(
                        "Team approval email sent to:",
                        team.email
                    );


                } catch (error) {

                    emailError =
                        error.message;


                    console.error(
                        "Team approval email error:",
                        error
                    );

                }

            }


            // =================================================
            // RESPONSE
            // =================================================

            return res.json({

                message:
                    `Team registration ${registrationStatus.toLowerCase()} successfully.`,

                pdfGenerated,

                emailSent,

                pdfError,

                emailError,

                team

            });


        } catch (error) {

            console.error(
                "Team Status Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to update team registration status."

            });

        }

    }
);


// =====================================================
// DELETE TEAM
// =====================================================

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const team =
                await Team.findById(
                    req.params.id
                );


            if (!team) {

                return res.status(404).json({

                    message:
                        "Team not found."

                });

            }


            await Team.findByIdAndDelete(
                req.params.id
            );


            return res.json({

                message:
                    "Team deleted successfully."

            });


        } catch (error) {

            console.error(
                "Delete Team Error:",
                error
            );


            return res.status(500).json({

                message:
                    "Unable to delete team."

            });

        }

    }
);


module.exports = router;