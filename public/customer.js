const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "customer") {
  alert("Please log in as a customer.");
  location.replace("login.html");
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  if (user && user.name) {
    document.getElementById("customerName").textContent = `${user.name}`;
  }

  loadCustomerProfile();

  setupModals();

  fetch("http://localhost:10000/professionals")
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("professionals", JSON.stringify(data));

      const serviceSelect = document.getElementById("service");
      const locationSelect = document.getElementById("location");

      const uniqueServices = [...new Set(data.map((p) => p.profession))];
      uniqueServices.forEach((service) => {
        const option = document.createElement("option");
        option.value = service;
        option.textContent = service;
        serviceSelect.appendChild(option);
      });

      const uniqueLocations = [...new Set(data.map((p) => p.location))];
      uniqueLocations.forEach((location) => {
        const option = document.createElement("option");
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
      });

      document
        .getElementById("searchForm")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          const selectedService = serviceSelect.value;
          const selectedLocation = locationSelect.value;

          const filteredProfessionals = data.filter((professional) => {
            return (
              professional.profession === selectedService &&
              professional.location === selectedLocation
            );
          });

          displayResults(filteredProfessionals);
        });

      function displayResults(professionals) {
        const resultsSection = document.getElementById("results");

        if (professionals.length === 0) {
          resultsSection.innerHTML = `
                <div class="no-results">
                  <p>No professionals found for your selection.</p>
                  <p>Try different service or location.</p>
                </div>
              `;
          return;
        }

        resultsSection.innerHTML = '<div class="profile-cards"></div>';
        const grid = resultsSection.querySelector(".profile-cards");

        professionals.forEach((professional) => {
          const card = document.createElement("div");
          card.className = "profile-card";

          card.innerHTML = `
                <div class="profile-header">
                  <div>
                    <h3 class="profile-name">${professional.firstName} ${
            professional.lastName
          }</h3>
                    <p class="profile-service">${professional.profession}</p>
                  </div>
                  ${
                    professional.approved
                      ? '<span class="approved-badge"><i class="fas fa-check"></i> Approved</span>'
                      : ""
                  }
                </div>
                <div class="profile-body">
                  <div class="profile-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${professional.location}</span>
                  </div>
                  ${
                    professional.bio
                      ? `<p class="profile-bio">${professional.bio}</p>`
                      : ""
                  }
                  <div class="profile-detail">
                    <i class="fas fa-briefcase"></i>
                    <span>${
                      professional.experience || "0"
                    } years experience</span>
                  </div>
                </div>
                <div class="profile-footer">
                  ${
                    professional.charge
                      ? `<span class="profile-price">$${professional.charge}/hr</span>`
                      : ""
                  }
                  <button class="book-btn" data-id="${professional.id}">
                    <i class="fas fa-calendar-plus"></i> Book Now
                  </button>
                </div>
              `;

          grid.appendChild(card);
        });

        document.querySelectorAll(".book-btn").forEach((button) => {
          button.addEventListener("click", function () {
            const professionalId = this.getAttribute("data-id");
            const professional = professionals.find(
              (p) => p.id == professionalId
            );
            if (professional) {
              window.location.href = `booking.html?professionalId=${professionalId}`;
            } else {
              alert("Professional not found. Please try again.");
            }
          });
        });
      }

      loadCompletedBookings();
    })
    .catch((error) => {
      console.error("Error loading data:", error);
      document.getElementById("results").innerHTML = `
            <div class="no-results">
              <p>Error loading data. Please try again later.</p>
              <p>Make sure your JSON server is running at http://localhost:3000</p>
            </div>
          `;
    });
});

function loadCustomerProfile() {
  fetch(`http://localhost:10000/customers?email=${user.email}`)
    .then((res) => res.json())
    .then((customers) => {
      if (customers.length > 0) {
        const customer = customers[0];
        document.getElementById("editFirstName").value = customer.firstName;
        document.getElementById("editLastName").value = customer.lastName;
        document.getElementById("editEmail").value = customer.email;
        document.getElementById("editPhone").value = customer.phone;
        document.getElementById("editLocation").value = customer.location;
      }
    });
}

function setupModals() {
  document
    .getElementById("myProfileLink")
    .addEventListener("click", function (e) {
      e.preventDefault();
      document.getElementById("profileModal").style.display = "flex";
    });
  document
    .getElementById("myBookingsLink")
    .addEventListener("click", function (e) {
      e.preventDefault();
      openBookingsModal();
    });
  document.querySelectorAll(".close-modal").forEach((button) => {
    button.addEventListener("click", function () {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.style.display = "none";
      });
    });
  });
  document
    .getElementById("profileForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      updateProfile();
    });
}

