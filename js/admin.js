const adminToken = localStorage.getItem("authToken");


// =====================================================
// COMMON
// =====================================================

function getAuthHeaders() {

    return {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json"
    };

}


function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatDate(dateValue) {

    if (!dateValue) {
        return "N/A";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "N/A";
    }

    return date.toLocaleDateString();

}


function formatDateForInput(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// =====================================================
// MEMBERSHIP MANAGEMENT
// =====================================================

async function loadMemberships() {

    const message =
        document.getElementById(
            "membershipMessage"
        );

    const tableWrapper =
        document.getElementById(
            "membershipTableWrapper"
        );

    const tableBody =
        document.getElementById(
            "membershipTableBody"
        );


    if (
        !message ||
        !tableWrapper ||
        !tableBody
    ) {
        return;
    }


    message.style.display =
        "block";

    message.textContent =
        "Loading membership applications...";


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/admin/memberships",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load memberships."
            );

        }


        const memberships =
            data.memberships || [];


        if (
            memberships.length === 0
        ) {

            message.style.display =
                "block";

            message.textContent =
                "No membership registrations found.";

            tableWrapper.style.display =
                "none";

            return;

        }


        message.style.display =
            "none";

        tableWrapper.style.display =
            "block";

        tableBody.innerHTML =
            "";


        memberships.forEach(
            (membership) => {

                const row =
                    document.createElement(
                        "tr"
                    );


                let paymentActions =
                    "";


                if (
                    membership.paymentStatus ===
                    "Pending Verification"
                ) {

                    paymentActions = `

                        <button
                            class="admin-btn"
                            onclick="verifyPayment('${membership._id}')"
                        >
                            Verify
                        </button>

                        <button
                            class="admin-btn danger"
                            onclick="rejectPayment('${membership._id}')"
                        >
                            Reject
                        </button>

                    `;

                } else {

                    paymentActions = `

                        <span>
                            ${escapeHtml(
                        membership.paymentStatus
                    )}
                        </span>

                    `;

                }


                let membershipActions =
                    "";


                if (
                    membership.paymentStatus ===
                    "Verified" &&
                    membership.membershipStatus ===
                    "Pending Verification"
                ) {

                    membershipActions = `

                        <button
                            class="admin-btn"
                            onclick="approveMembership('${membership._id}')"
                        >
                            Approve
                        </button>

                        <button
                            class="admin-btn danger"
                            onclick="rejectMembership('${membership._id}')"
                        >
                            Reject
                        </button>

                    `;

                } else if (
                    membership.membershipStatus ===
                    "Approved"
                ) {

                    membershipActions = `

                        <button
                            class="admin-btn"
                            onclick="generateMembershipPDF('${membership._id}')"
                        >
                            Generate PDF
                        </button>

                    `;

                } else {

                    membershipActions = `

                        <span>
                            ${escapeHtml(
                        membership.membershipStatus
                    )}
                        </span>

                    `;

                }


                let renewalActions =
                    "";


                if (
                    membership.renewalPaymentStatus ===
                    "Pending Verification"
                ) {

                    renewalActions = `

                        <button
                            class="admin-btn"
                            onclick="verifyRenewal('${membership._id}')"
                        >
                            Verify
                        </button>

                        <button
                            class="admin-btn danger"
                            onclick="rejectRenewal('${membership._id}')"
                        >
                            Reject
                        </button>

                    `;

                } else if (
                    membership.renewalPaymentStatus ===
                    "Verified"
                ) {

                    renewalActions = `

                        <span>
                            Verified
                        </span>

                    `;

                } else if (
                    membership.renewalPaymentStatus ===
                    "Rejected"
                ) {

                    renewalActions = `

                        <span>
                            Rejected
                        </span>

                    `;

                } else {

                    renewalActions = `

                        <span>
                            Not Required
                        </span>

                    `;

                }


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                    membership.membershipId ||
                    "Pending"
                )}
                    </td>

                    <td>
                        ${escapeHtml(
                    membership.membershipYear ||
                    "N/A"
                )}
                    </td>

                    <td>
                        ${escapeHtml(
                    membership.fullName
                )}
                    </td>

                    <td>
                        ${escapeHtml(
                    membership.mobile
                )}
                    </td>

                    <td>
                        ${escapeHtml(
                    membership.paymentReference ||
                    "N/A"
                )}
                    </td>

                    <td>
                        ${paymentActions}
                    </td>

                    <td>
                        ${membershipActions}
                    </td>

                    <td>
                        ${escapeHtml(
                    membership.renewalPaymentReference ||
                    "N/A"
                )}
                    </td>

                    <td>

                        ${escapeHtml(
                    membership.renewalPaymentStatus ||
                    "Not Required"
                )}

                        <br>

                        ${renewalActions}

                    </td>

                    <td>
                        ${escapeHtml(
                    membership.renewalStatus ||
                    "Not Due"
                )}
                    </td>

                    <td>

                        ${
                    membership.membershipStatus ===
                    "Approved"

                        ? `

                                    <button
                                        class="admin-btn"
                                        onclick="generateMembershipPDF('${membership._id}')"
                                    >
                                        PDF
                                    </button>

                                  `

                        : `

                                    <span>
                                        —
                                    </span>

                                  `
                }

                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Membership loading error:",
            error
        );


        tableWrapper.style.display =
            "none";

        message.style.display =
            "block";

        message.textContent =
            error.message ||
            "Unable to load memberships.";

    }

}


