document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.role === "admin") {
    const heading = document.getElementById("welcomeHeading");
    heading.textContent = `Welcome Back, ${user.name.toUpperCase()}`;
  }
});

const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") {
  alert("Access denied. Admins only.");
  location.replace("login.html");
}

function logout() {
  localStorage.removeItem("user");
  location.href = "login.html";
}

function showTab(tabId) {
  document
    .querySelectorAll(".tab-section")
    .forEach((tab) => (tab.style.display = "none"));
  document
    .querySelectorAll(".tab-buttons button")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(tabId).style.display = "block";
  event.target.classList.add("active");
}
function loadProfessionals() {
  fetch("http://localhost:10000/professionals")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector("#professionalsTable tbody");
      tbody.innerHTML = "";
      data.forEach((pro) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${pro.firstName} ${pro.lastName}</td>
          <td>${pro.email}</td>
          <td>${pro.profession}</td>
          <td>${pro.location}</td>
          <td class="${pro.approved ? "status-approved" : "status-pending"}">
            <i class="fas ${pro.approved ? "fa-check-circle" : "fa-clock"}"></i>
            ${pro.approved ? "Approved" : "Pending"}
          </td>
          <td>
            <button class="approve-btn" onclick="approvePro('${pro.id}')">
              <i class="fas fa-check"></i> Approve
            </button>
            <button class="delete-btn" onclick="deletePro('${pro.id}')">
              <i class="fas fa-trash"></i> Delete
            </button>
          </td>`;
        tbody.appendChild(tr);
      });

      document.getElementById("professionalsCount").textContent = data.length;
    })
    .catch((error) => console.error("Error loading professionals:", error));
}
function loadCustomers() {
  fetch("http://localhost:10000/customers")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.querySelector("#customersTable tbody");
      tbody.innerHTML = "";
      data.forEach((cust) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${cust.firstName} ${cust.lastName}</td>
          <td>${cust.email}</td>
          <td>${cust.phone}</td>
          <td>${cust.location}</td>`;
        tbody.appendChild(tr);
      });

      document.getElementById("customersCount").textContent = data.length;
    })
    .catch((error) => console.error("Error loading customers:", error));
}

function loadBookings() {
  Promise.all([
    fetch("http://localhost:10000/bookings").then((res) => res.json()),
    fetch("http://localhost:10000/professionals").then((res) => res.json()),
  ])
    .then(([bookings, professionals]) => {
      const tbody = document.querySelector("#bookingsTable tbody");
      tbody.innerHTML = "";

      bookings.forEach((book) => {
        const professional = professionals.find(
          (p) => p.id === book.professionalId
        );
        const profName = professional
          ? `${professional.firstName} ${professional.lastName}`
          : "N/A";
        const profProfession = professional ? professional.profession : "N/A";

        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${book.customerName}</td>
        <td>${profName}</td>
        <td>${profProfession}</td>
        <td>${book.serviceDate} ${book.serviceTime}</td>
        <td>${book.serviceAddress.replace(/\n/g, ", ")}</td>
        <td>${book.status}</td>
        <td>${book.review ? book.review : "-"}</td>
      `;
        tbody.appendChild(tr);
      });

      document.getElementById("bookingsCount").textContent = bookings.length;
    })
    .catch((error) => console.error("Error loading bookings:", error));
}
function approvePro(id) {
  fetch(`http://localhost:10000/professionals/${id}`)
    .then((res) => res.json())
    .then((professional) => {
      if (professional.approved) {
        alert("This professional is already approved.");
      } else {
        if (confirm("Are you sure you want to approve this professional?")) {
          fetch(`http://localhost:10000/professionals/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ approved: true }),
          })
            .then(() => {
              loadProfessionals();
              loadBookings();
            })
            .catch((error) =>
              console.error("Error approving professional:", error)
            );
        }
      }
    })
    .catch((error) =>
      console.error("Error fetching professional details:", error)
    );
}

function deletePro(id) {
  if (
    confirm(
      "Are you sure you want to delete this professional? This action cannot be undone."
    )
  ) {
    fetch(`http://localhost:10000/professionals/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        loadProfessionals();
        loadBookings();
      })
      .catch((error) => console.error("Error deleting professional:", error));
  }
}
document.addEventListener("DOMContentLoaded", () => {
  loadProfessionals();
  loadCustomers();
  loadBookings();
});
