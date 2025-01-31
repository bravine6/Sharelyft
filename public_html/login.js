function validateLoginForm(event) {
    event.preventDefault();

    let isValid = true;

    // Get the email and password input values
    const email = document.getElementById('loginEmail').value.trim();
    const emailMsg = document.getElementById('emailMsg');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        emailMsg.innerText = "Please enter a valid email address.";
        emailMsg.style.color = "red";
        isValid = false;
    } else {
        emailMsg.innerText = "";
    }

    const password = document.getElementById('loginPassword').value.trim();
    const passwordMsg = document.getElementById('passwordMsg');

    if (password.length < 6) {
        passwordMsg.innerText = "Password must be at least 6 characters long.";
        passwordMsg.style.color = "red";
        isValid = false;
    } else {
        passwordMsg.innerText = "";
    }

    if (isValid) {
        document.getElementById("loginForm").submit(); // Submit form normally
    }
}