// =====================================================
// MEMBERSHIP PAYMENT
// =====================================================

async function verifyPayment(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/admin/memberships/${id}/verify-payment`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Payment verification failed."
            );

        }


        alert(
            "Payment verified successfully."
        );


        loadMemberships();


    } catch (error) {

        alert(
            error.message
        );

    }

}


async function rejectPayment(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/admin/memberships/${id}/reject-payment`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Payment rejection failed."
            );

        }


        alert(
            "Payment rejected."
        );


        loadMemberships();


    } catch (error) {

        alert(
            error.message
        );

    }

}


// =====================================================
// MEMBERSHIP APPROVAL
// =====================================================

async function approveMembership(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/admin/memberships/${id}/approve`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Membership approval failed."
            );

        }


        alert(
            "Membership approved successfully."
        );


        loadMemberships();


    } catch (error) {

        alert(
            error.message
        );

    }

}


async function rejectMembership(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/admin/memberships/${id}/reject`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Membership rejection failed."
            );

        }


        alert(
            "Membership rejected."
        );


        loadMemberships();


    } catch (error) {

        alert(
            error.message
        );

    }

}


// =====================================================
// RENEWAL
// =====================================================

async function verifyRenewal(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/admin/memberships/${id}/verify-renewal`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Renewal verification failed."
            );

        }


        alert(
            "Renewal payment verified."
        );


        loadMemberships();


    } catch (error) {

        alert(
            error.message
        );

    }

}


async function rejectRenewal(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/admin/memberships/${id}/reject-renewal`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Renewal rejection failed."
            );

        }


        alert(
            "Renewal payment rejected."
        );


        loadMemberships();


    } catch (error) {

        alert(
            error.message
        );

    }

}


// =====================================================
// MEMBERSHIP PDF
// =====================================================

async function generateMembershipPDF(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/admin/memberships/${id}/pdf`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        if (!response.ok) {

            const data =
                await response
                    .json()
                    .catch(
                        () => ({})
                    );


            throw new Error(
                data.message ||
                "Unable to generate PDF."
            );

        }


        const blob =
            await response.blob();


        const url =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "membership-card.pdf";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
            url
        );


    } catch (error) {

        alert(
            error.message
        );

    }

}


// =====================================================
// TEAM MANAGEMENT
// =====================================================

async function loadTeams() {

    const message =
        document.getElementById(
            "teamMessage"
        );

    const tableWrapper =
        document.getElementById(
            "teamTableWrapper"
        );

    const tableBody =
        document.getElementById(
            "teamTableBody"
        );


    if (
        !message ||
        !tableWrapper ||
        !tableBody
    ) {

        return;

    }


    message.style.display =
        "block";

    message.textContent =
        "Loading team registrations...";


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/teams",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load teams."
            );

        }


        const teams =
            data.teams || [];


        if (
            teams.length === 0
        ) {

            message.style.display =
                "block";

            message.textContent =
                "No team registrations found.";

            tableWrapper.style.display =
                "none";

            return;

        }


        message.style.display =
            "none";

        tableWrapper.style.display =
            "block";

        tableBody.innerHTML =
            "";


        teams.forEach(
            (team) => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const tournamentName =
                    team.tournamentId &&
                    typeof team.tournamentId ===
                    "object"

                        ? team
                            .tournamentId
                            .tournamentName

                        : "N/A";


                const playerCount =
                    Array.isArray(
                        team.players
                    )

                        ? team.players.length

                        : 0;


                let paymentActions =
                    "";


                if (
                    team.paymentStatus ===
                    "Pending Verification"
                ) {

                    paymentActions = `

                        <button
                            class="admin-btn"
                            onclick="verifyTeamPayment('${team._id}')"
                        >
                            Verify
                        </button>

                        <button
                            class="admin-btn danger"
                            onclick="rejectTeamPayment('${team._id}')"
                        >
                            Reject
                        </button>

                    `;

                }


                let registrationActions =
                    "";


                if (
                    team.registrationStatus ===
                    "Pending" &&

                    team.paymentStatus ===
                    "Verified"
                ) {

                    registrationActions = `

                        <button
                            class="admin-btn"
                            onclick="approveTeam('${team._id}')"
                        >
                            Approve
                        </button>

                        <button
                            class="admin-btn danger"
                            onclick="rejectTeam('${team._id}')"
                        >
                            Reject
                        </button>

                    `;

                } else if (
                    team.registrationStatus ===
                    "Pending" &&

                    team.paymentStatus !==
                    "Verified"
                ) {

                    registrationActions = `

                        <small>
                            Verify payment first
                        </small>

                    `;

                }


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                    team.registrationId ||
                    "Pending"
                )}
                    </td>

                    <td>
                        ${escapeHtml(
                    team.teamName
                )}
                    </td>

                    <td>
                        ${escapeHtml(
                    tournamentName ||
                    "N/A"
                )}
                    </td>

                    <td>
                        ${escapeHtml(
                    team.captainName
                )}
                    </td>

                    <td>

                        <strong>
                            ${escapeHtml(
                    team.paymentReference ||
                    "N/A"
                )}
                        </strong>

                    </td>

                    <td>
                        ${escapeHtml(
                    team.email
                )}
                    </td>

                    <td>
                        ${playerCount}
                    </td>

                    <td>

                        <strong>
                            ${escapeHtml(
                    team.paymentStatus
                )}
                        </strong>

                        <br>

                        ${paymentActions}

                    </td>

                    <td>

                        <strong>
                            ${escapeHtml(
                    team.registrationStatus
                )}
                        </strong>

                        <br>

                        ${registrationActions}

                    </td>

                    <td>

                        <button
                            class="admin-btn"
                            onclick="viewTeam('${team._id}')"
                        >
                            View
                        </button>

                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Team loading error:",
            error
        );


        tableWrapper.style.display =
            "none";

        message.style.display =
            "block";

        message.textContent =
            error.message ||
            "Unable to load teams.";

    }

}


// =====================================================
// TEAM PAYMENT
// =====================================================

async function verifyTeamPayment(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/teams/${id}/payment-status`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        paymentStatus: "Verified"
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Team payment verification failed."
            );

        }


        alert(
            "Team payment verified successfully."
        );


        loadTeams();


    } catch (error) {

        alert(
            error.message
        );

    }

}


