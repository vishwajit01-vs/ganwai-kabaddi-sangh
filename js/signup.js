// =====================================================
// GANWAI KABADDI SANGH
// SIGNUP JAVASCRIPT
// =====================================================


// =====================================================
// SIGNUP FORM
// =====================================================

const signupForm =
    document.getElementById("signupForm");


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ================= FORM VALUES =================

            const fullName =
                document.getElementById(
                    "signupName"
                ).value.trim();


            const mobile =
                document.getElementById(
                    "signupMobile"
                ).value.trim();


            const email =
                document.getElementById(
                    "signupEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "signupPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            // ================= PASSWORD VALIDATION =================

            if (
                password !==
                confirmPassword
            ) {

                alert(
                    "Passwords do not match."
                );

                return;
            }


            // ================= FORM DATA =================

            const formData =
                new FormData();


            formData.append(
                "fullName",
                fullName
            );


            formData.append(
                "mobile",
                mobile
            );


            formData.append(
                "email",
                email
            );


            formData.append(
                "password",
                password
            );


            // ================= BACKEND REQUEST =================

            try {

                const response =
                    await fetch(
                        "/api/account/signup",
                        {
                            method: "POST",

                            body: formData
                        }
                    );


                const data =
                    await response.json();


                // ================= ERROR =================

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Account creation failed."
                    );

                    return;
                }


                // ================= SUCCESS =================

                alert(
                    "Account created successfully! Please login."
                );


                signupForm.reset();


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Signup Error:",
                    error
                );


                alert(
                    "Unable to connect to the server."
                );

            }

        }
    );

}