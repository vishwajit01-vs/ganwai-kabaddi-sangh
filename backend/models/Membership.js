const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({

    // ==========================================
    // ACCOUNT LINK
    // ==========================================

    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true
    },

    // ==========================================
    // MEMBER DETAILS
    // ==========================================

    fullName: {
        type: String,
        required: true
    },

    fatherName: {
        type: String,
        required: true
    },

    dob: {
        type: Date,
        required: true
    },

    mobile: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
    },

    photo: {
        type: String,
        required: true
    },

    identityProof: {
        type: String,
        required: true
    },

    // ==========================================
    // STABLE MEMBER NUMBER
    // ==========================================

    memberNumber: {
        type: Number,
        unique: true,
        sparse: true
    },

    // ==========================================
    // PAYMENT
    // ==========================================

    paymentStatus: {
        type: String,
        enum: [
            "Pending Verification",
            "Verified",
            "Rejected"
        ],
        default: "Pending Verification"
    },

    paymentReference: {
        type: String,
        required: true
    },

    // ==========================================
    // MEMBERSHIP STATUS
    // ==========================================

    membershipStatus: {
        type: String,
        enum: [
            "Pending Verification",
            "Approved",
            "Rejected"
        ],
        default: "Pending Verification"
    },

    // ==========================================
    // CURRENT MEMBERSHIP ID
    // ==========================================

    membershipId: {
        type: String,
        unique: true,
        sparse: true
    },

    // ==========================================
    // MEMBERSHIP YEAR
    // ==========================================

    membershipYear: {
        type: Number
    },

    // ==========================================
    // MEMBERSHIP VALIDITY
    // ==========================================

    membershipValidity: {
        type: String,
        default: "Annual"
    },

    // ==========================================
    // RENEWAL INFORMATION
    // ==========================================

    lastRenewalDate: {
        type: Date
    },

    nextRenewalDate: {
        type: Date
    },

    // ==========================================
    // RENEWAL PAYMENT
    // ==========================================

    renewalPaymentReference: {
        type: String
    },

    renewalPaymentStatus: {
        type: String,
        enum: [
            "Not Required",
            "Pending Verification",
            "Verified",
            "Rejected"
        ],
        default: "Not Required"
    },

    // ==========================================
    // RENEWAL STATUS
    // ==========================================

    renewalStatus: {
        type: String,
        enum: [
            "Not Due",
            "Due",
            "Pending Verification",
            "Approved"
        ],
        default: "Not Due"
    }

}, {
    timestamps: true
});

module.exports =
    mongoose.model(
        "Membership",
        membershipSchema
    );