function openBookingsModal() {
  fetch(`http://localhost:10000/bookings?customerEmail=${user.email}`)
    .then((res) => res.json())
    .then((bookings) => {
      const tbody = document.getElementById("bookingHistoryBody");
      tbody.innerHTML = "";

      if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No bookings found</td></tr>';
        document.getElementById("bookingsModal").style.display = "flex";
        return;
      }

      const professionalPromises = bookings.map((booking) => {
        return fetch(
          `http://localhost:10000/professionals/${booking.professionalId}`
        )
          .then((res) => res.json())
          .then((professional) => {
            return {
              booking,
              professional,
            };
          });
      });

      Promise.all(professionalPromises).then((results) => {
        results.forEach(({ booking, professional }) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
                <td>${new Date(booking.serviceDate).toLocaleDateString()}</td>
                <td>${professional.firstName} ${professional.lastName}</td>
                <td>${professional.profession}</td>
                <td>
                  <span class="status-badge status-${booking.status}">
                    ${
                      booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)
                    }
                  </span>
                </td>
              `;
          tbody.appendChild(tr);
        });
        document.getElementById("bookingsModal").style.display = "flex";
      });
    });
}

function updateProfile() {
  const firstName = document.getElementById("editFirstName").value;
  const lastName = document.getElementById("editLastName").value;
  const email = document.getElementById("editEmail").value;
  const phone = document.getElementById("editPhone").value;
  const location = document.getElementById("editLocation").value;

  // Update customer data
  fetch(`http://localhost:10000/customers?email=${user.email}`)
    .then((res) => res.json())
    .then((customers) => {
      if (customers.length > 0) {
        const customer = customers[0];
        return fetch(`http://localhost:3000/customers/${customer.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            location,
          }),
        });
      }
    })
    .then(() => {
      // Update user data
      return fetch(`http://localhost:10000/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
        }),
      });
    })
    .then(() => {
      alert("Profile updated successfully!");
      document.getElementById("profileModal").style.display = "none";
      document.getElementById(
        "customerName"
      ).textContent = `${firstName} ${lastName}`;
      user.name = `${firstName} ${lastName}`;
      user.email = email;
      localStorage.setItem("user", JSON.stringify(user));
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to update profile");
    });
}

function loadCompletedBookings() {
  const pros = JSON.parse(localStorage.getItem("professionals")) || [];
  const tbody = document.getElementById("completedBookingsBody");
  tbody.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;

  fetch(
    `http://localhost:10000/bookings?customerEmail=${encodeURIComponent(
      user.email
    )}&status=completed`
  )
    .then((res) => res.json())
    .then((bookings) => {
      bookings = bookings.filter((b) => !b.review);

      if (!bookings.length) {
        tbody.innerHTML = `<tr><td colspan="4">No completed bookings found.</td></tr>`;
        return;
      }

      tbody.innerHTML = "";
      bookings.forEach((b) => {
        const pro = pros.find((p) => p.id === b.professionalId);
        const profName = pro ? `${pro.firstName} ${pro.lastName}` : "Unknown";
        const profession = pro ? pro.profession : "Unknown";

        const tr = document.createElement("tr");
        tr.innerHTML = `
              <td>${profName}</td>
              <td>${profession}</td>
              <td>
                <span class="status-badge status-${b.status}">
                  ${b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                </span>
              </td>
              <td>
                <select id="rev-${
                  b.id
                }" type="select" placeholder="Write review...">
                  <option value="">Select</option>
      <option value="1">⭐</option>
      <option value="2">⭐⭐</option>
      <option value="3">⭐⭐⭐</option>
      <option value="4">⭐⭐⭐⭐</option>
      <option value="5">⭐⭐⭐⭐⭐</option>
    </select>

                <button onclick="submitReview('${
                  b.id
                }')" class="btn-primary" style="padding: 5px 10px; margin-left: 5px;">Submit</button>
              </td>
            `;
        tbody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="4">Error loading data.</td></tr>`;
    });
}

function submitReview(bookingId) {
  const input = document.getElementById(`rev-${bookingId}`);
  if (!input) return;

  const reviewText = input.value.trim();
  if (!reviewText) {
    alert("Please enter a review before submitting.");
    return;
  }

  fetch(`http://localhost:10000/bookings/${bookingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ review: reviewText }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to update review");
      alert("Review submitted!");

      const row = input.closest("tr");
      if (row) row.remove();

      const tbody = document.getElementById("completedBookingsBody");
      if (tbody.children.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No completed bookings for review are found.</td></tr>`;
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Error submitting review.");
    });
}
