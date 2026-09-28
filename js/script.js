// =====================================================
// GANWAI KABADDI SANGH
// MAIN JAVASCRIPT
// =====================================================


// =====================================================
// AUTH TOKEN
// =====================================================

const authToken = localStorage.getItem("authToken");


// =====================================================
// MEMBERSHIP FORM
// =====================================================

const membershipForm =
    document.getElementById("membershipForm");

if (membershipForm) {

    membershipForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const token = localStorage.getItem("authToken");

        if (!token) {
            alert(
                "Please login to your account before applying for membership."
            );

            window.location.href = "login.html";
            return;
        }

        const fullName =
            document.getElementById("fullName");

        const fatherName =
            document.getElementById("fatherName");

        const dob =
            document.getElementById("dob");

        const mobile =
            document.getElementById("mobile");

        const email =
            document.getElementById("email");

        const address =
            document.getElementById("address");

        const photo =
            document.getElementById("photo");

        const identityProof =
            document.getElementById("identityProof");

        const paymentReference =
            document.getElementById("paymentReference");


        // ================= NAME VALIDATION =================

        const namePattern =
            /^[A-Za-zÀ-ÿ\s.'-]+$/;

        if (!namePattern.test(fullName.value.trim())) {
            alert("Please enter a valid full name.");
            fullName.focus();
            return;
        }

        if (!namePattern.test(fatherName.value.trim())) {
            alert("Please enter a valid father's name.");
            fatherName.focus();
            return;
        }


        // ================= DOB VALIDATION =================

        if (!dob.value) {
            alert("Please select your date of birth.");
            dob.focus();
            return;
        }

        const selectedDOB =
            new Date(dob.value);

        const today =
            new Date();

        today.setHours(0, 0, 0, 0);

        if (isNaN(selectedDOB.getTime())) {
            alert("Please enter a valid date of birth.");
            dob.focus();
            return;
        }

        if (selectedDOB > today) {
            alert("Date of birth cannot be a future date.");
            dob.focus();
            return;
        }


        // ================= AGE VALIDATION =================

        let age =
            today.getFullYear() -
            selectedDOB.getFullYear();

        const monthDifference =
            today.getMonth() -
            selectedDOB.getMonth();

        if (
            monthDifference < 0 ||
            (
                monthDifference === 0 &&
                today.getDate() < selectedDOB.getDate()
            )
        ) {
            age--;
        }

        if (age < 5 || age > 100) {
            alert("Please enter a valid date of birth.");
            dob.focus();
            return;
        }


        // ================= MOBILE VALIDATION =================

        const mobileValue =
            mobile.value.trim();

        if (!/^[0-9]{10}$/.test(mobileValue)) {
            alert(
                "Mobile number must contain exactly 10 digits."
            );

            mobile.focus();
            return;
        }


        // ================= EMAIL VALIDATION =================

        const emailValue =
            email.value.trim();

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(emailValue)) {
            alert(
                "Please enter a valid email address."
            );

            email.focus();
            return;
        }


        // ================= ADDRESS VALIDATION =================

        const addressValue =
            address.value.trim();

        if (addressValue.length < 10) {
            alert("Please enter your complete address.");
            address.focus();
            return;
        }


        // ================= FILE SIZE =================

        const maxFileSize =
            2 * 1024 * 1024;


        // ================= PHOTO VALIDATION =================

        if (photo.files.length === 0) {
            alert("Please upload your member photo.");
            photo.focus();
            return;
        }

        const photoFile =
            photo.files[0];

        const allowedPhotoTypes = [
            "image/jpeg",
            "image/png"
        ];

        if (!allowedPhotoTypes.includes(photoFile.type)) {
            alert(
                "Member photo must be JPG or PNG format."
            );

            photo.value = "";
            return;
        }

        if (photoFile.size > maxFileSize) {
            alert(
                "Member photo must be less than 2 MB."
            );

            photo.value = "";
            return;
        }


        // ================= IDENTITY PROOF =================

        if (identityProof.files.length === 0) {
            alert("Please upload your identity proof.");
            identityProof.focus();
            return;
        }

        const identityFile =
            identityProof.files[0];

        const allowedIdentityTypes = [
            "image/jpeg",
            "image/png",
            "application/pdf"
        ];

        if (!allowedIdentityTypes.includes(identityFile.type)) {
            alert(
                "Identity proof must be JPG, PNG or PDF format."
            );

            identityProof.value = "";
            return;
        }

        if (identityFile.size > maxFileSize) {
            alert(
                "Identity proof must be less than 2 MB."
            );

            identityProof.value = "";
            return;
        }


        // ================= PAYMENT VALIDATION =================

        const paymentValue =
            paymentReference.value.trim();

        const paymentPattern =
            /^[A-Za-z0-9-]{6,40}$/;

        if (!paymentPattern.test(paymentValue)) {
            alert(
                "Please enter a valid payment reference / UTR number."
            );

            paymentReference.focus();
            return;
        }


        // ================= FORM DATA =================

        const formData =
            new FormData();

        formData.append(
            "fullName",
            fullName.value.trim()
        );

        formData.append(
            "fatherName",
            fatherName.value.trim()
        );

        formData.append(
            "dob",
            dob.value
        );

        formData.append(
            "mobile",
            mobileValue
        );

        formData.append(
            "email",
            emailValue
        );

        formData.append(
            "address",
            addressValue
        );

        formData.append(
            "photo",
            photoFile
        );

        formData.append(
            "identityProof",
            identityFile
        );

        formData.append(
            "paymentReference",
            paymentValue
        );


        // ================= BACKEND REQUEST =================

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/membership/apply",
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                "Bearer " + token
                        },

                        body: formData
                    }
                );

            const result =
                await response.json();

            if (response.ok) {

                alert(
                    "Membership application submitted successfully!\n\n" +
                    "Status: Pending Verification\n\n" +
                    "Your payment and application will be verified by the Sangh administration."
                );

                membershipForm.reset();

            } else {

                alert(
                    result.message ||
                    "Membership application failed."
                );
            }

        } catch (error) {

            console.error(
                "Membership Error:",
                error
            );

            alert(
                "Unable to connect to the backend server.\n\n" +
                "Please make sure the backend server is running."
            );
        }

    });
}


