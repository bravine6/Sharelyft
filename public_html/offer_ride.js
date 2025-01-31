document.addEventListener("DOMContentLoaded", () => {
    const offerRideForm = document.getElementById("offerRideForm");

    function validateField(inputId, validator, errorMessage) {
        const inputElement = document.getElementById(inputId);
        const feedbackElement = inputElement.nextElementSibling;

        if (!validator(inputElement.value.trim())) {
            inputElement.classList.remove("is-valid");
            inputElement.classList.add("is-invalid");
            feedbackElement.textContent = errorMessage;
            inputElement.style.backgroundColor = ""; // No background change if invalid
            return false;
        } else {
            inputElement.classList.remove("is-invalid");
            inputElement.classList.add("is-valid");
            feedbackElement.textContent = "Looks good!";
            inputElement.style.backgroundColor = "#d4edda"; // Light green background
            return true;
        }
    }

    function validateForm() {
        let isValid = true;

        // Validate departure location
        isValid &= validateField(
            "leavingFrom",
            (value) => value.length >= 3,
            "Departure location must be at least 3 characters."
        );

        // Validate destination
        isValid &= validateField(
            "goingTo",
            (value) => value.length >= 3,
            "Destination must be at least 3 characters."
        );

        // Validate travel date
        isValid &= validateField(
            "travelDate",
            (value) => !isNaN(Date.parse(value)) && new Date(value) >= new Date(),
            "Please provide a valid future date."
        );

        // Validate number of seats
        isValid &= validateField(
            "numSeats",
            (value) => /^\d+$/.test(value) && parseInt(value) > 0,
            "Please provide a valid number of seats (greater than 0)."
        );

        // Validate passenger type
        isValid &= validateField(
            "passengerType",
            (value) => ["male", "female", "all"].includes(value),
            "Please select a passenger type."
        );

        return isValid;
    }

    offerRideForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent form from submitting

        if (validateForm()) {
            // Do nothing after successful validation (form won't reset)
            alert("Form successfully validated!");
        }
    });
});
