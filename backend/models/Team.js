const mongoose = require("mongoose");


// =====================================================
// PLAYER SCHEMA
// =====================================================

const playerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        dob: {
            type: Date,
            required: true
        },

        gender: {
            type: String,
            enum: [
                "Male",
                "Female",
                "Other"
            ],
            required: true
        },

        weight: {
            type: Number,
            required: true,
            min: 0
        },

        mobile: {
            type: String,
            required: true,
            trim: true
        },

        photo: {
            type: String,
            required: true
        },

        membershipId: {
            type: String,
            trim: true
        },

        playerRole: {
            type: String,
            enum: [
                "Raider",
                "Defender",
                "All-rounder"
            ]
        },

        jerseyNumber: {
            type: Number,
            min: 0
        }
    }
);


// =====================================================
// TEAM SCHEMA
// =====================================================

const teamSchema = new mongoose.Schema(
    {

        // =================================================
        // TEAM INFORMATION
        // =================================================

        teamName: {
            type: String,
            required: true,
            trim: true
        },

        captainName: {
            type: String,
            required: true,
            trim: true
        },

        captainMobile: {
            type: String,
            required: true,
            trim: true
        },


        // =================================================
        // TEAM EMAIL
        // =================================================

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },


        // =================================================
        // LOCATION
        // =================================================

        location: {
            type: String,
            required: true,
            trim: true
        },


        // =================================================
        // TEAM LOGO
        // =================================================

        teamLogo: {
            type: String
        },


        // =================================================
        // TOURNAMENT
        // =================================================

        tournamentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tournament",
            required: true
        },


        // =================================================
        // PLAYERS
        // Maximum 15 Players
        // =================================================

        players: {
            type: [playerSchema],
            required: true,
            validate: {
                validator: function (players) {
                    return (
                        Array.isArray(players) &&
                        players.length >= 1 &&
                        players.length <= 15
                    );
                },
                message:
                    "A team must have between 1 and 15 players."
            }
        },


        // =================================================
        // REGISTRATION FEE
        // Fixed Team Registration Fee = ₹51
        // =================================================

        registrationFee: {
            type: Number,
            required: true,
            default: 51,
            enum: [51]
        },


        // =================================================
        // PAYMENT REFERENCE / UTR
        // =================================================

        paymentReference: {
            type: String,
            required: true,
            trim: true
        },


        // =================================================
        // PAYMENT STATUS
        // =================================================

        paymentStatus: {
            type: String,
            enum: [
                "Pending Verification",
                "Verified",
                "Rejected"
            ],
            default: "Pending Verification"
        },


        // =================================================
        // TEAM REGISTRATION STATUS
        // =================================================

        registrationStatus: {
            type: String,
            enum: [
                "Pending",
                "Approved",
                "Rejected"
            ],
            default: "Pending"
        },


        // =================================================
        // TEAM REGISTRATION ID
        // Generated After Approval
        // Example:
        // GKS-TEAM-2026-0001
        // =================================================

        registrationId: {
            type: String,
            unique: true,
            sparse: true
        },


        // =================================================
        // APPROVAL DATE
        // =================================================

        approvedAt: {
            type: Date
        },


        // =================================================
        // CREATED BY ACCOUNT
        // Automatically Taken From Logged-in Account
        // =================================================

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


// =====================================================
// EXPORT MODEL
// =====================================================

module.exports =
    mongoose.model(
        "Team",
        teamSchema
    );