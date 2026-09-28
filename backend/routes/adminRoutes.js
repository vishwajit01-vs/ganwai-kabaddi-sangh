const express = require("express");
const Membership = require("../models/Membership");
const Account = require("../models/Account");
const adminMiddleware = require("../middleware/adminMiddleware");

const membershipCard =
    require("../pdf/membershipCard");

const generateMembershipCard =
    membershipCard;

const createMembershipCardBuffer =
    membershipCard.createMembershipCardBuffer;

const { sendEmail } =
    require("../config/mailer");

const router = express.Router();


// ======================================================
// GET ALL MEMBERSHIPS
// ======================================================

router.get(
    "/memberships",
    adminMiddleware,
    async (req, res) => {

        try {

            const memberships =
                await Membership.find()
                    .sort({ createdAt: -1 });

            memberships.forEach(
                (membership) => {

                    if (!membership.paymentStatus) {
                        membership.paymentStatus =
                            "Pending Verification";
                    }

                    if (!membership.renewalPaymentStatus) {
                        membership.renewalPaymentStatus =
                            "Not Required";
                    }

                    if (!membership.renewalStatus) {
                        membership.renewalStatus =
                            "Not Due";
                    }

                }
            );

            res.status(200).json({
                memberships
            });

        } catch (error) {

            console.error(
                "Admin Membership Fetch Error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to fetch membership applications."
            });

        }

    }
);


// ======================================================
// VERIFY INITIAL PAYMENT
// ======================================================

router.patch(
    "/memberships/:id/verify-payment",
    adminMiddleware,
    async (req, res) => {

        try {

            const membership =
                await Membership.findById(
                    req.params.id
                );

            if (!membership) {

                return res.status(404).json({
                    message:
                        "Membership application not found."
                });

            }

            membership.paymentStatus =
                "Verified";

            await membership.save();

            res.status(200).json({

                message:
                    "Payment verified successfully.",

                membership: {

                    id:
                    membership.membershipId,

                    paymentStatus:
                    membership.paymentStatus

                }

            });

        } catch (error) {

            console.error(
                "Payment Verification Error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to verify payment."
            });

        }

    }
);


// ======================================================
// REJECT INITIAL PAYMENT
// ======================================================

router.patch(
    "/memberships/:id/reject-payment",
    adminMiddleware,
    async (req, res) => {

        try {

            const membership =
                await Membership.findById(
                    req.params.id
                );

            if (!membership) {

                return res.status(404).json({
                    message:
                        "Membership application not found."
                });

            }

            membership.paymentStatus =
                "Rejected";

            await membership.save();

            res.status(200).json({

                message:
                    "Payment rejected.",

                membership: {

                    id:
                    membership.membershipId,

                    paymentStatus:
                    membership.paymentStatus

                }

            });

        } catch (error) {

            console.error(
                "Payment Rejection Error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to reject payment."
            });

        }

    }
);


// ======================================================
// APPROVE MEMBERSHIP + SEND GMAIL PDF
// ======================================================

