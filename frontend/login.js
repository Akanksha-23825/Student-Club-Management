function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("Please enter both email and password");
        return;
    }

    // Dummy authentication (for now)
    if (email.endsWith("@rvce.edu.in") && password.length >= 4) {
        alert("Login successful!");
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid credentials");
    }
}