async function rejectTeamPayment(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/teams/${id}/payment-status`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        paymentStatus: "Rejected"
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Team payment rejection failed."
            );

        }


        alert(
            "Team payment rejected."
        );


        loadTeams();


    } catch (error) {

        alert(
            error.message
        );

    }

}


// =====================================================
// TEAM APPROVAL
// =====================================================

async function approveTeam(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/teams/${id}/status`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        registrationStatus: "Approved"
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Team approval failed."
            );

        }


        alert(

            "Team approved successfully.\n\n" +

            "Registration ID: " +

            (
                data.team?.registrationId ||
                "Generated"
            )

        );


        loadTeams();


    } catch (error) {

        alert(
            error.message
        );

    }

}


async function rejectTeam(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/teams/${id}/status`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        registrationStatus: "Rejected"
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Team rejection failed."
            );

        }


        alert(
            "Team registration rejected."
        );


        loadTeams();


    } catch (error) {

        alert(
            error.message
        );

    }

}


// =====================================================
// VIEW TEAM
// =====================================================

async function viewTeam(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/teams/${id}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load team details."
            );

        }


        const team =
            data.team;


        if (!team) {

            throw new Error(
                "Team details not found."
            );

        }


        const tournamentName =
            team.tournamentId &&
            typeof team.tournamentId ===
            "object"

                ? team
                    .tournamentId
                    .tournamentName

                : "N/A";


        let playerDetails =
            "";


        if (
            Array.isArray(
                team.players
            ) &&
            team.players.length > 0
        ) {

            playerDetails =
                team.players
                    .map(
                        (player, index) => {

                            return (

                                `${index + 1}. ` +

                                `${player.name || "N/A"}` +

                                ` | DOB: ` +

                                `${

                                    player.dob

                                        ? new Date(
                                            player.dob
                                        ).toLocaleDateString()

                                        : "N/A"

                                }` +

                                ` | Gender: ` +

                                `${player.gender || "N/A"}` +

                                ` | Weight: ` +

                                `${player.weight || "N/A"} kg` +

                                ` | Mobile: ` +

                                `${player.mobile || "N/A"}` +

                                ` | Role: ` +

                                `${player.playerRole || "N/A"}` +

                                ` | Jersey: ` +

                                `${player.jerseyNumber ?? "N/A"}`

                            );

                        }
                    )
                    .join("\n");

        } else {

            playerDetails =
                "No players found.";

        }


        alert(

            "TEAM DETAILS\n\n" +

            "Registration ID: " +

            (
                team.registrationId ||
                "Pending"
            ) +

            "\nTeam Name: " +

            (
                team.teamName ||
                "N/A"
            ) +

            "\nTournament: " +

            (
                tournamentName ||
                "N/A"
            ) +

            "\nCaptain: " +

            (
                team.captainName ||
                "N/A"
            ) +

            "\nCaptain Mobile: " +

            (
                team.captainMobile ||
                "N/A"
            ) +

            "\nUTR / Payment Reference: " +

            (
                team.paymentReference ||
                "N/A"
            ) +

            "\nEmail: " +

            (
                team.email ||
                "N/A"
            ) +

            "\nLocation: " +

            (
                team.location ||
                "N/A"
            ) +

            "\nPlayers: " +

            (
                Array.isArray(
                    team.players
                )

                    ? team.players.length

                    : 0
            ) +

            "\nPayment: " +

            (
                team.paymentStatus ||
                "N/A"
            ) +

            "\nRegistration: " +

            (
                team.registrationStatus ||
                "N/A"
            ) +

            "\n\nPLAYER DETAILS\n\n" +

            playerDetails

        );


    } catch (error) {

        alert(
            error.message
        );

    }

}


// =====================================================
// TOURNAMENT MANAGEMENT
// =====================================================

const tournamentForm =
    document.getElementById(
        "tournamentForm"
    );


if (tournamentForm) {

    tournamentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const tournamentName =
                document
                    .getElementById(
                        "tournamentName"
                    )
                    .value
                    .trim();


            const description =
                document
                    .getElementById(
                        "description"
                    )
                    .value
                    .trim();


            const tournamentDate =
                document
                    .getElementById(
                        "tournamentDate"
                    )
                    .value;


            const venue =
                document
                    .getElementById(
                        "venue"
                    )
                    .value
                    .trim();


            const location =
                document
                    .getElementById(
                        "location"
                    )
                    .value
                    .trim();


            const status =
                document
                    .getElementById(
                        "status"
                    )
                    .value;


            const registrationStartDate =
                document
                    .getElementById(
                        "registrationStartDate"
                    )
                    .value;


            const registrationEndDate =
                document
                    .getElementById(
                        "registrationEndDate"
                    )
                    .value;


            if (
                registrationStartDate &&
                registrationEndDate &&
                registrationStartDate >
                registrationEndDate
            ) {

                alert(
                    "Registration end date cannot be before registration start date."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/tournaments/create",
                        {
                            method: "POST",
                            headers: getAuthHeaders(),
                            body: JSON.stringify({

                                tournamentName,

                                description,

                                tournamentDate,

                                venue,

                                location,

                                status,

                                registrationStartDate,

                                registrationEndDate

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Tournament creation failed."
                    );

                }


                alert(
                    "Tournament created successfully."
                );


                tournamentForm.reset();


                loadTournaments();

                loadMatchTournaments();


            } catch (error) {

                alert(
                    error.message
                );

            }

        }
    );

}


// =====================================================
// LOAD TOURNAMENTS
// =====================================================

async function loadTournaments() {

    const list =
        document.getElementById(
            "tournamentList"
        );


    const message =
        document.getElementById(
            "tournamentMessage"
        );


    if (!list) {
        return;
    }


    try {

        if (message) {

            message.style.display =
                "block";

            message.textContent =
                "Loading tournaments...";

        }


        const response =
            await fetch(
                "http://localhost:5000/api/tournaments"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load tournaments."
            );

        }


        const tournaments =
            data.tournaments || [];


        list.innerHTML =
            "";


        if (
            tournaments.length === 0
        ) {

            if (message) {

                message.style.display =
                    "none";

            }


            list.innerHTML =
                "<p>No tournaments found.</p>";

            return;

        }


        if (message) {

            message.style.display =
                "none";

        }


        tournaments.forEach(
            (tournament) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "tournament-item";


                const date =
                    formatDate(
                        tournament.tournamentDate
                    );


                const status =
                    tournament.status ||
                    "Upcoming";


                item.innerHTML = `

                    <h3>
                        ${escapeHtml(
                    tournament.tournamentName
                )}
                    </h3>

                    <p>
                        <strong>Date:</strong>
                        ${escapeHtml(
                    date
                )}
                    </p>

                    <p>
                        <strong>Venue:</strong>
                        ${escapeHtml(
                    tournament.venue
                )}
                    </p>

                    <p>
                        <strong>Location:</strong>
                        ${escapeHtml(
                    tournament.location
                )}
                    </p>

                    <p>
                        <strong>Registration:</strong>

                        ${escapeHtml(
                    tournament.registrationStartDate

                        ? formatDate(
                            tournament.registrationStartDate
                        )

                        : "N/A"
                )}

                        -

                        ${escapeHtml(
                    tournament.registrationEndDate

                        ? formatDate(
                            tournament.registrationEndDate
                        )

                        : "N/A"
                )}

                    </p>

                    <p>
                        <strong>Status:</strong>
                    </p>

                    <span class="tournament-status">

                        ${escapeHtml(
                    status
                )}

                    </span>

                    ${
                    tournament.description

                        ? `

                                <p>

                                    <strong>
                                        Description:
                                    </strong>

                                    ${escapeHtml(
                            tournament.description
                        )}

                                </p>

                              `

                        : ""
                }

                    <div class="tournament-actions">

                        <button
                            class="admin-btn"
                            onclick="editTournament('${tournament._id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="admin-btn danger"
                            onclick="deleteTournament('${tournament._id}')"
                        >
                            Delete
                        </button>

                    </div>

                `;


                list.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "Tournament loading error:",
            error
        );


        if (message) {

            message.style.display =
                "none";

        }


        list.innerHTML =
            `<p>${escapeHtml(
                error.message
            )}</p>`;

    }

}


// =====================================================
// DELETE TOURNAMENT
// =====================================================

async function deleteTournament(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this tournament?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/tournaments/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${adminToken}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Tournament deletion failed."
            );

        }


        alert(
            "Tournament deleted successfully."
        );


        loadTournaments();

        loadMatchTournaments();


    } catch (error) {

        alert(
            error.message
        );

    }

}


// =====================================================
// EDIT TOURNAMENT
// =====================================================

async function editTournament(id) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/tournaments/${id}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load tournament."
            );

        }


        const tournament =
            data.tournament;


        if (!tournament) {

            throw new Error(
                "Tournament not found."
            );

        }


        const newName =
            prompt(
                "Tournament Name:",
                tournament.tournamentName ||
                ""
            );


        if (
            newName === null ||
            !newName.trim()
        ) {

            return;

        }


        const newDate =
            prompt(
                "Tournament Date (YYYY-MM-DD):",
                formatDateForInput(
                    tournament.tournamentDate
                )
            );


        if (
            newDate === null
        ) {

            return;

        }


        const newVenue =
            prompt(
                "Venue:",
                tournament.venue ||
                ""
            );


        if (
            newVenue === null
        ) {

            return;

        }


        const newLocation =
            prompt(
                "Location:",
                tournament.location ||
                ""
            );


        if (
            newLocation === null
        ) {

            return;

        }


        const newRegistrationStart =
            prompt(
                "Registration Start Date (YYYY-MM-DD):",
                formatDateForInput(
                    tournament.registrationStartDate
                )
            );


        if (
            newRegistrationStart === null
        ) {

            return;

        }


        const newRegistrationEnd =
            prompt(
                "Registration End Date (YYYY-MM-DD):",
                formatDateForInput(
                    tournament.registrationEndDate
                )
            );


        if (
            newRegistrationEnd === null
        ) {

            return;

        }


        if (
            newRegistrationStart &&
            newRegistrationEnd &&
            newRegistrationStart >
            newRegistrationEnd
        ) {

            alert(
                "Registration end date cannot be before registration start date."
            );

            return;

        }


        const allowedStatuses = [

            "Upcoming",

            "Registration Open",

            "Ongoing",

            "Completed",

            "Cancelled"

        ];


        const newStatus =
            prompt(

                "Status:\n\n" +

                "Upcoming\n" +

                "Registration Open\n" +

                "Ongoing\n" +

                "Completed\n" +

                "Cancelled",

                tournament.status ||
                "Upcoming"

            );


        if (
            newStatus === null
        ) {

            return;

        }


        if (
            !allowedStatuses.includes(
                newStatus.trim()
            )
        ) {

            alert(
                "Invalid tournament status."
            );

            return;

        }


        const newDescription =
            prompt(
                "Tournament Description:",
                tournament.description ||
                ""
            );


        if (
            newDescription === null
        ) {

            return;

        }


        const responseUpdate =
            await fetch(
                `http://localhost:5000/api/tournaments/${id}`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify({

                            tournamentName:
                                newName.trim(),

                            description:
                                newDescription.trim(),

                            tournamentDate:
                                newDate.trim(),

                            venue:
                                newVenue.trim(),

                            location:
                                newLocation.trim(),

                            status:
                                newStatus.trim(),

                            registrationStartDate:
                                newRegistrationStart.trim(),

                            registrationEndDate:
                                newRegistrationEnd.trim()

                        })
                }
            );


        const updateData =
            await responseUpdate.json();


        if (!responseUpdate.ok) {

            throw new Error(
                updateData.message ||
                "Tournament update failed."
            );

        }


        alert(
            "Tournament updated successfully."
        );


        loadTournaments();

        loadMatchTournaments();


    } catch (error) {

        alert(
            error.message
        );

    }

}


