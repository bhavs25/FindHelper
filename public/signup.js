const customerRadio = document.getElementById("role1");
const professionalRadio = document.getElementById("role2");
const adminRadio = document.getElementById("role3");
const professionSelection = document.getElementById("professionSelection");
const selectedProfession = document.getElementById("selectedProfession");
function showModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}
window.addEventListener("click", function (event) {
  if (event.target.classList.contains("modal")) {
    event.target.style.display = "none";
  }
});

function toggleProfessionSelection() {
  if (professionalRadio.checked) {
    professionSelection.style.display = "block";
  } else {
    professionSelection.style.display = "none";
    selectedProfession.value = "";
    document
      .querySelectorAll(".profession-card")
      .forEach((c) => c.classList.remove("selected"));
  }
}

customerRadio.addEventListener("change", toggleProfessionSelection);
professionalRadio.addEventListener("change", toggleProfessionSelection);
adminRadio.addEventListener("change", toggleProfessionSelection);

document.querySelectorAll(".profession-card").forEach((card) => {
  card.addEventListener("click", () => {
    document
      .querySelectorAll(".profession-card")
      .forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    selectedProfession.value = card.getAttribute("data-profession");
  });
});

const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const role = document.querySelector('input[name="role"]:checked')?.value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  if (role === "professional" && !selectedProfession.value) {
    alert("Please select a profession.");
    return;
  }

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const fullName = `${firstName} ${lastName}`;

  const userData = {
    name: fullName,
    email: document.getElementById("email").value.trim(),
    password: password,
    role: role,
  };

  try {
    const userRes = await fetch(`http://localhost:3000/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!userRes.ok) {
      const err = await userRes.json();
      alert(
        "Registration failed (user data): " + (err.message || "Server error.")
      );
      return;
    }

    const createdUser = await userRes.json();

    const roleData = {
      userId: createdUser.id,
      firstName,
      lastName,
      email: userData.email,
      phone: document.getElementById("phone").value.trim(),
      location: document.getElementById("location").value.trim(),
      address: document.getElementById("addres").value.trim(),
    };

    if (role === "professional") {
      roleData.profession = selectedProfession.value;
      roleData.bio = document.getElementById("bio").value.trim();
      roleData.experience = document.getElementById("experience").value;
      roleData.charge = document.getElementById("charge").value;
    }

    const roleEndpoint =
      role === "professional"
        ? "professionals"
        : role === "admin"
        ? "admins"
        : "customers";

    const roleRes = await fetch(`http://localhost:3000/${roleEndpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roleData),
    });

    if (!roleRes.ok) {
      const err = await roleRes.json();
      alert(
        "Registration failed (role data): " + (err.message || "Server error.")
      );
      return;
    }

    alert("Registration successful!");
    registerForm.reset();
    toggleProfessionSelection();
  } catch (err) {
    console.error(err);
    alert("Registration failed: Network error or server down.");
  }
});
