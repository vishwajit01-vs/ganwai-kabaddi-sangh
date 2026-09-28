const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const Membership = require("../models/Membership");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================================
// UPLOAD DIRECTORIES
// ======================================================

const projectRoot = path.join(__dirname, "..", "..");

const photoDir = path.join(
    __dirname,
    "..",
    "uploads",
    "photos"
);

const identityDir = path.join(
    __dirname,
    "..",
    "uploads",
    "identity"
);

fs.mkdirSync(photoDir, { recursive: true });
fs.mkdirSync(identityDir, { recursive: true });


// ======================================================
// MULTER STORAGE
// ======================================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        if (file.fieldname === "photo") {
            cb(null, photoDir);
        }

        else if (file.fieldname === "identityProof") {
            cb(null, identityDir);
        }

        else {
            cb(new Error("Invalid file field"));
        }
    },

    filename: function (req, file, cb) {

        const extension =
            path.extname(file.originalname);

        const fileName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            extension;

        cb(null, fileName);
    }

});


// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = function (req, file, cb) {

    if (file.fieldname === "photo") {

        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png"
        ) {
            cb(null, true);
        }

        else {
            cb(
                new Error(
                    "Photo must be JPG or PNG."
                )
            );
        }

    }

    else if (file.fieldname === "identityProof") {

        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "application/pdf"
        ) {
            cb(null, true);
        }

        else {
            cb(
                new Error(
                    "Identity proof must be JPG, PNG or PDF."
                )
            );
        }

    }

    else {
        cb(
            new Error("Invalid file field.")
        );
    }

};


// ======================================================
// MULTER
// ======================================================

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 2 * 1024 * 1024
    }

});


// ======================================================
// GENERATE UNIQUE MEMBERSHIP ID
// ======================================================

async function generateUniqueMembershipId(year) {

    let membershipId;
    let exists = true;

    while (exists) {

        const randomNumber =
            Math.floor(
                100 + Math.random() * 900
            );

        const membershipNumber =
            `00${randomNumber}`;

        membershipId =
            `GKS-${year}-${membershipNumber}`;

        exists =
            await Membership.findOne({
                membershipId: membershipId
            });
    }

    return membershipId;
}


// ======================================================
// APPLY FOR MEMBERSHIP
// ======================================================