// =====================================================
// MATCH MANAGEMENT
// =====================================================

// -----------------------------------------------------
// LOAD TOURNAMENTS INTO MATCH DROPDOWN
// -----------------------------------------------------

async function loadMatchTournaments() {

    const tournamentSelect =
        document.getElementById(
            "matchTournament"
        );


    if (!tournamentSelect) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/tournaments"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load tournaments."
            );

        }


        const tournaments =
            data.tournaments || [];


        tournamentSelect.innerHTML = `

            <option value="">
                Select Tournament
            </option>

        `;


        tournaments.forEach(
            (tournament) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    tournament._id;


                option.textContent =
                    tournament.tournamentName;


                tournamentSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Match tournament loading error:",
            error
        );


        tournamentSelect.innerHTML = `

            <option value="">
                Unable to load tournaments
            </option>

        `;

    }

}


// -----------------------------------------------------
// CREATE MATCH
// -----------------------------------------------------
function ensureMatchNumberField() {

    const matchForm =
        document.getElementById("matchForm");

    const tournamentSelect =
        document.getElementById("matchTournament");

    if (!matchForm || !tournamentSelect) {
        return;
    }

    if (document.getElementById("matchNumber")) {
        return;
    }

    const fieldWrapper =
        document.createElement("div");

    fieldWrapper.className = "form-group";

    fieldWrapper.innerHTML = `
        <label for="matchNumber">
            Match Number
        </label>

        <input
            type="text"
            id="matchNumber"
            name="matchNumber"
            placeholder="Example: M01"
            maxlength="10"
            autocomplete="off"
        >
    `;

    tournamentSelect
        .closest(".form-group")
        ?.insertAdjacentElement(
            "afterend",
            fieldWrapper
        );
}