router.patch(
    "/memberships/:id/approve",
    adminMiddleware,
    async (req, res) => {

        try {

            const membership =
                await Membership.findById(
                    req.params.id
                );

            if (!membership) {

                return res.status(404).json({
                    message:
                        "Membership application not found."
                });

            }

            if (
                membership.paymentStatus !==
                "Verified"
            ) {

                return res.status(400).json({
                    message:
                        "Payment must be verified before approving membership."
                });

            }

            const account =
                await Account.findById(
                    membership.accountId
                );

            if (!account) {

                return res.status(404).json({
                    message:
                        "Member account not found."
                });

            }

            if (!membership.email) {

                return res.status(400).json({
                    message:
                        "Membership form email address not found."
                });

            }

            membership.membershipStatus =
                "Approved";

            await membership.save();


            // ==========================================
            // CREATE MEMBERSHIP PDF
            // ==========================================

            let pdfBuffer;

            try {

                pdfBuffer =
                    await createMembershipCardBuffer(
                        membership
                    );

            } catch (pdfError) {

                console.error(
                    "Membership PDF Creation Error:",
                    pdfError
                );

                return res.status(200).json({

                    message:
                        "Membership approved, but membership PDF could not be generated.",

                    membership: {

                        id:
                        membership.membershipId,

                        status:
                        membership.membershipStatus

                    },

                    emailSent:
                        false

                });

            }


            // ==========================================
            // SEND GMAIL
            // ==========================================

            try {

                const emailResult =
                    await sendEmail({

                        to:
                        membership.email,

                        subject:
                            "Ganwai Kabaddi Sangh - Membership Approved",

                        html:
                            `
                            <div style="
                                font-family: Arial, sans-serif;
                                max-width: 600px;
                                margin: auto;
                                padding: 20px;
                                color: #222;
                            ">

                                <h2 style="
                                    color: #0b2341;
                                    margin-bottom: 10px;
                                ">
                                    Ganwai Kabaddi Sangh
                                </h2>

                                <p>
                                    Dear ${account.fullName || membership.fullName},
                                </p>

                                <p>
                                    Your membership application has been
                                    <strong>approved successfully</strong>.
                                </p>

                                <div style="
                                    background: #f5f7fa;
                                    border-left: 4px solid #f4a623;
                                    padding: 15px;
                                    margin: 20px 0;
                                ">

                                    <p style="margin: 5px 0;">
                                        <strong>Membership ID:</strong>
                                        ${membership.membershipId}
                                    </p>

                                    <p style="margin: 5px 0;">
                                        <strong>Membership Year:</strong>
                                        ${membership.membershipYear}
                                    </p>

                                    <p style="margin: 5px 0;">
                                        <strong>Status:</strong>
                                        Active
                                    </p>

                                </div>

                                <p>
                                    Your digital membership card is
                                    attached to this email as a PDF.
                                </p>

                                <p>
                                    Please keep this membership card
                                    safely for future verification.
                                </p>

                                <p style="
                                    margin-top: 30px;
                                    color: #666;
                                ">
                                    Regards,<br>
                                    <strong>
                                        Ganwai Kabaddi Sangh
                                    </strong>
                                </p>

                            </div>
                            `,

                        attachments: [

                            {
                                filename:
                                    `Membership-${membership.membershipId}.pdf`,

                                content:
                                pdfBuffer,

                                contentType:
                                    "application/pdf"

                            }

                        ]

                    });


                console.log(
                    "Membership email sent successfully:",
                    emailResult.messageId
                );


                res.status(200).json({

                    message:
                        "Membership approved and membership card emailed successfully.",

                    membership: {

                        id:
                        membership.membershipId,

                        status:
                        membership.membershipStatus

                    },

                    emailSent:
                        true,

                    emailId:
                        emailResult.messageId || null

                });


            } catch (emailError) {

                console.error(
                    "Membership Gmail Error:",
                    emailError
                );

                res.status(200).json({

                    message:
                        "Membership approved, but email could not be sent.",

                    membership: {

                        id:
                        membership.membershipId,

                        status:
                        membership.membershipStatus

                    },

                    emailSent:
                        false,

                    emailError:
                        emailError.message ||
                        "Email sending failed."

                });

            }

        } catch (error) {

            console.error(
                "Membership Approval Error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to approve membership."
            });

        }

    }
);


// ======================================================
// REJECT MEMBERSHIP
// ======================================================

router.patch(
    "/memberships/:id/reject",
    adminMiddleware,
    async (req, res) => {

        try {

            const membership =
                await Membership.findById(
                    req.params.id
                );

            if (!membership) {

                return res.status(404).json({
                    message:
                        "Membership application not found."
                });

            }

            membership.membershipStatus =
                "Rejected";

            await membership.save();

            res.status(200).json({

                message:
                    "Membership rejected.",

                membership: {

                    id:
                    membership.membershipId,

                    status:
                    membership.membershipStatus

                }

            });

        } catch (error) {

            console.error(
                "Membership Rejection Error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to reject membership."
            });

        }

    }
);


// ======================================================
// VERIFY RENEWAL + SEND UPDATED GMAIL CARD
// ======================================================

