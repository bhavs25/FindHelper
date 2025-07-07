const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "customer") {
  alert("Access denied. Please log in as customer.");
  window.location.href = "login.html";
}
function logout() {
  localStorage.removeItem("user");
  alert("Logged out successfully.");
  window.location.href = "login.html";
}
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const professionalId = urlParams.get("professionalId");

  if (!professionalId) {
    window.location.href = "index.html";
    return;
  }

  fetch(`http://localhost:10000/professionals/${professionalId}`)
    .then((response) => response.json())
    .then((professional) => {
      localStorage.setItem(
        "selectedProfessional",
        JSON.stringify(professional)
      );

      const professionalInfo = document.getElementById("professionalInfo");
      professionalInfo.innerHTML = `
                        <h2>${professional.firstName} ${
        professional.lastName
      }</h2>
                        <p><strong>Service:</strong> ${
                          professional.profession
                        }</p>
                        <p><strong>Location:</strong> ${
                          professional.location
                        }</p>
                       
                       ${
                         professional.charge
                           ? `<p><strong>Price:</strong> $${professional.charge}/hr</p>`
                           : ""
                       }
                    `;

      document
        .getElementById("bookingForm")
        .addEventListener("submit", function (e) {
          e.preventDefault();

          if (validateForm()) {
            const bookingData = {
              professionalId: professional.id,
              professionalName: professional.name,
              professionalService: professional.service,
              customerName: document.getElementById("name").value,
              customerEmail: document.getElementById("email").value,
              customerPhone: document.getElementById("phone").value,
              serviceDate: document.getElementById("date").value,
              serviceTime: document.getElementById("time").value,
              serviceAddress: document.getElementById("address").value,
              additionalNotes: document.getElementById("notes").value,
              bookingDate: new Date().toISOString(),
              status: "pending",
            };

            fetch("http://localhost:10000/bookings", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(bookingData),
            })
              .then((response) => response.json())
              .then((data) => {
                localStorage.setItem(
                  "latestBooking",
                  JSON.stringify(bookingData)
                );
                alert("Booking confirmed! We will contact you soon.");
                document.getElementById("bookingForm").reset();
              })
              .catch((error) => {
                console.error("Error:", error);
                alert(
                  "There was an error processing your booking. Please try again."
                );
              });
          }
        });
    })
    .catch((error) => {
      console.error("Error:", error);
      window.location.href = "index.html";
    });

  function validateForm() {
    let isValid = true;

    const name = document.getElementById("name").value;
    if (!name) {
      document.getElementById("nameError").textContent =
        "Please enter your name";
      isValid = false;
    } else {
      document.getElementById("nameError").textContent = "";
    }

    const email = document.getElementById("email").value;
    if (!email) {
      document.getElementById("emailError").textContent =
        "Please enter your email";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById("emailError").textContent =
        "Please enter a valid email";
      isValid = false;
    } else {
      document.getElementById("emailError").textContent = "";
    }

    const phone = document.getElementById("phone").value;
    if (!phone) {
      document.getElementById("phoneError").textContent =
        "Please enter your phone number";
      isValid = false;
    } else {
      document.getElementById("phoneError").textContent = "";
    }

    const date = document.getElementById("date").value;
    if (!date) {
      document.getElementById("dateError").textContent = "Please select a date";
      isValid = false;
    } else {
      document.getElementById("dateError").textContent = "";
    }

    const time = document.getElementById("time").value;
    if (!time) {
      document.getElementById("timeError").textContent = "Please select a time";
      isValid = false;
    } else {
      document.getElementById("timeError").textContent = "";
    }

    const address = document.getElementById("address").value;
    if (!address) {
      document.getElementById("addressError").textContent =
        "Please enter the service address";
      isValid = false;
    } else {
      document.getElementById("addressError").textContent = "";
    }

    return isValid;
  }
});
