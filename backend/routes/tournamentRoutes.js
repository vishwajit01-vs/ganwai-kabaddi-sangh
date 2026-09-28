const express = require("express");

const Tournament = require("../models/Tournament");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// ======================================================
// ALLOWED TOURNAMENT STATUSES
// ======================================================

const allowedStatuses = [
    "Upcoming",
    "Registration Open",
    "Ongoing",
    "Completed",
    "Cancelled"
];


// ======================================================
// DATE VALIDATION HELPER
// ======================================================

function isValidDate(value) {

    if (!value) {
        return false;
    }

    const date = new Date(value);

    return !isNaN(date.getTime());

}


// ======================================================
// CREATE TOURNAMENT — ADMIN ONLY
// ======================================================

router.post(
    "/create",
    authMiddleware,
    adminMiddleware,

    async (req, res) => {

        try {

            const {
                tournamentName,
                description,
                tournamentDate,
                venue,
                location,
                status,
                registrationStartDate,
                registrationEndDate
            } = req.body;


            // ------------------------------------------------
            // REQUIRED FIELDS
            // ------------------------------------------------

            if (
                !tournamentName ||
                !tournamentName.trim() ||
                !tournamentDate ||
                !venue ||
                !venue.trim() ||
                !location ||
                !location.trim()
            ) {

                return res.status(400).json({

                    message:
                        "Tournament name, date, venue and location are required."

                });

            }


            // ------------------------------------------------
            // TOURNAMENT DATE
            // ------------------------------------------------

            if (!isValidDate(tournamentDate)) {

                return res.status(400).json({

                    message:
                        "Invalid tournament date."

                });

            }


            // ------------------------------------------------
            // STATUS
            // ------------------------------------------------

            const tournamentStatus =
                status || "Upcoming";


            if (
                !allowedStatuses.includes(
                    tournamentStatus
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid tournament status."

                });

            }


            // ------------------------------------------------
            // REGISTRATION DATES
            // ------------------------------------------------

            if (
                registrationStartDate &&
                !isValidDate(
                    registrationStartDate
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid registration start date."

                });

            }


            if (
                registrationEndDate &&
                !isValidDate(
                    registrationEndDate
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid registration end date."

                });

            }


            if (
                registrationStartDate &&
                registrationEndDate
            ) {

                const startDate =
                    new Date(
                        registrationStartDate
                    );

                const endDate =
                    new Date(
                        registrationEndDate
                    );


                if (startDate > endDate) {

                    return res.status(400).json({

                        message:
                            "Registration start date cannot be after registration end date."

                    });

                }

            }


            // ------------------------------------------------
            // CREATE TOURNAMENT
            // ------------------------------------------------

            const tournament =
                new Tournament({

                    tournamentName:
                        tournamentName.trim(),

                    description:
                        description
                            ? description.trim()
                            : "",

                    tournamentDate:
                        new Date(tournamentDate),

                    venue:
                        venue.trim(),

                    location:
                        location.trim(),

                    status:
                    tournamentStatus,

                    registrationStartDate:
                        registrationStartDate
                            ? new Date(
                                registrationStartDate
                            )
                            : undefined,

                    registrationEndDate:
                        registrationEndDate
                            ? new Date(
                                registrationEndDate
                            )
                            : undefined,

                    createdBy:
                    req.accountId

                });


            await tournament.save();


            return res.status(201).json({

                message:
                    "Tournament created successfully.",

                tournament

            });

        }

        catch (error) {

            console.error(
                "Create tournament error:",
                error
            );

            return res.status(500).json({

                message:
                    "Server error while creating tournament."

            });

        }

    }
);


// ======================================================
// GET ALL TOURNAMENTS — PUBLIC
// ======================================================

router.get(
    "/",

    async (req, res) => {

        try {

            const tournaments =
                await Tournament.find()
                    .sort({
                        tournamentDate: 1
                    });


            return res.status(200).json({

                tournaments

            });

        }

        catch (error) {

            console.error(
                "Get tournaments error:",
                error
            );

            return res.status(500).json({

                message:
                    "Server error while fetching tournaments."

            });

        }

    }
);


// ======================================================
// GET SINGLE TOURNAMENT — PUBLIC
// ======================================================

router.get(
    "/:id",

    async (req, res) => {

        try {

            const tournament =
                await Tournament.findById(
                    req.params.id
                );


            if (!tournament) {

                return res.status(404).json({

                    message:
                        "Tournament not found."

                });

            }


            return res.status(200).json({

                tournament

            });

        }

        catch (error) {

            console.error(
                "Get tournament error:",
                error
            );

            return res.status(500).json({

                message:
                    "Server error while fetching tournament."

            });

        }

    }
);


