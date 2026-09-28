const express = require("express");
const router = express.Router();

const Match = require("../models/Match");


// =====================================================
// GET ALL MATCHES
// =====================================================

router.get("/", async (req, res) => {

    try {

        const matches =
            await Match.find()
                .populate(
                    "tournamentId",
                    "tournamentName"
                )
                .sort({
                    matchDate: 1
                });


        res.status(200).json({
            matches
        });


    } catch (error) {

        console.error(
            "Get matches error:",
            error
        );


        res.status(500).json({
            message:
                "Server error."
        });

    }

});


// =====================================================
// GET LIVE MATCH
// =====================================================

router.get("/live", async (req, res) => {

    try {

        const liveMatch =
            await Match.findOne({
                status: "Live"
            })
                .populate(
                    "tournamentId",
                    "tournamentName"
                );


        res.status(200).json({
            match: liveMatch
        });


    } catch (error) {

        console.error(
            "Get live match error:",
            error
        );


        res.status(500).json({
            message:
                "Server error."
        });

    }

});


// =====================================================
// CREATE MATCH
// =====================================================

router.post("/create", async (req, res) => {

    try {

        const {
            tournamentId,
            matchNumber,
            teamA,
            teamB,
            matchType,
            matchDate,
            venue
        } = req.body;

        if (
            !tournamentId ||
            !matchNumber ||
            !teamA ||
            !teamB ||
            !matchType ||
            !matchDate
        ) {

            return res.status(400).json({
                message:
                    "Please fill all required match fields."
            });

        }


        if (
            teamA.trim().toLowerCase() ===
            teamB.trim().toLowerCase()
        ) {

            return res.status(400).json({
                message:
                    "Team A and Team B cannot be the same."
            });

        }


        const match =
            await Match.create({

                tournamentId,

                matchNumber:
                    matchNumber.trim(),

                teamA:
                    teamA.trim(),

                teamB:
                    teamB.trim(),

                scoreA: 0,

                scoreB: 0,

                status:
                    "Upcoming",

                matchType,

                matchDate,

                venue:
                    venue
                        ? venue.trim()
                        : ""

            });


        const populatedMatch =
            await Match.findById(
                match._id
            ).populate(
                "tournamentId",
                "tournamentName"
            );


        res.status(201).json({

            message:
                "Match created successfully.",

            match:
            populatedMatch

        });


    } catch (error) {

        console.error(
            "Create match error:",
            error
        );


        res.status(500).json({
            message:
                "Server error."
        });

    }

});


// =====================================================
// START LIVE MATCH
// =====================================================

router.put("/:id/start-live", async (req, res) => {

    try {

        const match =
            await Match.findById(
                req.params.id
            );


        if (!match) {

            return res.status(404).json({
                message:
                    "Match not found."
            });

        }


        if (match.status === "Completed") {

            return res.status(400).json({
                message:
                    "Completed match cannot be started again."
            });

        }


        await Match.updateMany(
            {
                status: "Live",
                _id: {
                    $ne: match._id
                }
            },
            {
                status:
                    "Completed"
            }
        );


        match.status =
            "Live";


        await match.save();


        res.status(200).json({

            message:
                "Match is now live.",

            match

        });


    } catch (error) {

        console.error(
            "Start live match error:",
            error
        );


        res.status(500).json({
            message:
                "Server error."
        });

    }

});


// =====================================================
// END LIVE MATCH
// =====================================================

router.put("/:id/end", async (req, res) => {

    try {

        const match =
            await Match.findById(
                req.params.id
            );


        if (!match) {

            return res.status(404).json({
                message:
                    "Match not found."
            });

        }


        if (match.status !== "Live") {

            return res.status(400).json({
                message:
                    "Only LIVE match can be ended."
            });

        }


        match.status =
            "Completed";


        await match.save();


        const completedMatch =
            await Match.findById(
                match._id
            ).populate(
                "tournamentId",
                "tournamentName"
            );


        res.status(200).json({

            message:
                "Match completed successfully.",

            match:
            completedMatch

        });


    } catch (error) {

        console.error(
            "End match error:",
            error
        );


        res.status(500).json({
            message:
                "Server error."
        });

    }

});


// =====================================================
// UPDATE MATCH SCORE
// =====================================================

router.put("/:id/score", async (req, res) => {

    try {

        const {
            scoreA,
            scoreB
        } = req.body;


        if (
            scoreA === undefined ||
            scoreB === undefined ||
            Number(scoreA) < 0 ||
            Number(scoreB) < 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid score."
            });

        }


        const match =
            await Match.findById(
                req.params.id
            );


        if (!match) {

            return res.status(404).json({
                message:
                    "Match not found."
            });

        }


        if (match.status !== "Live") {

            return res.status(400).json({
                message:
                    "Only live match score can be updated."
            });

        }


        match.scoreA =
            Number(scoreA);

        match.scoreB =
            Number(scoreB);


        await match.save();


        res.status(200).json({

            message:
                "Match score updated successfully.",

            match

        });


    } catch (error) {

        console.error(
            "Update match score error:",
            error
        );


        res.status(500).json({
            message:
                "Server error."
        });

    }

});


