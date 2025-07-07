
  let allMyBookings = [];
  

  document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "professional") {
      alert("Unauthorized access. Please log in as a professional.");
      window.location.href = "login.html";
      return;
    }

    try {
      const [professionals, bookings] = await Promise.all([
        fetch("http://localhost:10000/professionals").then(res => res.json()),
        fetch("http://localhost:10000/bookings").then(res => res.json())
      ]);

      const professional = professionals.find(p => p.email === user.email);
      document.getElementById("professionalName").textContent = `${professional.firstName} ${professional.lastName}`;
      if (!professional) {
        alert("Professional profile not found.");
        return;
      }

      allMyBookings = bookings.filter(b => b.professionalId === professional.id);
      renderBookings();
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data. Please try again.");
    }
  });

  function renderBookings() {
  const tbody = document.querySelector("#bookingTable tbody");
  const searchFilter = document.getElementById("searchInput").value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;

  // Count statuses
  const pending = allMyBookings.filter(b => b.status === "pending").length;
  const completed = allMyBookings.filter(b => b.status === "completed").length;

  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("completedCount").textContent = completed;

  // Filter by both search + status
  const filtered = allMyBookings.filter(b => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchText = `${b.customerName} ${b.customerEmail} ${b.customerPhone}`.toLowerCase().includes(searchFilter);
    return matchStatus && matchText;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">No bookings found.</td></tr>`;
  } else {
    tbody.innerHTML = filtered.map(b => `
      <tr data-id="${b.id}">
        <td>${b.customerName}</td>
        <td>${b.customerEmail}</td>
        <td>${b.customerPhone}</td>
        <td>${b.serviceDate}</td>
        <td>${b.serviceTime}</td>
        <td>${b.serviceAddress}</td>
        <td class="status-cell">${b.status}</td>
        <td>${b.additionalNotes || '-'}</td>
        <td>
          ${b.status !== "completed"
            ? `<button class="complete-btn" onclick="markCompleted('${b.id}', this)">Mark as Completed</button>`
            : ''}
        </td>
      </tr>
    `).join("");
  }
}

  async function markCompleted(bookingId, button) {
    button.disabled = true;
    button.textContent = "Updating...";

    try {
      const res = await fetch(`http://localhost:10000/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" })
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Update locally
      const booking = allMyBookings.find(b => b.id === bookingId);
      if (booking) booking.status = "completed";
      renderBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to mark booking as completed.");
      button.disabled = false;
      button.textContent = "Mark as Completed";
    }
  }
  document.getElementById("searchBtn").addEventListener("click", function () {
  renderBookings();
});


  function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  }

  document.getElementById("searchInput").addEventListener("input", renderBookings);
  document.getElementById("statusFilter").addEventListener("change", renderBookings);
