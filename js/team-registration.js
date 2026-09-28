// =====================================================
// TEAM REGISTRATION
// GANWAI KABADDI SANGH
// =====================================================


// =====================================================
// ELEMENTS
// =====================================================

const tournamentSelect =
    document.getElementById("tournamentId");

const playersContainer =
    document.getElementById("playersContainer");

const addPlayerBtn =
    document.getElementById("addPlayerBtn");

const playerCount =
    document.getElementById("playerCount");

const teamRegistrationForm =
    document.getElementById("teamRegistrationForm");


// =====================================================
// CONSTANTS
// =====================================================

let playerIndex = 0;

const MAX_PLAYERS = 15;

const REGISTRATION_FEE = 51;

const MOBILE_LENGTH = 10;

const UTR_LENGTH = 12;


// =====================================================
// LOAD TOURNAMENTS
// =====================================================

async function loadTournaments() {

    try {

        if (!tournamentSelect) {

            console.error(
                "Tournament select element not found."
            );

            return;
        }


        tournamentSelect.innerHTML = `
            <option value="">
                Loading tournaments...
            </option>
        `;

        tournamentSelect.disabled = true;


        const response =
            await fetch(
                "http://localhost:5000/api/tournaments",
                {
                    method: "GET"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load tournaments."
            );

        }


        const tournaments =
            Array.isArray(data.tournaments)
                ? data.tournaments
                : [];


        console.log(
            "All tournaments received:",
            tournaments
        );


        // =================================================
        // ONLY REGISTRATION OPEN TOURNAMENTS
        // =================================================

        const openTournaments =
            tournaments.filter(
                function (tournament) {

                    const status =
                        String(
                            tournament.status || ""
                        )
                            .trim()
                            .toLowerCase();


                    return (
                        status ===
                        "registration open"
                    );

                }
            );


        console.log(
            "Registration Open tournaments:",
            openTournaments
        );


        // =================================================
        // RESET DROPDOWN
        // =================================================

        tournamentSelect.innerHTML = `
            <option value="">
                Select Tournament
            </option>
        `;


        // =================================================
        // NO OPEN TOURNAMENT
        // =================================================

        if (
            openTournaments.length === 0
        ) {

            tournamentSelect.innerHTML = `
                <option value="">
                    No tournament registration is currently open
                </option>
            `;

            tournamentSelect.disabled = true;

            return;
        }


        // =================================================
        // ENABLE DROPDOWN
        // =================================================

        tournamentSelect.disabled = false;


        // =================================================
        // ADD TOURNAMENTS
        // =================================================

        openTournaments.forEach(
            function (tournament) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    tournament._id;


                const date =
                    tournament.tournamentDate
                        ? new Date(
                            tournament.tournamentDate
                        ).toLocaleDateString(
                            "en-IN"
                        )
                        : "";


                option.textContent =
                    date
                        ? `${tournament.tournamentName} - ${date}`
                        : tournament.tournamentName;


                tournamentSelect.appendChild(
                    option
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Tournament Loading Error:",
            error
        );


        if (tournamentSelect) {

            tournamentSelect.innerHTML = `
                <option value="">
                    Unable to load tournaments
                </option>
            `;

            tournamentSelect.disabled = true;

        }

    }

}


// =====================================================
// ADD PLAYER
// =====================================================

function addPlayer() {

    const currentPlayers =
        playersContainer.querySelectorAll(
            ".player-card"
        ).length;


    if (
        currentPlayers >= MAX_PLAYERS
    ) {

        alert(
            "Maximum 15 players can be registered for one team."
        );

        return;
    }


    const currentIndex =
        playerIndex;


    const playerCard =
        document.createElement("div");


    playerCard.className =
        "player-card";


    playerCard.dataset.index =
        currentIndex;


    playerCard.innerHTML = `

        <div class="player-card-header">

            <h4 class="player-card-title">
                Player ${currentIndex + 1}
            </h4>

            <button
                type="button"
                class="remove-player-btn"
            >
                Remove
            </button>

        </div>


        <div class="player-fields">


            <!-- PLAYER NAME -->

            <div class="form-group">

                <label>
                    Player Name
                    <span>*</span>
                </label>

                <input
                    type="text"
                    class="player-name"
                    placeholder="Enter player name"
                    required
                >

            </div>


            <!-- DOB -->

            <div class="form-group">

                <label>
                    Date of Birth
                    <span>*</span>
                </label>

                <input
                    type="date"
                    class="player-dob"
                    required
                >

            </div>


            <!-- GENDER -->

            <div class="form-group">

                <label>
                    Gender
                    <span>*</span>
                </label>

                <select
                    class="player-gender"
                    required
                >

                    <option value="">
                        Select Gender
                    </option>

                    <option value="Male">
                        Male
                    </option>

                    <option value="Female">
                        Female
                    </option>

                    <option value="Other">
                        Other
                    </option>

                </select>

            </div>


            <!-- WEIGHT -->

            <div class="form-group">

                <label>
                    Weight (kg)
                    <span>*</span>
                </label>

                <input
                    type="number"
                    class="player-weight"
                    min="0"
                    step="0.1"
                    placeholder="Enter weight in kg"
                    required
                >

            </div>


            <!-- MOBILE -->

            <div class="form-group">

                <label>
                    Mobile Number
                    <span>*</span>
                </label>

                <input
                    type="tel"
                    class="player-mobile"
                    placeholder="Enter exactly 10 digits"
                    minlength="10"
                    maxlength="10"
                    pattern="[0-9]{10}"
                    inputmode="numeric"
                    required
                >

            </div>


            <!-- MEMBERSHIP ID -->

            <div class="form-group">

                <label>
                    Membership ID
                    <small>(Optional)</small>
                </label>

                <input
                    type="text"
                    class="player-membership-id"
                    placeholder="Enter membership ID"
                >

            </div>


            <!-- PLAYER ROLE -->

            <div class="form-group">

                <label>
                    Player Role
                    <small>(Optional)</small>
                </label>

                <select class="player-role">

                    <option value="">
                        Select Role
                    </option>

                    <option value="Raider">
                        Raider
                    </option>

                    <option value="Defender">
                        Defender
                    </option>

                    <option value="All-rounder">
                        All-rounder
                    </option>

                </select>

            </div>


            <!-- JERSEY -->

            <div class="form-group">

                <label>
                    Jersey Number
                    <small>(Optional)</small>
                </label>

                <input
                    type="number"
                    class="player-jersey"
                    min="0"
                    placeholder="Enter jersey number"
                >

            </div>


            <!-- PHOTO -->

            <div class="form-group form-group-full">

                <label>
                    Player Photo
                    <span>*</span>
                </label>

                <input
                    type="file"
                    class="player-photo"
                    accept="image/jpeg,image/png"
                    required
                >

                <small class="field-help">
                    JPG or PNG only. Maximum 2MB.
                </small>

            </div>


        </div>

    `;


    playersContainer.appendChild(
        playerCard
    );


    const removeBtn =
        playerCard.querySelector(
            ".remove-player-btn"
        );


    removeBtn.addEventListener(
        "click",
        function () {

            playerCard.remove();

            updatePlayerCount();

            updatePlayerNumbers();

        }
    );


    playerIndex++;


    updatePlayerCount();

    updatePlayerNumbers();

}


// =====================================================
// UPDATE PLAYER COUNT
// =====================================================

function updatePlayerCount() {

    if (!playerCount) {
        return;
    }


    const totalPlayers =
        playersContainer.querySelectorAll(
            ".player-card"
        ).length;


    playerCount.textContent =
        `${totalPlayers} ${
            totalPlayers === 1
                ? "Player"
                : "Players"
        }`;

}


// =====================================================
// UPDATE PLAYER NUMBERS
// =====================================================

function updatePlayerNumbers() {

    const cards =
        playersContainer.querySelectorAll(
            ".player-card"
        );


    cards.forEach(
        function (card, index) {

            const title =
                card.querySelector(
                    ".player-card-title"
                );


            if (title) {

                title.textContent =
                    `Player ${index + 1}`;

            }

        }
    );

}


// =====================================================
// IMAGE VALIDATION
// =====================================================

function validateImageFile(
    file,
    fieldName
) {

    if (!file) {

        throw new Error(
            `${fieldName} is required.`
        );

    }


    const allowedTypes = [
        "image/jpeg",
        "image/png"
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        throw new Error(
            `${fieldName} must be JPG or PNG.`
        );

    }


    const maxSize =
        2 * 1024 * 1024;


    if (
        file.size > maxSize
    ) {

        throw new Error(
            `${fieldName} must not exceed 2MB.`
        );

    }

}


// =====================================================
// STRICT MOBILE VALIDATION
// =====================================================

function validateMobile(
    mobile,
    fieldName
) {

    const cleaned =
        String(mobile)
            .trim();


    // ONLY DIGITS + EXACTLY 10
    if (
        !/^\d{10}$/.test(
            cleaned
        )
    ) {

        throw new Error(
            `${fieldName} must be exactly 10 digits.`
        );

    }

}


// =====================================================
// STRICT UTR VALIDATION
// =====================================================

function validateUTR(
    utr
) {

    const cleaned =
        String(utr)
            .trim();


    // ONLY DIGITS + EXACTLY 12
    if (
        !/^\d{12}$/.test(
            cleaned
        )
    ) {

        throw new Error(
            "UTR / Payment Reference must be exactly 12 digits."
        );

    }

}


// =====================================================
// DOB VALIDATION
// =====================================================

function validateDOB(
    dob,
    fieldName
) {

    const value =
        String(dob)
            .trim();


    // Expected format:
    // YYYY-MM-DD

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            value
        )
    ) {

        throw new Error(
            `${fieldName} must have a valid 4-digit year.`
        );

    }


    const parts =
        value.split("-");


    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const day =
        Number(parts[2]);


    const currentYear =
        new Date().getFullYear();


    if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > currentYear
    ) {

        throw new Error(
            `${fieldName} must have a valid 4-digit year.`
        );

    }


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {

        throw new Error(
            `${fieldName} is not a valid date.`
        );

    }

}