// =====================================================
// ADD LIVE MATCH EVENT
// =====================================================

router.post("/:id/events", async (req, res) => {

    try {

        const {
            type,
            team,
            points,
            note
        } = req.body;


        // -------------------------------------------------
        // VALID EVENT TYPES
        // -------------------------------------------------

        const validEventTypes = [
            "Raid Point",
            "Tackle Point",
            "Bonus",
            "All-out",
            "Timeout",
            "Half-time",
            "Final Score"
        ];


        if (!type) {

            return res.status(400).json({
                message:
                    "Event type is required."
            });

        }


        if (!validEventTypes.includes(type)) {

            return res.status(400).json({
                message:
                    "Invalid event type."
            });

        }


        // -------------------------------------------------
        // FIND MATCH
        // -------------------------------------------------

        const match =
            await Match.findById(
                req.params.id
            );


        if (!match) {

            return res.status(404).json({
                message:
                    "Match not found."
            });

        }


        // -------------------------------------------------
        // EVENT ONLY FOR LIVE MATCH
        // -------------------------------------------------

        if (match.status !== "Live") {

            return res.status(400).json({
                message:
                    "Events can only be added to a LIVE match."
            });

        }


        // -------------------------------------------------
        // TEAM VALIDATION
        // -------------------------------------------------

        const pointBasedEvents = [
            "Raid Point",
            "Tackle Point",
            "Bonus",
            "All-out"
        ];


        if (
            pointBasedEvents.includes(type) &&
            !team
        ) {

            return res.status(400).json({
                message:
                    "Team is required for this event."
            });

        }


        if (team) {

            const teamLower =
                team.trim().toLowerCase();


            const teamA =
                match.teamA
                    .trim()
                    .toLowerCase();


            const teamB =
                match.teamB
                    .trim()
                    .toLowerCase();


            if (
                teamLower !== teamA &&
                teamLower !== teamB
            ) {

                return res.status(400).json({
                    message:
                        "Invalid team for this match."
                });

            }

        }


        // -------------------------------------------------
        // POINT VALIDATION
        // -------------------------------------------------

        let eventPoints =
            Number(points || 0);


        if (
            Number.isNaN(eventPoints) ||
            eventPoints < 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid event points."
            });

        }


        if (
            pointBasedEvents.includes(type) &&
            eventPoints <= 0
        ) {

            return res.status(400).json({
                message:
                    "Points must be greater than 0 for this event."
            });

        }


        // -------------------------------------------------
        // CREATE EVENT
        // -------------------------------------------------

        const newEvent = {

            type,

            team:
                team
                    ? team.trim()
                    : "",

            points:
            eventPoints,

            note:
                note
                    ? note.trim()
                    : "",

            createdAt:
                new Date()

        };


        match.events.push(
            newEvent
        );


        // -------------------------------------------------
        // AUTOMATIC SCORE UPDATE
        // -------------------------------------------------

        if (
            pointBasedEvents.includes(type)
        ) {

            if (
                team.trim().toLowerCase() ===
                match.teamA.trim().toLowerCase()
            ) {

                match.scoreA +=
                    eventPoints;

            } else {

                match.scoreB +=
                    eventPoints;

            }

        }


        await match.save();


        res.status(201).json({

            message:
                "Match event added successfully.",

            event:
                match.events[
                match.events.length - 1
                    ],

            match

        });


    } catch (error) {

        console.error(
            "Add match event error:",
            error
        );


        res.status(500).json({
            message:
                "Server error."
        });

    }

});


// =====================================================
// GET SINGLE MATCH
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const match =
            await Match.findById(
                req.params.id
            )
                .populate(
                    "tournamentId",
                    "tournamentName"
                );


        if (!match) {

            return res.status(404).json({
                message:
                    "Match not found."
            });

        }


        res.status(200).json({
            match
        });


    } catch (error) {

        console.error(
            "Get match error:",
            error
        );


        res.status(500).json({
            message:
                "Server error."
        });

    }

});


// =====================================================
// DELETE MATCH
// =====================================================

router.delete("/:id", async (req, res) => {

    try {

        const match =
            await Match.findById(
                req.params.id
            );


        if (!match) {

            return res.status(404).json({
                message:
                    "Match not found."
            });

        }


        await Match.findByIdAndDelete(
            req.params.id
        );


        res.status(200).json({
            message:
                "Match deleted successfully."
        });


    } catch (error) {

        console.error(
            "Delete match error:",
            error
        );


        res.status(500).json({
            message:
                "Server error."
        });

    }

});


module.exports = router;