// =====================================================
// LOGIN
// =====================================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/account/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );

            const result =
                await response.json();

            if (response.ok) {

                localStorage.setItem(
                    "authToken",
                    result.token
                );

                localStorage.setItem(
                    "account",
                    JSON.stringify(result.account)
                );

                alert("Login successful!");

                window.location.href =
                    "index.html";

            } else {

                alert(
                    result.message ||
                    "Invalid email or password."
                );
            }

        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            alert(
                "Unable to connect to the backend server."
            );
        }

    });
}


// =====================================================
// ACCOUNT UI
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const guestActions =
        document.getElementById("guestActions");

    const userProfileButton =
        document.getElementById("userProfileButton");

    const accountSidebar =
        document.getElementById("accountSidebar");

    const accountOverlay =
        document.getElementById("accountOverlay");

    const closeAccountSidebar =
        document.getElementById("closeAccountSidebar");

    const sidebarLogoutButton =
        document.getElementById("sidebarLogoutButton");

    const sidebarAccountName =
        document.getElementById("sidebarAccountName");

    const sidebarAccountEmail =
        document.getElementById("sidebarAccountEmail");

    const sidebarFullName =
        document.getElementById("sidebarFullName");

    const sidebarMobile =
        document.getElementById("sidebarMobile");

    const sidebarEmail =
        document.getElementById("sidebarEmail");


    // ================= SAVED ACCOUNT =================

    const savedAccount =
        localStorage.getItem("account");

    const savedToken =
        localStorage.getItem("authToken");


    if (savedAccount && savedToken) {

        try {

            const account =
                JSON.parse(savedAccount);


            if (guestActions) {
                guestActions.style.display = "none";
            }

            if (userProfileButton) {
                userProfileButton.style.display = "flex";
            }

            if (sidebarAccountName) {
                sidebarAccountName.textContent =
                    account.fullName || "User";
            }

            if (sidebarAccountEmail) {
                sidebarAccountEmail.textContent =
                    account.email || "—";
            }

            if (sidebarFullName) {
                sidebarFullName.textContent =
                    account.fullName || "—";
            }

            if (sidebarMobile) {
                sidebarMobile.textContent =
                    account.mobile || "—";
            }

            if (sidebarEmail) {
                sidebarEmail.textContent =
                    account.email || "—";
            }

        } catch (error) {

            console.error(
                "Account data error:",
                error
            );
        }

    } else {

        if (guestActions) {
            guestActions.style.display = "flex";
        }

        if (userProfileButton) {
            userProfileButton.style.display = "none";
        }
    }


    // ================= OPEN SIDEBAR =================

    if (userProfileButton) {

        userProfileButton.addEventListener(
            "click",
            function () {

                if (accountSidebar) {
                    accountSidebar.classList.add("active");
                }

                if (accountOverlay) {
                    accountOverlay.classList.add("active");
                }
            }
        );
    }


    // ================= CLOSE SIDEBAR =================

    function closeSidebar() {

        if (accountSidebar) {
            accountSidebar.classList.remove("active");
        }

        if (accountOverlay) {
            accountOverlay.classList.remove("active");
        }
    }


    if (closeAccountSidebar) {
        closeAccountSidebar.addEventListener(
            "click",
            closeSidebar
        );
    }

    if (accountOverlay) {
        accountOverlay.addEventListener(
            "click",
            closeSidebar
        );
    }


    // ================= LOGOUT =================

    if (sidebarLogoutButton) {

        sidebarLogoutButton.addEventListener(
            "click",
            function () {

                localStorage.removeItem("authToken");
                localStorage.removeItem("account");

                closeSidebar();

                alert(
                    "You have been logged out successfully."
                );

                window.location.href =
                    "index.html";
            }
        );
    }

});


