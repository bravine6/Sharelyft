let isValid = true; // Flag to track overall validation status

// Validate individual fields dynamically
function validateField(inputId, messageId, validator, errorMessage, successMessage) {
    const input = document.getElementById(inputId);
    const message = document.getElementById(messageId);
    const value = input.value.trim();

    if (!validator(value)) {
        message.innerText = errorMessage;
        message.style.color = "red";
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        return false;
    } else {
        message.innerText = successMessage;
        message.style.color = "green";
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
        return true;
    }
}

// Date of Birth Validation
function validateDOB() {
    const dobInput = document.getElementById("birthday");
    const dobMessage = document.getElementById("birthdayMsg");
    const dob = new Date(dobInput.value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const isValidAge = age > 18 || (age === 18 && today >= new Date(dob.setFullYear(dob.getFullYear() + 18)));

    if (!dobInput.value || !isValidAge) {
        dobMessage.innerText = "You must be at least 18 years old.";
        dobMessage.style.color = "red";
        dobInput.classList.add("is-invalid");
        dobInput.classList.remove("is-valid");
        return false;
    } else {
        dobMessage.innerText = "Valid date of birth.";
        dobMessage.style.color = "green";
        dobInput.classList.remove("is-invalid");
        dobInput.classList.add("is-valid");
        return true;
    }
}

// Validate Gender Selection
function validateGender() {
    const genderSelect = document.getElementById("gender");
    const genderMessage = document.getElementById("genderMsg");

    if (!genderSelect.value) {
        genderMessage.innerText = "Please select a gender.";
        genderMessage.style.color = "red";
        genderSelect.classList.add("is-invalid");
        genderSelect.classList.remove("is-valid");
        return false;
    } else {
        genderMessage.innerText = "Valid selection.";
        genderMessage.style.color = "green";
        genderSelect.classList.remove("is-invalid");
        genderSelect.classList.add("is-valid");
        return true;
    }
}

// Main Form Validation
function validateForm() {
    isValid = true; // Reset validation flag

    // Validate all fields
    isValid &= validateField(
        "firstName",
        "firstNameMsg",
        (name) => name.length > 0 && name.length <= 50,
        "First name must be between 1 and 50 characters.",
        "Valid first name entered."
    );

    isValid &= validateField(
        "lastName",
        "lastNameMsg",
        (name) => name.length > 0 && name.length <= 50,
        "Last name must be between 1 and 50 characters.",
        "Valid last name entered."
    );

    isValid &= validateField(
        "email",
        "emailMsg",
        (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
        "Enter a valid email address.",
        "Valid email entered."
    );

    isValid &= validateField(
        "phoneNumber",
        "phoneNumberMsg",
        (phone) => /^\d{10}$/.test(phone),
        "Phone number must be exactly 10 digits.",
        "Valid phone number entered."
    );

    isValid &= validateField(
        "password",
        "passwordMsg",
        (password) => password.length >= 8,
        "Password must be at least 8 characters.",
        "Valid password entered."
    );

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    isValid &= validateField(
        "confirmPassword",
        "confirmPasswordMsg",
        (value) => value === password,
        "Passwords do not match.",
        "Passwords match."
    );

    isValid &= validateDOB();
    isValid &= validateGender();

    if (isValid) {
        alert("Form submitted successfully!");
    } else {
        alert("Please fix errors before submitting.");
    }
}

// Reset the form and clear messages
function resetForm() {
    // Clear all error and success messages
    document.querySelectorAll(".msg").forEach((msg) => (msg.innerText = ""));

    // Remove validation classes from all fields
    document.querySelectorAll(".is-invalid, .is-valid").forEach((input) => {
        input.classList.remove("is-invalid", "is-valid");
    });

    // Reset the value of all input and select fields, excluding buttons
    document.querySelectorAll("input:not([type='button']):not([type='submit']), select").forEach((input) => {
        input.value = "";
    });

    // Reset validation flag
    isValid = true;
}


// Real-time validation
document.querySelectorAll("input, select").forEach((element) => {
    element.addEventListener("input", () => {
        isValid = true; // Reset validation flag dynamically
    });
});
