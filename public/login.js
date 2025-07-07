function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  fetch(`http://localhost:10000/users?email=${email}&password=${password}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.length > 0) {
        const user = data[0];
        localStorage.setItem("user", JSON.stringify(user));
        alert("Login successful! Welcome " + user.email);

        // Redirect based on role
        if (user.role === "customer") {
          window.location.href = "customer.html";
        } else if (user.role === "professional") {
          window.location.href = "professional.html";
        } else if (user.role === "admin") {
          window.location.href = "admin.html";
        } else {
          alert("Unknown role! Can't redirect.");
        }
      } else {
        alert("Invalid email or password");
      }
    })
    .catch((err) => {
      console.error("Login error:", err);
      alert("Login failed. Please try again later.");
    });
}
