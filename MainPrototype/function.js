// ---------------------- SIGN UP ----------------------
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const username = document.getElementById("signupUsername").value;
        const password = document.getElementById("signupPassword").value;

        if (localStorage.getItem(username)) {
            alert("Username already exists!");
            return;
        }

        alert("Account created successfully!");
        localStorage.setItem(username, password);
        window.location.href = "login.html";
    });
}

//  LOGIN 
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        const storedPassword = localStorage.getItem(username);

        if (storedPassword === null) {
            alert("User does not exist!");
            return;
        }

        if (storedPassword !== password) {
            alert("Incorrect password!");
            return;
        }

        alert("Login successful!");
        localStorage.setItem("loggedInUser", username);
        window.location.href = "maincontent.html";

    });
}

// ---------------------- LOGOUT ----------------------
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}

//
document.querySelectorAll(".toggle-password").forEach(icon => {
    icon.addEventListener("click", () => {
        const input = document.getElementById(icon.dataset.target);

        if (!input) return;

        if (input.type === "password") {
            input.type = "text";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        } else {
            input.type = "password";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        }
    });
});


// ---------------------- FORGOT PASSWORD ----------------------
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const messageBox = document.getElementById("message-box");

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const username = document.getElementById("forgotUsername").value.trim();
        const newPassword = document.getElementById("forgotPassword").value;

        if (!username || !newPassword) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        const storedPassword = localStorage.getItem(username);

        if (storedPassword === null) {
            showMessage("This username does not exist!", "error");
            return;
        }

        localStorage.setItem(username, newPassword);
        showMessage("Password successfully changed.", "success");

        forgotPasswordForm.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    });
}

function showMessage(message, type) {
    if (!messageBox) return;

    messageBox.innerHTML = "";

    const div = document.createElement("div");
    div.className = `message ${type === "error" ? "error" : "success"}`;
    div.textContent = message;

    messageBox.appendChild(div);
}

// ---------------------- PASSWORD TOGGLE (FIXED) ----------------------
// This now runs after the DOM is fully loaded, ensuring it works on all pages (including Forgot Password)
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".toggle-password").forEach(icon => {
        icon.addEventListener("click", () => {
            const input = document.getElementById(icon.dataset.target);

            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                icon.classList.replace("fa-eye-slash", "fa-eye");
            } else {
                input.type = "password";
                icon.classList.replace("fa-eye", "fa-eye-slash");
            }
        });
    });
});