router.patch(
    "/memberships/:id/verify-renewal",
    adminMiddleware,
    async (req, res) => {

        try {

            const membership =
                await Membership.findById(
                    req.params.id
                );

            if (!membership) {

                return res.status(404).json({
                    message:
                        "Membership not found."
                });

            }

            if (
                membership.renewalPaymentStatus !==
                "Pending Verification"
            ) {

                return res.status(400).json({
                    message:
                        "No renewal payment is pending verification."
                });

            }

            const account =
                await Account.findById(
                    membership.accountId
                );

            if (!account) {

                return res.status(404).json({
                    message:
                        "Member account not found."
                });

            }

            if (!membership.email) {

                return res.status(400).json({
                    message:
                        "Membership email address not found."
                });

            }


            // ==========================================
            // NEW MEMBERSHIP YEAR
            // ==========================================

            const newYear =
                membership.membershipYear
                    ? membership.membershipYear + 1
                    : new Date().getFullYear();


            // ==========================================
            // NEW UNIQUE MEMBERSHIP ID
            // ==========================================

            const newMembershipId =
                await generateUniqueMembershipId(
                    newYear
                );


            // ==========================================
            // RENEWAL DATE
            // ==========================================

            const renewalDate =
                new Date();

            const nextRenewalDate =
                new Date(
                    renewalDate
                );

            nextRenewalDate.setFullYear(
                nextRenewalDate.getFullYear() + 1
            );


            // ==========================================
            // UPDATE MEMBERSHIP
            // ==========================================

            membership.membershipYear =
                newYear;

            membership.membershipId =
                newMembershipId;

            membership.lastRenewalDate =
                renewalDate;

            membership.nextRenewalDate =
                nextRenewalDate;

            membership.renewalPaymentStatus =
                "Verified";

            membership.renewalStatus =
                "Approved";

            membership.membershipStatus =
                "Approved";

            // memberNumber intentionally unchanged

            await membership.save();


            // ==========================================
            // CREATE UPDATED PDF
            // ==========================================

            let pdfBuffer;

            try {

                pdfBuffer =
                    await createMembershipCardBuffer(
                        membership
                    );

            } catch (pdfError) {

                console.error(
                    "Renewal PDF Creation Error:",
                    pdfError
                );

                return res.status(200).json({

                    message:
                        "Renewal approved, but updated membership PDF could not be generated.",

                    membership: {

                        membershipId:
                        membership.membershipId,

                        memberNumber:
                        membership.memberNumber,

                        membershipYear:
                        membership.membershipYear,

                        renewalStatus:
                        membership.renewalStatus

                    },

                    emailSent:
                        false

                });

            }


            // ==========================================
            // SEND UPDATED GMAIL CARD
            // ==========================================

            try {

                const emailResult =
                    await sendEmail({

                        to:
                        membership.email,

                        subject:
                            "Ganwai Kabaddi Sangh - Membership Renewed",

                        html:
                            `
                            <div style="
                                font-family: Arial, sans-serif;
                                max-width: 600px;
                                margin: auto;
                                padding: 20px;
                                color: #222;
                            ">

                                <h2 style="
                                    color: #0b2341;
                                    margin-bottom: 10px;
                                ">
                                    Ganwai Kabaddi Sangh
                                </h2>

                                <p>
                                    Dear ${account.fullName || membership.fullName},
                                </p>

                                <p>
                                    Your membership renewal has been
                                    <strong>approved successfully</strong>.
                                </p>

                                <div style="
                                    background: #f5f7fa;
                                    border-left: 4px solid #f4a623;
                                    padding: 15px;
                                    margin: 20px 0;
                                ">

                                    <p style="margin: 5px 0;">
                                        <strong>New Membership ID:</strong>
                                        ${membership.membershipId}
                                    </p>

                                    <p style="margin: 5px 0;">
                                        <strong>Membership Year:</strong>
                                        ${membership.membershipYear}
                                    </p>

                                    <p style="margin: 5px 0;">
                                        <strong>Member Number:</strong>
                                        ${membership.memberNumber}
                                    </p>

                                    <p style="margin: 5px 0;">
                                        <strong>Status:</strong>
                                        Active
                                    </p>

                                    <p style="margin: 5px 0;">
                                        <strong>Next Renewal:</strong>
                                        ${membership.nextRenewalDate.toLocaleDateString("en-IN")}
                                    </p>

                                </div>

                                <p>
                                    Your updated digital membership card
                                    is attached to this email as a PDF.
                                </p>

                                <p>
                                    Please keep this updated card safely
                                    for future verification.
                                </p>

                                <p style="
                                    margin-top: 30px;
                                    color: #666;
                                ">
                                    Regards,<br>
                                    <strong>
                                        Ganwai Kabaddi Sangh
                                    </strong>
                                </p>

                            </div>
                            `,

                        attachments: [

                            {
                                filename:
                                    `Membership-${membership.membershipId}.pdf`,

                                content:
                                pdfBuffer,

                                contentType:
                                    "application/pdf"

                            }

                        ]

                    });


                console.log(
                    "Renewal email sent successfully:",
                    emailResult.messageId
                );


                res.status(200).json({

                    message:
                        "Renewal verified, new membership ID generated, and updated membership card emailed successfully.",

                    membership: {

                        membershipId:
                        membership.membershipId,

                        memberNumber:
                        membership.memberNumber,

                        membershipYear:
                        membership.membershipYear,

                        renewalPaymentStatus:
                        membership.renewalPaymentStatus,

                        renewalStatus:
                        membership.renewalStatus,

                        nextRenewalDate:
                        membership.nextRenewalDate

                    },

                    emailSent:
                        true,

                    emailId:
                        emailResult.messageId || null

                });


            } catch (emailError) {

                console.error(
                    "Renewal Membership Gmail Error:",
                    emailError
                );

                res.status(200).json({

                    message:
                        "Renewal approved, but updated membership card email could not be sent.",

                    membership: {

                        membershipId:
                        membership.membershipId,

                        memberNumber:
                        membership.memberNumber,

                        membershipYear:
                        membership.membershipYear,

                        renewalStatus:
                        membership.renewalStatus

                    },

                    emailSent:
                        false,

                    emailError:
                        emailError.message ||
                        "Email sending failed."

                });

            }

        } catch (error) {

            console.error(
                "Renewal Verification Error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to verify renewal payment."
            });

        }

    }
);