// =====================================================
// ACCOUNT PAGE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const accountName =
            document.getElementById("accountName");

        const accountEmail =
            document.getElementById("accountEmail");

        const accountMobile =
            document.getElementById("accountMobile");

        const accountLogoutButton =
            document.getElementById("logoutButton");


        if (
            !accountName &&
            !accountEmail &&
            !accountMobile
        ) {
            return;
        }


        // ================= ACCOUNT PAGE LOGOUT =================

        if (accountLogoutButton) {

            accountLogoutButton.addEventListener(
                "click",
                function () {

                    localStorage.removeItem("authToken");
                    localStorage.removeItem("account");

                    alert(
                        "You have been logged out successfully."
                    );

                    window.location.href =
                        "index.html";
                }
            );
        }


        const token =
            localStorage.getItem("authToken");


        if (!token) {

            window.location.href =
                "login.html";

            return;
        }


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/account/me",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Bearer " + token
                        }
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                localStorage.removeItem("authToken");
                localStorage.removeItem("account");

                window.location.href =
                    "login.html";

                return;
            }


            const account =
                result.account;


            if (accountName) {
                accountName.textContent =
                    account.fullName || "—";
            }

            if (accountEmail) {
                accountEmail.textContent =
                    account.email || "—";
            }

            if (accountMobile) {
                accountMobile.textContent =
                    account.mobile || "—";
            }


            localStorage.setItem(
                "account",
                JSON.stringify(account)
            );


        } catch (error) {

            console.error(
                "Account Page Error:",
                error
            );
        }

    }
);


// =====================================================
// ADMIN LINK
// =====================================================

const adminLink =
    document.getElementById("adminLink");

if (adminLink && authToken) {

    fetch(
        "http://localhost:5000/api/account/me",
        {
            headers: {
                "Authorization":
                    `Bearer ${authToken}`
            }
        }
    )
        .then(response => response.json())
        .then(data => {

            if (
                data.account &&
                data.account.role === "admin"
            ) {

                adminLink.style.display =
                    "inline-block";
            }

        })
        .catch(error => {

            console.error(
                "Admin check failed:",
                error
            );
        });
}


// =====================================================
// MY MEMBERSHIP
// =====================================================

const myMembershipSection =
    document.getElementById("myMembershipSection");

if (myMembershipSection) {

    const membershipLoginMessage =
        document.getElementById(
            "membershipLoginMessage"
        );

    const membershipDetails =
        document.getElementById(
            "membershipDetails"
        );

    const membershipStatus =
        document.getElementById(
            "myMembershipStatus"
        );

    const membershipId =
        document.getElementById(
            "myMembershipId"
        );

    const membershipName =
        document.getElementById(
            "myMembershipName"
        );

    const membershipType =
        document.getElementById(
            "myMembershipType"
        );

    const membershipValidity =
        document.getElementById(
            "myMembershipValidity"
        );


    if (!authToken) {

        if (membershipLoginMessage) {
            membershipLoginMessage.style.display =
                "block";
        }

        if (membershipDetails) {
            membershipDetails.style.display =
                "none";
        }

    } else {

        fetch(
            "http://localhost:5000/api/membership/my-membership",
            {
                headers: {
                    "Authorization":
                        `Bearer ${authToken}`
                }
            }
        )
            .then(response => response.json())
            .then(data => {

                if (!data.membership) {

                    if (membershipLoginMessage) {

                        membershipLoginMessage.textContent =
                            data.message ||
                            "No membership application found.";
                    }

                    if (membershipDetails) {
                        membershipDetails.style.display =
                            "none";
                    }

                    return;
                }


                const membership =
                    data.membership;


                if (membershipLoginMessage) {
                    membershipLoginMessage.style.display =
                        "none";
                }

                if (membershipDetails) {
                    membershipDetails.style.display =
                        "block";
                }

                if (membershipStatus) {
                    membershipStatus.textContent =
                        membership.membershipStatus;
                }

                if (membershipId) {
                    membershipId.textContent =
                        membership.membershipId ||
                        "Not assigned";
                }

                if (membershipName) {
                    membershipName.textContent =
                        membership.fullName ||
                        "—";
                }

                if (membershipType) {
                    membershipType.textContent =
                        membership.membershipType ||
                        "Annual";
                }

                if (membershipValidity) {
                    membershipValidity.textContent =
                        membership.membershipValidity ||
                        "Annual";
                }

            })
            .catch(error => {

                console.error(
                    "My Membership Error:",
                    error
                );

                if (membershipLoginMessage) {

                    membershipLoginMessage.textContent =
                        "Unable to load membership details.";
                }
            });
    }
}