// =====================================================
// ADD PLAYER BUTTON
// =====================================================

if (addPlayerBtn) {

    addPlayerBtn.addEventListener(
        "click",
        function () {

            addPlayer();

        }
    );

}


// =====================================================
// FORM SUBMISSION
// =====================================================

if (teamRegistrationForm) {

    teamRegistrationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const submitButton =
                teamRegistrationForm.querySelector(
                    'button[type="submit"]'
                );


            if (
                submitButton &&
                submitButton.disabled
            ) {

                return;
            }


            try {

                // =========================================
                // GET CURRENT TOKEN
                // =========================================

                const currentAuthToken =
                    localStorage.getItem(
                        "authToken"
                    );


                if (!currentAuthToken) {

                    alert(
                        "Your login session has expired. Please login again."
                    );

                    window.location.href =
                        "login.html";

                    return;
                }


                // =========================================
                // PLAYERS
                // =========================================

                const cards =
                    playersContainer.querySelectorAll(
                        ".player-card"
                    );


                if (
                    cards.length === 0
                ) {

                    throw new Error(
                        "Please add at least one player."
                    );

                }


                if (
                    cards.length > MAX_PLAYERS
                ) {

                    throw new Error(
                        "Maximum 15 players can be registered."
                    );

                }


                // =========================================
                // TEAM DETAILS
                // =========================================

                const teamName =
                    document
                        .getElementById("teamName")
                        .value
                        .trim();


                const captainName =
                    document
                        .getElementById("captainName")
                        .value
                        .trim();


                const captainMobile =
                    document
                        .getElementById("captainMobile")
                        .value
                        .trim();


                const teamEmail =
                    document
                        .getElementById("teamEmail")
                        .value
                        .trim();


                const location =
                    document
                        .getElementById("location")
                        .value
                        .trim();


                const tournamentId =
                    tournamentSelect.value;


                const paymentReference =
                    document
                        .getElementById(
                            "paymentReference"
                        )
                        .value
                        .trim();


                // =========================================
                // VALIDATION
                // =========================================

                if (!teamName) {

                    throw new Error(
                        "Please enter team name."
                    );

                }


                if (!captainName) {

                    throw new Error(
                        "Please enter captain name."
                    );

                }


                if (!captainMobile) {

                    throw new Error(
                        "Please enter captain mobile number."
                    );

                }


                validateMobile(
                    captainMobile,
                    "Captain mobile number"
                );


                if (!teamEmail) {

                    throw new Error(
                        "Please enter team email."
                    );

                }


                if (
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                        teamEmail
                    )
                ) {

                    throw new Error(
                        "Please enter a valid team email."
                    );

                }


                if (!location) {

                    throw new Error(
                        "Please enter district or location."
                    );

                }


                if (!tournamentId) {

                    throw new Error(
                        "Please select a tournament."
                    );

                }


                if (!paymentReference) {

                    throw new Error(
                        "Please enter Payment Reference / UTR."
                    );

                }


                // =========================================
                // STRICT UTR VALIDATION
                // =========================================

                validateUTR(
                    paymentReference
                );


                // =========================================
                // TEAM LOGO
                // =========================================

                const teamLogoInput =
                    document.getElementById(
                        "teamLogo"
                    );


                if (
                    teamLogoInput &&
                    teamLogoInput.files.length > 0
                ) {

                    validateImageFile(
                        teamLogoInput.files[0],
                        "Team logo"
                    );

                }


                // =========================================
                // FORM DATA
                // =========================================

                const formData =
                    new FormData();


                formData.append(
                    "teamName",
                    teamName
                );


                formData.append(
                    "captainName",
                    captainName
                );


                formData.append(
                    "captainMobile",
                    captainMobile
                );


                formData.append(
                    "email",
                    teamEmail
                );


                formData.append(
                    "location",
                    location
                );


                formData.append(
                    "tournamentId",
                    tournamentId
                );


                formData.append(
                    "registrationFee",
                    String(
                        REGISTRATION_FEE
                    )
                );


                formData.append(
                    "paymentReference",
                    paymentReference
                );


                // =========================================
                // TEAM LOGO
                // =========================================

                if (
                    teamLogoInput &&
                    teamLogoInput.files.length > 0
                ) {

                    formData.append(
                        "teamLogo",
                        teamLogoInput.files[0]
                    );

                }


                // =========================================
                // PLAYERS
                // =========================================

                const players = [];


                cards.forEach(
                    function (card, index) {

                        const name =
                            card.querySelector(
                                ".player-name"
                            )
                                .value
                                .trim();


                        const dob =
                            card.querySelector(
                                ".player-dob"
                            )
                                .value;


                        const gender =
                            card.querySelector(
                                ".player-gender"
                            )
                                .value;


                        const weight =
                            card.querySelector(
                                ".player-weight"
                            )
                                .value;


                        const mobile =
                            card.querySelector(
                                ".player-mobile"
                            )
                                .value
                                .trim();


                        const membershipId =
                            card.querySelector(
                                ".player-membership-id"
                            )
                                .value
                                .trim();


                        const playerRole =
                            card.querySelector(
                                ".player-role"
                            )
                                .value;


                        const jerseyNumber =
                            card.querySelector(
                                ".player-jersey"
                            )
                                .value;


                        const photoInput =
                            card.querySelector(
                                ".player-photo"
                            );


                        if (!name) {

                            throw new Error(
                                `Please enter name for Player ${index + 1}.`
                            );

                        }


                        if (!dob) {

                            throw new Error(
                                `Please enter date of birth for Player ${index + 1}.`
                            );

                        }


                        // =================================
                        // STRICT DOB VALIDATION
                        // =================================

                        validateDOB(
                            dob,
                            `Player ${index + 1} date of birth`
                        );


                        if (!gender) {

                            throw new Error(
                                `Please select gender for Player ${index + 1}.`
                            );

                        }


                        if (
                            !weight ||
                            Number(weight) <= 0
                        ) {

                            throw new Error(
                                `Please enter a valid weight for Player ${index + 1}.`
                            );

                        }


                        if (!mobile) {

                            throw new Error(
                                `Please enter mobile number for Player ${index + 1}.`
                            );

                        }


                        // =================================
                        // STRICT PLAYER MOBILE
                        // =================================

                        validateMobile(
                            mobile,
                            `Player ${index + 1} mobile number`
                        );


                        if (
                            !photoInput ||
                            photoInput.files.length === 0
                        ) {

                            throw new Error(
                                `Please upload photo for Player ${index + 1}.`
                            );

                        }


                        validateImageFile(
                            photoInput.files[0],
                            `Player ${index + 1} photo`
                        );


                        players.push({

                            name:
                            name,

                            dob:
                            dob,

                            gender:
                            gender,

                            weight:
                                Number(
                                    weight
                                ),

                            mobile:
                            mobile,

                            membershipId:
                            membershipId,

                            playerRole:
                            playerRole,

                            jerseyNumber:
                                jerseyNumber
                                    ? Number(
                                        jerseyNumber
                                    )
                                    : undefined

                        });


                        formData.append(
                            `playerPhoto_${index}`,
                            photoInput.files[0]
                        );

                    }
                );


                // =========================================
                // PLAYERS JSON
                // =========================================

                formData.append(
                    "players",
                    JSON.stringify(
                        players
                    )
                );


                // =========================================
                // SUBMIT BUTTON
                // =========================================

                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Submitting Registration...";

                }


                // =========================================
                // BACKEND REQUEST
                // =========================================

                const response =
                    await fetch(
                        "http://localhost:5000/api/teams",
                        {

                            method: "POST",

                            headers: {

                                "Authorization":
                                    "Bearer " +
                                    currentAuthToken

                            },

                            body:
                            formData

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Team registration failed."
                    );

                }


                // =========================================
                // SUCCESS
                // =========================================

                alert(
                    "Team registration submitted successfully!\n\n" +
                    "Status: Pending Verification\n\n" +
                    "Your payment and registration will be verified by the Sangh administration."
                );


                teamRegistrationForm.reset();


                playersContainer.innerHTML =
                    "";


                playerIndex = 0;


                updatePlayerCount();


                // Reload tournament list

                loadTournaments();


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Team Registration";

                }


            }

            catch (error) {

                console.error(
                    "Team Registration Error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to submit team registration."
                );


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Team Registration";

                }

            }

        }
    );

}


// =====================================================
// INITIAL LOAD
// =====================================================

loadTournaments();