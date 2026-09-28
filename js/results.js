// =====================================================
// RESULTS PAGE
// =====================================================

async function loadResults() {

    const resultsList =
        document.getElementById("resultsList");

    const resultsLoading =
        document.getElementById("resultsLoading");


    if (!resultsList) {
        return;
    }


    try {

        if (resultsLoading) {
            resultsLoading.style.display = "block";
            resultsLoading.textContent =
                "Loading match results...";
        }


        const response =
            await fetch(
                "/api/matches"
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load match results."
            );

        }


        const matches =
            data.matches || [];


        // ---------------------------------------------
        // ONLY COMPLETED MATCHES
        // ---------------------------------------------

        const completedMatches =
            matches.filter(
                match =>
                    match.status === "Completed"
            );


        // ---------------------------------------------
        // LATEST MATCH FIRST
        // ---------------------------------------------

        completedMatches.sort(
            (a, b) =>
                new Date(b.matchDate) -
                new Date(a.matchDate)
        );


        resultsList.innerHTML = "";


        // ---------------------------------------------
        // NO RESULTS
        // ---------------------------------------------

        if (
            completedMatches.length === 0
        ) {

            if (resultsLoading) {
                resultsLoading.style.display = "none";
            }

            resultsList.innerHTML = `
                <div class="results-message">
                    No completed matches available yet.
                </div>
            `;

            return;
        }


        if (resultsLoading) {
            resultsLoading.style.display = "none";
        }


        // ---------------------------------------------
        // DISPLAY RESULTS
        // ---------------------------------------------

        completedMatches.forEach(
            match => {

                const teamA =
                    match.teamA || "Team A";

                const teamB =
                    match.teamB || "Team B";

                const scoreA =
                    Number(match.scoreA || 0);

                const scoreB =
                    Number(match.scoreB || 0);


                // -----------------------------------------
                // WINNER / DRAW
                // -----------------------------------------

                let resultText = "";

                if (scoreA > scoreB) {

                    const difference =
                        scoreA - scoreB;

                    resultText =
                        `${escapeHtml(teamA)} won by ${difference} points`;

                } else if (scoreB > scoreA) {

                    const difference =
                        scoreB - scoreA;

                    resultText =
                        `${escapeHtml(teamB)} won by ${difference} points`;

                } else {

                    resultText =
                        "Match Draw";

                }


                const tournamentName =
                    match.tournamentId &&
                    typeof match.tournamentId === "object"

                        ? match.tournamentId.tournamentName

                        : "Tournament";


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
                        : "N/A";


                const matchType =
                    match.matchType ||
                    "League";


                const venue =
                    match.venue ||
                    "N/A";


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "result-card";


                card.innerHTML = `

                    <div class="result-card-header">

                        <div class="tournament-name">
                            ${escapeHtml(
                    tournamentName
                )}
                        </div>

                        <span class="completed-badge">
                            COMPLETED
                        </span>

                    </div>


                   <div class="match-type">

    Match No:
    <strong>
        ${escapeHtml(
                    match.matchNumber || "—"
                )}
    </strong>

</div>


<div class="match-type">

    Match Type:
    <strong>
        ${escapeHtml(
                    matchType
                )}
    </strong>

</div>


                    <div class="result-scoreboard">

                        <div class="result-team">
                            ${escapeHtml(teamA)}
                        </div>


                        <div class="result-score">

                            ${scoreA}
                            -
                            ${scoreB}

                            <span class="result-vs">
                                FINAL SCORE
                            </span>

                        </div>


                        <div class="result-team team-b">
                            ${escapeHtml(teamB)}
                        </div>

                    </div>


                    <div class="result-details">

                        <div class="result-detail">

                            Date & Time

                            <strong>
                                ${escapeHtml(
                    matchDate
                )}
                            </strong>

                        </div>


                        <div class="result-detail">

                            Venue

                            <strong>
                                ${escapeHtml(
                    venue
                )}
                            </strong>

                        </div>


                        <div class="result-detail">

                            Status

                            <strong>
                                Completed
                            </strong>

                        </div>

                    </div>


                    <div class="result-winner">

                        ${resultText}

                    </div>

                `;


                resultsList.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Results loading error:",
            error
        );


        if (resultsLoading) {
            resultsLoading.style.display = "none";
        }


        resultsList.innerHTML = `

            <div class="results-message">

                ${escapeHtml(
            error.message ||
            "Unable to load results."
        )}

            </div>

        `;

    }

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// INITIAL LOAD
// =====================================================

loadResults();


// =====================================================
// AUTO REFRESH
// =====================================================

setInterval(
    loadResults,
    5000
);