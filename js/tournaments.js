async function loadPublicTournaments() {

    const tournamentList =
        document.getElementById("tournamentList");

    const loading =
        document.getElementById("tournamentLoading");


    try {

        const response =
            await fetch(
                "/api/tournaments"
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to load tournaments."
            );

        }


        const tournaments =
            result.tournaments || [];


        if (loading) {
            loading.remove();
        }


        if (tournaments.length === 0) {

            tournamentList.innerHTML = `
                <div class="tournament-empty">
                    No tournaments available
                    at the moment.
                </div>
            `;

            return;
        }


        tournamentList.innerHTML = "";


        tournaments.forEach(function (tournament) {

            const card =
                document.createElement("div");


            card.className =
                "tournament-card";


            // =========================================
            // DATE
            // =========================================

            const tournamentDate =
                tournament.tournamentDate
                    ? new Date(
                        tournament.tournamentDate
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    )
                    : "—";


            // =========================================
            // REGISTRATION DATES
            // =========================================

            const registrationStart =
                tournament.registrationStartDate
                    ? new Date(
                        tournament.registrationStartDate
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    )
                    : "—";


            const registrationEnd =
                tournament.registrationEndDate
                    ? new Date(
                        tournament.registrationEndDate
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    )
                    : "—";


            // =========================================
            // STATUS CLASS
            // =========================================

            let statusClass =
                "status-upcoming";


            if (
                tournament.status ===
                "Registration Open"
            ) {

                statusClass =
                    "status-registration";

            }

            else if (
                tournament.status ===
                "Ongoing"
            ) {

                statusClass =
                    "status-ongoing";

            }

            else if (
                tournament.status ===
                "Completed"
            ) {

                statusClass =
                    "status-completed";

            }

            else if (
                tournament.status ===
                "Cancelled"
            ) {

                statusClass =
                    "status-cancelled";

            }


            // =========================================
            // REGISTER TEAM BUTTON
            // =========================================

            const registerButton =
                tournament.status ===
                "Registration Open"

                    ? `
                        <div class="tournament-action">

                            <a
                                href="team-registration.html"
                                class="tournament-register-btn"
                            >
                                Register Team
                            </a>

                        </div>
                    `

                    : "";


            // =========================================
            // CARD
            // =========================================

            card.innerHTML = `

                <div class="tournament-card-header">

                    <h3>
                        ${escapeTournamentHtml(
                tournament.tournamentName
            )}
                    </h3>

                    <span
                        class="tournament-status ${statusClass}"
                    >
                        ${escapeTournamentHtml(
                tournament.status
            )}
                    </span>

                </div>


                <div class="tournament-details">


                    <div class="tournament-detail">

                        <strong>
                            Date:
                        </strong>

                        <span>
                            ${tournamentDate}
                        </span>

                    </div>


                    <div class="tournament-detail">

                        <strong>
                            Venue:
                        </strong>

                        <span>
                            ${escapeTournamentHtml(
                tournament.venue
            )}
                        </span>

                    </div>


                    <div class="tournament-detail">

                        <strong>
                            Location:
                        </strong>

                        <span>
                            ${escapeTournamentHtml(
                tournament.location
            )}
                        </span>

                    </div>


                    <div class="tournament-detail">

                        <strong>
                            Registration:
                        </strong>

                        <span>
                            ${registrationStart}
                            -
                            ${registrationEnd}
                        </span>

                    </div>


                </div>


                <div class="tournament-description">

                    <strong>
                        Description:
                    </strong>

                    <p>
                        ${escapeTournamentHtml(
                tournament.description ||
                "No description available."
            )}
                    </p>

                </div>


                ${registerButton}

            `;


            tournamentList.appendChild(card);

        });

    }


    catch (error) {

        console.error(
            "Tournament Loading Error:",
            error
        );


        tournamentList.innerHTML = `

            <div class="tournament-error">

                Unable to load tournaments.
                Please try again later.

            </div>

        `;

    }

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeTournamentHtml(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value || "";


    return div.innerHTML;

}


async function loadPublicMatchSchedule() {

    const schedule =
        document.getElementById("matchSchedule");

    const loading =
        document.getElementById("matchScheduleLoading");


    if (!schedule) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/matches"
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to load match schedule."
            );

        }


        const matches =
            (result.matches || []).filter(
                function (match) {
                    return (
                        match.status === "Upcoming" ||
                        match.status === "Live"
                    );
                }
            );


        if (loading) {
            loading.remove();
        }


        if (matches.length === 0) {

            schedule.innerHTML = `
                <div class="tournament-empty">
                    No matches scheduled
                    at the moment.
                </div>
            `;

            return;
        }


        schedule.innerHTML = "";


        matches.forEach(function (match) {

            const matchCard =
                document.createElement("div");


            matchCard.className =
                "match-schedule-card";


            const matchDate =
                match.matchDate
                    ? new Date(
                        match.matchDate
                    ).toLocaleString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    )
                    : "—";


            // =========================================
            // TOURNAMENT NAME
            // =========================================

            const tournamentName =
                match.tournamentId &&
                match.tournamentId.tournamentName
                    ? match.tournamentId.tournamentName
                    : "Tournament";


            matchCard.innerHTML = `

                <div class="match-schedule-tournament">

                    ${escapeTournamentHtml(
                tournamentName
            )}

                </div>


                <div class="match-schedule-header">

                    <strong>
                        ${escapeTournamentHtml(
                match.matchNumber
            )}
                    </strong>

                    <span>
                        ${escapeTournamentHtml(
                match.status
            )}
                    </span>

                </div>


                <div class="match-schedule-teams">

                    <span>
                        ${escapeTournamentHtml(
                match.teamA
            )}
                    </span>

                    <b>
                        VS
                    </b>

                    <span>
                        ${escapeTournamentHtml(
                match.teamB
            )}
                    </span>

                </div>


                <div class="match-schedule-details">

                    <span>
                        ${matchDate}
                    </span>

                    <span>
                        ${escapeTournamentHtml(
                match.venue || "—"
            )}
                    </span>

                    <span>
                        ${escapeTournamentHtml(
                match.matchType
            )}
                    </span>

                </div>

            `;


            schedule.appendChild(
                matchCard
            );

        });

    }


    catch (error) {

        console.error(
            "Match Schedule Loading Error:",
            error
        );


        schedule.innerHTML = `

            <div class="tournament-error">

                Unable to load match schedule.
                Please try again later.

            </div>

        `;

    }

}


// =====================================================
// INITIAL LOAD
// =====================================================

loadPublicTournaments();
loadPublicMatchSchedule();


// =====================================================
// AUTO REFRESH
// =====================================================

setInterval(
    loadPublicTournaments,
    5000
);