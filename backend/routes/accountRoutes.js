const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Account = require("../models/Account");
const authMiddleware = require("../middleware/authMiddleware");
const profileUpload = require("../config/profileUpload");

const router = express.Router();

// ================= SIGNUP =================

router.post(
    "/signup",
    profileUpload.single("profilePhoto"),
    async (req, res) => {

        try {

            const {
                fullName,
                mobile,
                email,
                password
            } = req.body;

            const profilePhoto =
                req.file
                    ? `/uploads/profile-photos/${req.file.filename}`
                    : "";

            const existingAccount =
                await Account.findOne({ email });

            if (existingAccount) {

                return res.status(400).json({
                    message:
                        "An account with this email already exists."
                });

            }

            const account = new Account({
                fullName,
                mobile,
                email,
                password,
                profilePhoto
            });

            await account.save();

            res.status(201).json({
                message:
                    "Account created successfully!"
            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Account creation failed",
                error: error.message
            });

        }

    }
);


// ================= LOGIN =================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const account =
            await Account.findOne({ email });

        if (!account) {

            return res.status(401).json({
                message:
                    "Invalid email or password."
            });

        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                account.password
            );

        if (!passwordMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password."
            });

        }

        const token =
            jwt.sign(
                {
                    accountId: account._id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        res.status(200).json({

            message:
                "Login successful!",

            token,

            account: {
                id: account._id,
                fullName: account.fullName,
                email: account.email,
                mobile: account.mobile,
                profilePhoto: account.profilePhoto
            }

        });

    } catch (error) {

        res.status(500).json({
            message:
                "Login failed",
            error: error.message
        });

    }

});


// ================= PROTECTED ACCOUNT =================

router.get(
    "/me",
    authMiddleware,
    async (req, res) => {

        try {

            const account =
                await Account.findById(
                    req.accountId
                ).select("-password");

            if (!account) {

                return res.status(404).json({
                    message:
                        "Account not found."
                });

            }

            res.status(200).json({
                account
            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Unable to fetch account details."
            });

        }

    }
);


module.exports = router;