ensureMatchNumberField();


const matchForm =
    document.getElementById(
        "matchForm"
    );


if (matchForm) {

    matchForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const matchTournament =
                document.getElementById(
                    "matchTournament"
                ).value;


            const matchType =
                document.getElementById(
                    "matchType"
                ).value;


            const teamA =
                document.getElementById(
                    "teamA"
                ).value.trim();


            const teamB =
                document.getElementById(
                    "teamB"
                ).value.trim();


            const matchDate =
                document.getElementById(
                    "matchDate"
                ).value;


            const matchVenue =
                document.getElementById(
                    "matchVenue"
                ).value.trim();

            const matchNumber =
                document.getElementById(
                    "matchNumber"
                ).value.trim();

            const message =
                document.getElementById(
                    "matchMessage"
                );


            if (
                !matchTournament ||
                !matchType ||
                !teamA ||
                !teamB ||
                !matchDate ||
                !matchNumber
            ) {

                if (message) {

                    message.style.display =
                        "block";

                    message.textContent =
                        "Please fill all required match fields.";

                }

                return;

            }


            if (
                teamA.toLowerCase() ===
                teamB.toLowerCase()
            ) {

                if (message) {

                    message.style.display =
                        "block";

                    message.textContent =
                        "Team A and Team B cannot be the same.";

                }

                return;

            }


            try {

                if (message) {

                    message.style.display =
                        "block";

                    message.textContent =
                        "Creating match...";

                }


                const response =
                    await fetch(
                        "http://localhost:5000/api/matches/create",
                        {
                            method: "POST",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify({

                                    tournamentId:
                                    matchTournament,

                                    teamA:
                                    teamA,

                                    teamB:
                                    teamB,

                                    matchType:
                                    matchType,

                                    matchDate:
                                    matchDate,

                                    matchNumber:
                                    matchNumber,

                                    venue:
                                    matchVenue

                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Match creation failed."
                    );

                }


                alert(
                    "Match created successfully."
                );


                matchForm.reset();


                if (message) {

                    message.style.display =
                        "none";

                }


                loadMatches();


            } catch (error) {

                console.error(
                    "Match creation error:",
                    error
                );


                if (message) {

                    message.style.display =
                        "block";

                    message.textContent =
                        error.message ||
                        "Unable to create match.";

                }

            }

        }
    );

}