// ======================================================
// REJECT RENEWAL
// ======================================================

router.patch(
    "/memberships/:id/reject-renewal",
    adminMiddleware,
    async (req, res) => {

        try {

            const membership =
                await Membership.findById(
                    req.params.id
                );

            if (!membership) {

                return res.status(404).json({
                    message:
                        "Membership not found."
                });

            }

            if (
                membership.renewalPaymentStatus !==
                "Pending Verification"
            ) {

                return res.status(400).json({
                    message:
                        "No renewal payment is pending verification."
                });

            }

            membership.renewalPaymentStatus =
                "Rejected";

            membership.renewalStatus =
                "Due";

            await membership.save();

            res.status(200).json({

                message:
                    "Renewal payment rejected.",

                membership: {

                    membershipId:
                    membership.membershipId,

                    renewalPaymentStatus:
                    membership.renewalPaymentStatus,

                    renewalStatus:
                    membership.renewalStatus

                }

            });

        } catch (error) {

            console.error(
                "Renewal Rejection Error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to reject renewal payment."
            });

        }

    }
);


// ======================================================
// GENERATE MEMBERSHIP PDF
// ======================================================

router.get(
    "/memberships/:id/pdf",
    adminMiddleware,
    async (req, res) => {

        try {

            const membership =
                await Membership.findById(
                    req.params.id
                );

            if (!membership) {

                return res.status(404).json({
                    message:
                        "Membership application not found."
                });

            }

            if (
                membership.membershipStatus !==
                "Approved"
            ) {

                return res.status(400).json({
                    message:
                        "Membership must be approved before generating PDF."
                });

            }

            generateMembershipCard(
                membership,
                res
            );

        } catch (error) {

            console.error(
                "Membership PDF Error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to generate membership PDF."
            });

        }

    }
);


// ======================================================
// GENERATE UNIQUE MEMBERSHIP ID
// ======================================================

async function generateUniqueMembershipId(
    year
) {

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
                membershipId:
                membershipId
            });

    }

    return membershipId;
}


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;