// =====================================================
// MY TEAMS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const myTeamsContainer =
            document.getElementById(
                "myTeamsContainer"
            );


        if (!myTeamsContainer) {
            return;
        }


        const token =
            localStorage.getItem("authToken");


        if (!token) {

            myTeamsContainer.innerHTML = `
                <div class="no-teams">
                    Please login to view your team registrations.
                </div>
            `;

            return;
        }


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/teams/my-teams",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Bearer " + token
                        }
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                myTeamsContainer.innerHTML = `
                    <div class="team-error">
                        ${escapeHtml(
                    result.message ||
                    "Unable to load your team registrations."
                )}
                    </div>
                `;

                return;
            }


            const teams =
                result.teams || [];


            if (teams.length === 0) {

                myTeamsContainer.innerHTML = `
                    <div class="no-teams">
                        <strong>No team registration found.</strong>
                        <br>
                        <span>
                            You have not submitted any team registration yet.
                        </span>
                    </div>
                `;

                return;
            }


            myTeamsContainer.innerHTML =
                teams
                    .map(team => createTeamCard(team))
                    .join("");


        } catch (error) {

            console.error(
                "My Teams Error:",
                error
            );

            myTeamsContainer.innerHTML = `
                <div class="team-error">
                    Unable to connect to the server.
                    Please make sure the backend server is running.
                </div>
            `;
        }

    }
);


// =====================================================
// CREATE TEAM CARD
// =====================================================

function createTeamCard(team) {

    const tournament =
        team.tournamentId;

    const tournamentName =
        tournament &&
        typeof tournament === "object"
            ? tournament.tournamentName
            : "Tournament";

    const playerCount =
        Array.isArray(team.players)
            ? team.players.length
            : 0;

    const paymentStatus =
        team.paymentStatus ||
        "Pending Verification";

    const registrationStatus =
        team.registrationStatus ||
        "Pending";


    // ================= PAYMENT STATUS CLASS =================

    let paymentClass =
        "status-payment-pending";

    if (paymentStatus === "Verified") {
        paymentClass = "status-verified";
    } else if (paymentStatus === "Rejected") {
        paymentClass = "status-rejected";
    }


    // ================= REGISTRATION STATUS CLASS =================

    let registrationClass =
        "status-pending";

    if (registrationStatus === "Approved") {
        registrationClass = "status-approved";
    } else if (registrationStatus === "Rejected") {
        registrationClass = "status-rejected";
    }


    const submittedDate =
        team.createdAt
            ? formatDate(team.createdAt)
            : "—";

    const approvedDate =
        team.approvedAt
            ? formatDate(team.approvedAt)
            : "Not approved yet";


    const registrationId =
        team.registrationId
            ? `
                <div class="registration-id">
                    <span>Registration ID</span>
                    <strong>
                        ${escapeHtml(team.registrationId)}
                    </strong>
                </div>
            `
            : "";


    return `
        <div class="team-card">

            <div class="team-card-header">

                <div>

                    <h3>
                        ${escapeHtml(
        team.teamName ||
        "Unnamed Team"
    )}
                    </h3>

                    <p>
                        ${escapeHtml(
        tournamentName ||
        "Tournament"
    )}
                    </p>

                </div>

                <span class="team-status ${registrationClass}">
                    ${escapeHtml(registrationStatus)}
                </span>

            </div>


            <div class="team-info-grid">

                <div class="team-info-item">

                    <span>
                        Captain
                    </span>

                    <strong>
                        ${escapeHtml(
        team.captainName ||
        "—"
    )}
                    </strong>

                </div>


                <div class="team-info-item">

                    <span>
                        Players
                    </span>

                    <strong>
                        ${playerCount}
                    </strong>

                </div>


                <div class="team-info-item">

                    <span>
                        Registration Fee
                    </span>

                    <strong>
                        ₹${team.registrationFee || 51}
                    </strong>

                </div>


                <div class="team-info-item">

                    <span>
                        Payment Status
                    </span>

                    <strong>

                        <span class="team-status ${paymentClass}">
                            ${escapeHtml(paymentStatus)}
                        </span>

                    </strong>

                </div>


                <div class="team-info-item">

                    <span>
                        Submitted On
                    </span>

                    <strong>
                        ${submittedDate}
                    </strong>

                </div>


                <div class="team-info-item">

                    <span>
                        Approval Date
                    </span>

                    <strong>
                        ${approvedDate}
                    </strong>

                </div>

            </div>


            ${registrationId}

        </div>
    `;
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateValue) {

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}