// -----------------------------------------------------
// START LIVE MATCH
// -----------------------------------------------------

async function startLiveMatch(matchId) {

    try {

        const confirmed =
            confirm(
                "Do you want to start this match as LIVE?"
            );


        if (!confirmed) {
            return;
        }


        const response =
            await fetch(
                `http://localhost:5000/api/matches/${matchId}/start-live`,
                {
                    method: "PUT",
                    headers: getAuthHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to start live match."
            );

        }


        alert(
            "Match is now LIVE."
        );


        loadMatches();


    } catch (error) {

        console.error(
            "Start live match error:",
            error
        );


        alert(
            error.message ||
            "Unable to start live match."
        );

    }

}


// -----------------------------------------------------
// UPDATE MATCH SCORE
// -----------------------------------------------------

async function updateMatchScore(matchId, team, change) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/matches/${matchId}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load match."
            );

        }


        const match =
            data.match;


        if (!match) {

            throw new Error(
                "Match not found."
            );

        }


        if (match.status !== "Live") {

            alert(
                "Only LIVE match score can be updated."
            );

            return;

        }


        let scoreA =
            Number(match.scoreA || 0);

        let scoreB =
            Number(match.scoreB || 0);


        if (team === "A") {

            scoreA =
                Math.max(
                    0,
                    scoreA + change
                );

        }


        if (team === "B") {

            scoreB =
                Math.max(
                    0,
                    scoreB + change
                );

        }


        const updateResponse =
            await fetch(
                `http://localhost:5000/api/matches/${matchId}/score`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify({

                            scoreA:
                            scoreA,

                            scoreB:
                            scoreB

                        })
                }
            );


        const updateData =
            await updateResponse.json();


        if (!updateResponse.ok) {

            throw new Error(
                updateData.message ||
                "Unable to update score."
            );

        }


        loadMatches();


    } catch (error) {

        console.error(
            "Score update error:",
            error
        );


        alert(
            error.message ||
            "Unable to update score."
        );

    }

}

// -----------------------------------------------------
// ADD LIVE MATCH EVENT
// -----------------------------------------------------