// ======================================================
// UPDATE TOURNAMENT — ADMIN ONLY
// ======================================================

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,

    async (req, res) => {

        try {

            const {
                tournamentName,
                description,
                tournamentDate,
                venue,
                location,
                status,
                registrationStartDate,
                registrationEndDate
            } = req.body;


            const tournament =
                await Tournament.findById(
                    req.params.id
                );


            if (!tournament) {

                return res.status(404).json({

                    message:
                        "Tournament not found."

                });

            }


            // ------------------------------------------------
            // TOURNAMENT NAME
            // ------------------------------------------------

            if (tournamentName !== undefined) {

                if (
                    !tournamentName ||
                    !tournamentName.trim()
                ) {

                    return res.status(400).json({

                        message:
                            "Tournament name cannot be empty."

                    });

                }

                tournament.tournamentName =
                    tournamentName.trim();

            }


            // ------------------------------------------------
            // DESCRIPTION
            // ------------------------------------------------

            if (description !== undefined) {

                tournament.description =
                    description
                        ? description.trim()
                        : "";

            }


            // ------------------------------------------------
            // TOURNAMENT DATE
            // ------------------------------------------------

            if (tournamentDate !== undefined) {

                if (
                    !isValidDate(
                        tournamentDate
                    )
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid tournament date."

                    });

                }

                tournament.tournamentDate =
                    new Date(
                        tournamentDate
                    );

            }


            // ------------------------------------------------
            // VENUE
            // ------------------------------------------------

            if (venue !== undefined) {

                if (
                    !venue ||
                    !venue.trim()
                ) {

                    return res.status(400).json({

                        message:
                            "Venue cannot be empty."

                    });

                }

                tournament.venue =
                    venue.trim();

            }


            // ------------------------------------------------
            // LOCATION
            // ------------------------------------------------

            if (location !== undefined) {

                if (
                    !location ||
                    !location.trim()
                ) {

                    return res.status(400).json({

                        message:
                            "Location cannot be empty."

                    });

                }

                tournament.location =
                    location.trim();

            }


            // ------------------------------------------------
            // STATUS
            // ------------------------------------------------

            if (status !== undefined) {

                if (
                    !allowedStatuses.includes(
                        status
                    )
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid tournament status."

                    });

                }

                tournament.status =
                    status;

            }


            // ------------------------------------------------
            // REGISTRATION START DATE
            // ------------------------------------------------

            if (
                registrationStartDate !==
                undefined
            ) {

                if (
                    registrationStartDate &&
                    !isValidDate(
                        registrationStartDate
                    )
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid registration start date."

                    });

                }

                tournament.registrationStartDate =
                    registrationStartDate
                        ? new Date(
                            registrationStartDate
                        )
                        : undefined;

            }


            // ------------------------------------------------
            // REGISTRATION END DATE
            // ------------------------------------------------

            if (
                registrationEndDate !==
                undefined
            ) {

                if (
                    registrationEndDate &&
                    !isValidDate(
                        registrationEndDate
                    )
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid registration end date."

                    });

                }

                tournament.registrationEndDate =
                    registrationEndDate
                        ? new Date(
                            registrationEndDate
                        )
                        : undefined;

            }


            // ------------------------------------------------
            // REGISTRATION DATE ORDER
            // ------------------------------------------------

            if (
                tournament.registrationStartDate &&
                tournament.registrationEndDate
            ) {

                if (
                    tournament.registrationStartDate >
                    tournament.registrationEndDate
                ) {

                    return res.status(400).json({

                        message:
                            "Registration start date cannot be after registration end date."

                    });

                }

            }


            await tournament.save();


            return res.status(200).json({

                message:
                    "Tournament updated successfully.",

                tournament

            });

        }

        catch (error) {

            console.error(
                "Update tournament error:",
                error
            );

            return res.status(500).json({

                message:
                    "Server error while updating tournament."

            });

        }

    }
);


// ======================================================
// DELETE TOURNAMENT — ADMIN ONLY
// ======================================================

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,

    async (req, res) => {

        try {

            const tournament =
                await Tournament.findByIdAndDelete(
                    req.params.id
                );


            if (!tournament) {

                return res.status(404).json({

                    message:
                        "Tournament not found."

                });

            }


            return res.status(200).json({

                message:
                    "Tournament deleted successfully."

            });

        }

        catch (error) {

            console.error(
                "Delete tournament error:",
                error
            );

            return res.status(500).json({

                message:
                    "Server error while deleting tournament."

            });

        }

    }
);


module.exports = router;