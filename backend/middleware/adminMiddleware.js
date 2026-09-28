const jwt = require("jsonwebtoken");
const Account = require("../models/Account");

const adminMiddleware = async (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                message:
                    "Authentication required."
            });

        }


        const token =
            authHeader.split(" ")[1];

        if (!token) {

            return res.status(401).json({
                message:
                    "Authentication token missing."
            });

        }


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        const account =
            await Account.findById(
                decoded.accountId
            );


        if (!account) {

            return res.status(404).json({
                message:
                    "Account not found."
            });

        }


        if (account.role !== "admin") {

            return res.status(403).json({
                message:
                    "Admin access required."
            });

        }


        req.accountId =
            account._id;

        req.admin =
            account;

        next();


    } catch (error) {

        console.error(
            "Admin Middleware Error:",
            error
        );

        return res.status(401).json({
            message:
                "Invalid or expired authentication token."
        });

    }

};


module.exports =
    adminMiddleware;