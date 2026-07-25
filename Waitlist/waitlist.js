// ===============================
// Waitlist Form - Noviq
// ===============================

const form = document.getElementById("regForm");
const submitBtn = document.getElementById("submitBtn");

// If your submit button is hidden by default
submitBtn.style.display = "inline-flex";

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Joining...";

    // -----------------------------
    // Collect Form Data
    // -----------------------------

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const graduationYear = document.getElementById("gradYear").value;
    const college = document.getElementById("collegeName").value.trim();
    const linkedin = document.getElementById("linkedin").value.trim();
    const github = document.getElementById("github").value.trim();
    const challenge = document.getElementById("challenge").value.trim();

    // -----------------------------
    // Basic Validation
    // -----------------------------

    if (
        !fullName ||
        !email ||
        !phone ||
        !graduationYear ||
        !college
    ) {
        alert("Please fill all required fields.");

        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Registration";
        return;
    }

    // -----------------------------
    // Save to Supabase
    // -----------------------------

    const { error } = await supabase
        .from("waitlist")
        .insert([
            {
                full_name: fullName,
                email: email,
                phone: phone,
                graduation_year: Number(graduationYear),
                college_name: college,
                linkedin: linkedin || null,
                github: github || null,
                challenge: challenge || null,
            },
        ]);

    // -----------------------------
    // Handle Errors
    // -----------------------------

    if (error) {
        console.error(error);

        alert("Something went wrong.\n\n" + error.message);

        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Registration";

        return;
    }

    // -----------------------------
    // Success
    // -----------------------------

    alert("🎉 You're officially on the Noviq waitlist!");

    form.reset();

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Registration";
});