async function addLiveMatchEvent(
    matchId,
    type,
    team,
    points
) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/matches/${matchId}/events`,
                {
                    method: "POST",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify({
                            type: type,
                            team: team || "",
                            points:
                                Number(points || 0),
                            note: ""
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to add match event."
            );

        }


        loadMatches();


    } catch (error) {

        console.error(
            "Live event error:",
            error
        );

        alert(
            error.message ||
            "Unable to add match event."
        );

    }

}

// -----------------------------------------------------
// END LIVE MATCH
// -----------------------------------------------------

async function endLiveMatch(matchId) {

    try {

        const confirmed =
            confirm(
                "Are you sure you want to end this LIVE match?"
            );


        if (!confirmed) {
            return;
        }


        const response =
            await fetch(
                `http://localhost:5000/api/matches/${matchId}/end`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to end match."
            );

        }


        alert(
            "Match completed successfully."
        );


        loadMatches();


    } catch (error) {

        console.error(
            "End match error:",
            error
        );


        alert(
            error.message ||
            "Unable to end match."
        );

    }

}


// -----------------------------------------------------
// DELETE MATCH
// -----------------------------------------------------

async function deleteMatch(matchId) {

    try {

        const confirmed = confirm(
            "Are you sure you want to delete this match?"
        );

        if (!confirmed) {
            return;
        }


        const response =
            await fetch(
                `http://localhost:5000/api/matches/${matchId}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete match."
            );

        }


        alert(
            "Match deleted successfully."
        );


        loadMatches();


    } catch (error) {

        console.error(
            "Delete match error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete match."
        );

    }

}


// -----------------------------------------------------
// LOAD MATCHES
// -----------------------------------------------------

async function loadMatches() {

    const list =
        document.getElementById(
            "matchList"
        );


    const message =
        document.getElementById(
            "matchMessage"
        );


    if (!list) {
        return;
    }


    try {

        if (message) {

            message.style.display =
                "block";

            message.textContent =
                "Loading matches...";

        }


        const response =
            await fetch(
                "http://localhost:5000/api/matches"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load matches."
            );

        }


        const matches =
            data.matches || [];

        const activeMatches =
            matches.filter(
                (match) =>
                    match.status === "Upcoming" ||
                    match.status === "Live"
            );

        list.innerHTML =
            "";


        if (
            activeMatches.length === 0
        ) {

            if (message) {

                message.style.display =
                    "none";

            }


            list.innerHTML =
                "<p>No matches found.</p>";

            return;

        }


        if (message) {

            message.style.display =
                "none";

        }


        activeMatches.forEach(
            (match) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "tournament-item";


                const tournamentName =
                    match.tournamentId &&
                    typeof match.tournamentId ===
                    "object"

                        ? match
                            .tournamentId
                            .tournamentName

                        : "N/A";


                const matchDate =
                    match.matchDate
                        ? new Date(
                            match.matchDate
                        ).toLocaleString(
                            "en-IN"
                        )
                        : "N/A";


                const status =
                    match.status ||
                    "Upcoming";


                let actionButton = "";


                if (
                    status === "Upcoming"
                ) {

                    actionButton = `

        <div
            class="tournament-actions"
            style="margin-top: 15px;"
        >

            <button
                class="admin-btn"
                onclick="startLiveMatch('${match._id}')"
            >
                Start Live
            </button>

        </div>

    `;

                }

                if (status === "Live") {

                    actionButton = `

        <div class="live-score-control">

            <div class="live-score-heading">

                <div class="live-status-badge">
                    <span class="live-status-dot"></span>
                    LIVE
                </div>

                <h4>
                    LIVE SCORE CONTROL
                </h4>

            </div>


            <div class="live-score-teams">


                <!-- TEAM A -->

                <div class="live-team-panel">

                    <div class="live-team-name">
                        ${escapeHtml(match.teamA)}
                    </div>

                    <div class="live-score-value">
                        ${match.scoreA ?? 0}
                    </div>

                    <div class="live-score-buttons">

                        <button
                            class="live-score-btn decrease"
                            onclick="updateMatchScore(
                                '${match._id}',
                                'A',
                                -1
                            )"
                        >
                            −
                        </button>

                        <button
                            class="live-score-btn increase"
                            onclick="updateMatchScore(
                                '${match._id}',
                                'A',
                                1
                            )"
                        >
                            +
                        </button>

                    </div>

                </div>


                <!-- VS -->

                <div class="live-score-vs">
                    VS
                </div>


                <!-- TEAM B -->

                <div class="live-team-panel">

                    <div class="live-team-name">
                        ${escapeHtml(match.teamB)}
                    </div>

                    <div class="live-score-value">
                        ${match.scoreB ?? 0}
                    </div>

                    <div class="live-score-buttons">

                        <button
                            class="live-score-btn decrease"
                            onclick="updateMatchScore(
                                '${match._id}',
                                'B',
                                -1
                            )"
                        >
                            −
                        </button>

                        <button
                            class="live-score-btn increase"
                            onclick="updateMatchScore(
                                '${match._id}',
                                'B',
                                1
                            )"
                        >
                            +
                        </button>

                    </div>

                </div>

            </div>

        
        <div class="live-event-controls">

    <h4>
        MATCH EVENTS
    </h4>

    <div class="live-event-buttons">

        <button
            class="admin-btn"
            onclick="addLiveMatchEvent(
                '${match._id}',
                'Raid Point',
                '${escapeHtml(match.teamA)}',
                1
            )"
        >
            Raid +1 — ${escapeHtml(match.teamA)}
        </button>

        <button
            class="admin-btn"
            onclick="addLiveMatchEvent(
                '${match._id}',
                'Raid Point',
                '${escapeHtml(match.teamB)}',
                1
            )"
        >
            Raid +1 — ${escapeHtml(match.teamB)}
        </button>

        <button
            class="admin-btn"
            onclick="addLiveMatchEvent(
                '${match._id}',
                'Tackle Point',
                '${escapeHtml(match.teamA)}',
                1
            )"
        >
            Tackle +1 — ${escapeHtml(match.teamA)}
        </button>

        <button
            class="admin-btn"
            onclick="addLiveMatchEvent(
                '${match._id}',
                'Tackle Point',
                '${escapeHtml(match.teamB)}',
                1
            )"
        >
            Tackle +1 — ${escapeHtml(match.teamB)}
        </button>

        <button
            class="admin-btn"
            onclick="addLiveMatchEvent(
                '${match._id}',
                'Bonus',
                '${escapeHtml(match.teamA)}',
                1
            )"
        >
            Bonus +1 — ${escapeHtml(match.teamA)}
        </button>

        <button
            class="admin-btn"
            onclick="addLiveMatchEvent(
                '${match._id}',
                'Bonus',
                '${escapeHtml(match.teamB)}',
                1
            )"
        >
            Bonus +1 — ${escapeHtml(match.teamB)}
        </button>

        <button
            class="admin-btn"
            onclick="addLiveMatchEvent(
                '${match._id}',
                'All-out',
                '${escapeHtml(match.teamA)}',
                2
            )"
        >
            All-out +2 — ${escapeHtml(match.teamA)}
        </button>

        <button
            class="admin-btn"
            onclick="addLiveMatchEvent(
                '${match._id}',
                'All-out',
                '${escapeHtml(match.teamB)}',
                2
            )"
        >
            All-out +2 — ${escapeHtml(match.teamB)}
        </button>

        <button
            class="admin-btn"
            onclick="addLiveMatchEvent(
                '${match._id}',
                'Timeout',
                '',
                0
            )"
        >
            Timeout
        </button>

        <button
            class="admin-btn"
            onclick="addLiveMatchEvent(
                '${match._id}',
                'Half-time',
                '',
                0
            )"
        >
            Half-time
        </button>

    </div>

        </div>


       

        <!-- END MATCH -->

        <div class="live-match-end">

                <button
                    class="live-end-btn"
                    onclick="endLiveMatch('${match._id}')"
                >
                    End Match
                </button>

            </div>

        </div>

    `;
                }


                actionButton += `

    <div
        style="
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.12);
        "
    >

        <button
            class="admin-btn"
            onclick="deleteMatch('${match._id}')"
        >
            Delete Match
        </button>

    </div>

