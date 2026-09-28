const mongoose = require("mongoose");


const matchEventSchema = new mongoose.Schema(
    {
        type: {
            type: String,

            enum: [
                "Raid Point",
                "Tackle Point",
                "Bonus",
                "All-out",
                "Timeout",
                "Half-time",
                "Final Score"
            ],

            required: true
        },

        team: {
            type: String,
            trim: true,
            default: ""
        },

        points: {
            type: Number,
            min: 0,
            default: 0
        },

        note: {
            type: String,
            trim: true,
            default: ""
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);


const matchSchema = new mongoose.Schema(
    {
        tournamentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tournament",
            required: true
        },

        matchNumber: {
            type: String,
            required: true,
            trim: true
        },

        teamA: {
            type: String,
            required: true,
            trim: true
        },

        teamB: {
            type: String,
            required: true,
            trim: true
        },

        scoreA: {
            type: Number,
            default: 0,
            min: 0
        },

        scoreB: {
            type: Number,
            default: 0,
            min: 0
        },

        status: {
            type: String,

            enum: [
                "Upcoming",
                "Live",
                "Completed"
            ],

            default: "Upcoming"
        },

        matchType: {
            type: String,

            enum: [
                "League",
                "Quarter Final",
                "Semi Final",
                "Final"
            ],

            default: "League"
        },

        matchDate: {
            type: Date,
            required: true
        },

        venue: {
            type: String,
            trim: true
        },

        events: {
            type: [matchEventSchema],
            default: []
        }
    },

    {
        timestamps: true
    }
);


module.exports =
    mongoose.model(
        "Match",
        matchSchema
    );