router.post(
    "/apply",
    authMiddleware,

    upload.fields([
        {
            name: "photo",
            maxCount: 1
        },
        {
            name: "identityProof",
            maxCount: 1
        }
    ]),

    async (req, res) => {

        try {

            const {
                fullName,
                fatherName,
                dob,
                mobile,
                email,
                address,
                paymentReference
            } = req.body;


            // ------------------------------------------------
            // FILES
            // ------------------------------------------------

            const photoFile =
                req.files &&
                req.files.photo &&
                req.files.photo[0];

            const identityFile =
                req.files &&
                req.files.identityProof &&
                req.files.identityProof[0];


            // ------------------------------------------------
            // REQUIRED FIELD VALIDATION
            // ------------------------------------------------

            if (
                !fullName ||
                !fatherName ||
                !dob ||
                !mobile ||
                !address ||
                !paymentReference ||
                !photoFile ||
                !identityFile
            ) {

                return res.status(400).json({

                    message:
                        "All membership fields, payment reference, photo and identity proof are required."

                });
            }


            // ------------------------------------------------
            // AGE VALIDATION
            // ------------------------------------------------

            const birthDate =
                new Date(dob);

            const today =
                new Date();

            let age =
                today.getFullYear() -
                birthDate.getFullYear();

            const monthDifference =
                today.getMonth() -
                birthDate.getMonth();

            if (
                monthDifference < 0 ||
                (
                    monthDifference === 0 &&
                    today.getDate() < birthDate.getDate()
                )
            ) {
                age--;
            }


            if (
                isNaN(birthDate.getTime()) ||
                age < 18
            ) {

                return res.status(400).json({

                    message:
                        "Member must be at least 18 years old."

                });
            }


            // ------------------------------------------------
            // UTR VALIDATION
            // ------------------------------------------------

            const utr =
                paymentReference.trim();


            if (
                !/^\d{12}$/.test(utr)
            ) {

                return res.status(400).json({

                    message:
                        "Invalid UTR. UTR must contain exactly 12 digits."

                });
            }


            // ------------------------------------------------
            // DUPLICATE UTR PROTECTION
            // ------------------------------------------------

            const existingPayment =
                await Membership.findOne({

                    $or: [

                        {
                            paymentReference:
                            utr
                        },

                        {
                            renewalPaymentReference:
                            utr
                        }

                    ]

                });


            if (existingPayment) {

                return res.status(400).json({

                    message:
                        "This UTR has already been used."

                });
            }


            // ------------------------------------------------
            // CHECK EXISTING APPLICATION
            // ------------------------------------------------

            const existingMembership =
                await Membership.findOne({

                    accountId:
                    req.accountId

                });


            if (existingMembership) {

                return res.status(400).json({

                    message:
                        "Membership application already exists for this account."

                });
            }


            // ------------------------------------------------
            // CURRENT YEAR
            // ------------------------------------------------

            const currentYear =
                new Date().getFullYear();


            // ------------------------------------------------
            // MEMBER NUMBER
            // ------------------------------------------------

            const lastMember =
                await Membership.findOne({
                    memberNumber: {
                        $exists: true
                    }
                })
                    .sort({
                        memberNumber: -1
                    });


            const memberNumber =
                lastMember
                    ? lastMember.memberNumber + 1
                    : 1;


            // ------------------------------------------------
            // MEMBERSHIP ID
            // ------------------------------------------------

            const membershipId =
                await generateUniqueMembershipId(
                    currentYear
                );


            // ------------------------------------------------
            // DATES
            // ------------------------------------------------

            const applicationDate =
                new Date();

            const nextRenewalDate =
                new Date(applicationDate);

            nextRenewalDate.setFullYear(
                nextRenewalDate.getFullYear() + 1
            );


            // ------------------------------------------------
            // FILE PATHS
            // ------------------------------------------------

            const photoPath =
                path.join(
                    "backend",
                    "uploads",
                    "photos",
                    photoFile.filename
                );

            const identityPath =
                path.join(
                    "backend",
                    "uploads",
                    "identity",
                    identityFile.filename
                );


            // ------------------------------------------------
            // CREATE MEMBERSHIP
            // ------------------------------------------------

            const membership =
                new Membership({

                    accountId:
                    req.accountId,

                    fullName:
                        fullName.trim(),

                    fatherName:
                        fatherName.trim(),

                    dob:
                    birthDate,

                    mobile:
                        mobile.trim(),

                    email: email.trim(),

                    address:
                        address.trim(),

                    photo:
                    photoPath,

                    identityProof:
                    identityPath,

                    memberNumber:
                    memberNumber,

                    paymentStatus:
                        "Pending Verification",

                    paymentReference:
                    utr,

                    membershipStatus:
                        "Pending Verification",

                    membershipId:
                    membershipId,

                    membershipYear:
                    currentYear,

                    membershipValidity:
                        "Annual",

                    lastRenewalDate:
                    applicationDate,

                    nextRenewalDate:
                    nextRenewalDate,

                    renewalPaymentStatus:
                        "Not Required",

                    renewalStatus:
                        "Not Due"

                });


            await membership.save();


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            return res.status(201).json({

                message:
                    "Membership application submitted successfully. Payment verification is pending.",

                membershipId:
                membership.membershipId

            });

        }

        catch (error) {

            console.error(
                "Membership application error:",
                error
            );

            return res.status(500).json({

                message:
                    "Server error while submitting membership application."

            });

        }

    }
);


// ======================================================
// MY MEMBERSHIP
// ======================================================

router.get(
    "/my-membership",
    authMiddleware,

    async (req, res) => {

        try {

            const membership =
                await Membership.findOne({

                    accountId:
                    req.accountId

                });


            if (!membership) {

                return res.status(404).json({

                    message:
                        "No membership found."

                });
            }


            // ------------------------------------------------
            // CHECK RENEWAL DUE
            // ------------------------------------------------

            if (
                membership.membershipStatus ===
                "Approved"
            ) {

                const today =
                    new Date();

                if (
                    membership.nextRenewalDate &&
                    today >=
                    membership.nextRenewalDate &&
                    membership.renewalStatus !==
                    "Pending Verification"
                ) {

                    membership.renewalStatus =
                        "Due";

                    await membership.save();

                }

            }


            return res.status(200).json({

                membership

            });

        }

        catch (error) {

            console.error(
                "My membership error:",
                error
            );

            return res.status(500).json({

                message:
                    "Server error."

            });

        }

    }
);