`;


                item.innerHTML = `

                    <h3>

                        ${escapeHtml(
                    match.teamA
                )}

                        vs

                        ${escapeHtml(
                    match.teamB
                )}

                    </h3>


                    <p>

                        <strong>
                            Tournament:
                        </strong>

                        ${escapeHtml(
                    tournamentName
                )}

                    </p>


                    <p>

                        <strong>
                            Match Type:
                        </strong>

                        ${escapeHtml(
                    match.matchType
                )}

                    </p>


                    <p>

                        <strong>
                            Date & Time:
                        </strong>

                        ${escapeHtml(
                    matchDate
                )}

                    </p>


                    <p>

                        <strong>
                            Venue:
                        </strong>

                        ${escapeHtml(
                    match.venue ||
                    "N/A"
                )}

                    </p>


                    <p>

                        <strong>
                            Score:
                        </strong>

                        ${escapeHtml(
                    match.scoreA ??
                    0
                )}

                        -

                        ${escapeHtml(
                    match.scoreB ??
                    0
                )}

                    </p>


                    <p>

                        <strong>
                            Status:
                        </strong>

                    </p>


                    <span class="tournament-status">

                        ${escapeHtml(
                    status
                )}

                    </span>


                    ${actionButton}

                `;


                list.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "Match loading error:",
            error
        );


        if (message) {

            message.style.display =
                "none";

        }


        list.innerHTML =
            `<p>${escapeHtml(
                error.message
            )}</p>`;

    }

}


// =====================================================
// INITIAL LOAD
// =====================================================

if (!adminToken) {

    alert(
        "Admin login required."
    );


    window.location.href =
        "login.html";

} else {

    loadMemberships();

    loadTeams();

    loadTournaments();

    loadMatchTournaments();

    loadMatches();

}