const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
    {

        tournamentName: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        tournamentDate: {
            type: Date,
            required: true
        },

        venue: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "Upcoming",
                "Registration Open",
                "Ongoing",
                "Completed",
                "Cancelled"
            ],
            default: "Upcoming"
        },

        registrationStartDate: {
            type: Date
        },

        registrationEndDate: {
            type: Date
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true
        }

    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Tournament",
        tournamentSchema
    );