// ======================================================
// MEMBERSHIP RENEWAL
// ======================================================

router.post(
    "/renew",
    authMiddleware,

    async (req, res) => {

        try {

            const {
                renewalPaymentReference
            } = req.body;


            // ------------------------------------------------
            // REQUIRED UTR
            // ------------------------------------------------

            if (
                !renewalPaymentReference
            ) {

                return res.status(400).json({

                    message:
                        "Renewal payment UTR is required."

                });
            }


            // ------------------------------------------------
            // UTR VALIDATION
            // ------------------------------------------------

            const renewalUtr =
                renewalPaymentReference.trim();


            if (
                !/^\d{12}$/.test(renewalUtr)
            ) {

                return res.status(400).json({

                    message:
                        "Invalid renewal UTR. UTR must contain exactly 12 digits."

                });
            }


            // ------------------------------------------------
            // FIND MEMBERSHIP
            // ------------------------------------------------

            const membership =
                await Membership.findOne({

                    accountId:
                    req.accountId

                });


            if (!membership) {

                return res.status(404).json({

                    message:
                        "Membership not found."

                });
            }


            // ------------------------------------------------
            // MEMBERSHIP STATUS
            // ------------------------------------------------

            if (
                membership.membershipStatus !==
                "Approved"
            ) {

                return res.status(400).json({

                    message:
                        "Only approved members can renew membership."

                });
            }


            // ------------------------------------------------
            // DUPLICATE PENDING RENEWAL
            // ------------------------------------------------

            if (
                membership.renewalPaymentStatus ===
                "Pending Verification"
            ) {

                return res.status(400).json({

                    message:
                        "Renewal payment is already pending verification."

                });
            }


            // ------------------------------------------------
            // RENEWAL DATE CHECK
            // ------------------------------------------------

            const today =
                new Date();


            if (
                membership.nextRenewalDate &&
                today <
                membership.nextRenewalDate
            ) {

                return res.status(400).json({

                    message:
                        "Membership renewal is not due yet."

                });
            }


            // ------------------------------------------------
            // DUPLICATE UTR PROTECTION
            // ------------------------------------------------

            const existingPayment =
                await Membership.findOne({

                    $or: [

                        {
                            paymentReference:
                            renewalUtr
                        },

                        {
                            renewalPaymentReference:
                            renewalUtr
                        }

                    ]

                });


            if (existingPayment) {

                return res.status(400).json({

                    message:
                        "This UTR has already been used."

                });
            }


            // ------------------------------------------------
            // SAVE RENEWAL
            // ------------------------------------------------

            membership.renewalPaymentReference =
                renewalUtr;

            membership.renewalPaymentStatus =
                "Pending Verification";

            membership.renewalStatus =
                "Pending Verification";


            await membership.save();


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            return res.status(200).json({

                message:
                    "Renewal payment submitted successfully. Verification is pending."

            });

        }

        catch (error) {

            console.error(
                "Renewal error:",
                error
            );

            return res.status(500).json({

                message:
                    "Server error during membership renewal."

            });

        }

    }
);


// ======================================================
// PUBLIC MEMBERSHIP VERIFICATION
// ======================================================

router.get(
    "/verify/:membershipId",

    async (req, res) => {

        try {

            const membership =
                await Membership.findOne({

                    membershipId:
                    req.params.membershipId,

                    membershipStatus:
                        "Approved"

                }).select(

                    "fullName membershipId membershipYear membershipValidity membershipStatus nextRenewalDate"

                );


            if (!membership) {

                return res.status(404).json({

                    verified: false,

                    message:
                        "Membership not found or not approved."

                });
            }


            return res.status(200).json({

                verified: true,

                membership

            });

        }

        catch (error) {

            console.error(
                "Verification error:",
                error
            );

            return res.status(500).json({

                verified: false,

                message:
                    "Server error during verification."

            });

        }

    }
);


// ======================================================
// MULTER ERROR HANDLER
// ======================================================

router.use(
    (error, req, res, next) => {

        if (
            error instanceof multer.MulterError
        ) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({

                    message:
                        "File size must not exceed 2MB."

                });

            }

            return res.status(400).json({

                message:
                error.message

            });

        }


        if (error) {

            return res.status(400).json({

                message:
                error.message

            });

        }


        next();

    }
);


module.exports = router;