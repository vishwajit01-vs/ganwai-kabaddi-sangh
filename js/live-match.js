// =====================================================
// HOME LIVE MATCH
// =====================================================

async function loadHomeLiveMatch() {

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/matches/live"
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load live match."
            );

        }

        const match =
            data.match;


        const status =
            document.getElementById(
                "homeMatchStatus"
            );

        const teamA =
            document.getElementById(
                "homeTeamA"
            );

        const teamB =
            document.getElementById(
                "homeTeamB"
            );

        const scoreA =
            document.getElementById(
                "homeScoreA"
            );

        const scoreB =
            document.getElementById(
                "homeScoreB"
            );

        const liveScore =
            document.getElementById(
                "homeLiveScore"
            );

        const info =
            document.getElementById(
                "homeMatchInfo"
            );

        const venue =
            document.getElementById(
                "homeLiveVenue"
            );


        // =============================================
        // NO LIVE MATCH
        // =============================================

        if (!match) {

            status.textContent =
                "MATCH CENTER";

            teamA.textContent =
                "—";

            teamB.textContent =
                "—";

            scoreA.textContent =
                "0";

            scoreB.textContent =
                "0";

            liveScore.textContent =
                "NO LIVE MATCH";

            info.textContent =
                "Live match scores will appear here when a match is in progress.";

            venue.textContent =
                "Stay connected for live updates";

            return;
        }


        // =============================================
        // LIVE MATCH FOUND
        // =============================================

        status.textContent =
            "🔴 LIVE";

        teamA.textContent =
            match.teamA;

        teamB.textContent =
            match.teamB;

        scoreA.textContent =
            match.scoreA ?? 0;

        scoreB.textContent =
            match.scoreB ?? 0;

        liveScore.textContent =
            `${match.scoreA ?? 0} - ${match.scoreB ?? 0}`;


        info.textContent =
            match.tournamentId &&
            match.tournamentId.tournamentName
                ? match.tournamentId.tournamentName
                : "Live Match";


        venue.textContent =
            match.venue
                ? `🏟️ ${match.venue}`
                : "Ganwai Kabaddi Sangh";

    } catch (error) {

        console.error(
            "Home live match error:",
            error
        );

    }

}


// =============================================
// INITIAL LOAD
// =============================================

loadHomeLiveMatch();


// =====================================================
// HOME RECENT MATCH RESULT
// =====================================================

async function loadRecentMatchResult() {

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/matches"
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
        // GET COMPLETED MATCHES
        // ---------------------------------------------

        const completedMatches =
            matches.filter(
                (match) =>
                    match.status === "Completed"
            );


        const tournament =
            document.getElementById(
                "recentMatchTournament"
            );

        const date =
            document.getElementById(
                "recentMatchDate"
            );

        const teamA =
            document.getElementById(
                "recentTeamA"
            );

        const teamB =
            document.getElementById(
                "recentTeamB"
            );

        const scoreA =
            document.getElementById(
                "recentScoreA"
            );

        const scoreB =
            document.getElementById(
                "recentScoreB"
            );

        const matchType =
            document.getElementById(
                "recentMatchType"
            );

        const matchTypeBadge =
            document.getElementById(
                "recentMatchTypeBadge"
            );

        const venue =
            document.getElementById(
                "recentMatchVenue"
            );

        const message =
            document.getElementById(
                "recentMatchMessage"
            );


        // ---------------------------------------------
        // NO COMPLETED MATCH
        // ---------------------------------------------

        if (
            completedMatches.length === 0
        ) {

            tournament.textContent =
                "No Recent Match";

            date.textContent =
                "—";

            teamA.textContent =
                "—";

            teamB.textContent =
                "—";

            scoreA.textContent =
                "—";

            scoreB.textContent =
                "—";

            matchType.textContent =
                "Match Type: —";

            matchTypeBadge.textContent =
                "MATCH";

            venue.textContent =
                "Venue: —";

            message.textContent =
                "No completed match available yet.";

            return;

        }


        // ---------------------------------------------
        // LATEST COMPLETED MATCH
        // ---------------------------------------------

        completedMatches.sort(
            (a, b) =>
                new Date(b.matchDate) -
                new Date(a.matchDate)
        );


        const recentMatch =
            completedMatches[0];


        tournament.textContent =
            recentMatch.tournamentId &&
            recentMatch.tournamentId.tournamentName
                ? recentMatch.tournamentId.tournamentName
                : "Ganwai Kabaddi Sangh";


        date.textContent =
            recentMatch.matchDate
                ? new Date(
                    recentMatch.matchDate
                ).toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                )
                : "—";


        teamA.textContent =
            recentMatch.teamA;


        teamB.textContent =
            recentMatch.teamB;


        scoreA.textContent =
            recentMatch.scoreA ?? 0;


        scoreB.textContent =
            recentMatch.scoreB ?? 0;


        // ---------------------------------------------
        // DYNAMIC MATCH TYPE
        // ---------------------------------------------

        matchType.textContent =
            `Match Type: ${
                recentMatch.matchType ||
                "—"
            }`;


        matchTypeBadge.textContent =
            recentMatch.matchType ||
            "MATCH";


        venue.textContent =
            `Venue: ${
                recentMatch.venue ||
                "—"
            }`;


        message.textContent =
            "Match completed successfully.";

    } catch (error) {

        console.error(
            "Recent match result error:",
            error
        );

    }

}


// =============================================
// AUTO REFRESH EVERY 5 SECONDS
// =============================================

setInterval(
    loadHomeLiveMatch,
    5000
);


// Load recent completed match
loadRecentMatchResult();


// Refresh recent result automatically
setInterval(
    loadRecentMatchResult,
    5000
);