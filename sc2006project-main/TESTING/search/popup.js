var restaurantName = document.createElement("p");
var restaurantAddress = document.createElement("p");

var bookingForm = document.createElement("form");
bookingForm.setAttribute("id", "bookingForm");
bookingForm.setAttribute("class", "form-group");

var nameLabel = document.createElement("label");
nameLabel.setAttribute("for", "name");
nameLabel.textContent = "Name:";

var nameInput = document.createElement("input");
nameInput.setAttribute("type", "text");
nameInput.setAttribute("id", "name");
nameInput.setAttribute("name", "name");
nameInput.setAttribute("required", "true");

var emailLabel = document.createElement("label");
emailLabel.setAttribute("for", "email");
emailLabel.textContent = "Email:";

var emailInput = document.createElement("input");
emailInput.setAttribute("type", "email");
emailInput.setAttribute("id", "email");
emailInput.setAttribute("name", "email");
emailInput.setAttribute("required", "true");

var phoneLabel = document.createElement("label");
phoneLabel.setAttribute("for", "phone");
phoneLabel.textContent = "Phone No:";

var phoneInput = document.createElement("input");
phoneInput.setAttribute("type", "number");
phoneInput.setAttribute("id", "phone");
phoneInput.setAttribute("name", "phone");
phoneInput.setAttribute("required", "true");

var dateLabel = document.createElement("label");
dateLabel.setAttribute("for", "date");
dateLabel.textContent = "Date:";

var dateInput = document.createElement("input");
dateInput.setAttribute("type", "date");
dateInput.setAttribute("id", "date");
dateInput.setAttribute("name", "date");
dateInput.setAttribute("required", "true");

var timeLabel = document.createElement("label");
timeLabel.setAttribute("for", "time");
timeLabel.textContent = "Time:";

var timeInput = document.createElement("input");
timeInput.setAttribute("type", "time");
timeInput.setAttribute("id", "time");
timeInput.setAttribute("name", "time");
timeInput.setAttribute("required", "true");

var paxLabel = document.createElement("label");
paxLabel.setAttribute("for", "Pax");
paxLabel.textContent = "Number of Pax:";

var paxInput = document.createElement("input");
paxInput.setAttribute("type", "number");
paxInput.setAttribute("id", "paxSize");
paxInput.setAttribute("name", "paxSize");
paxInput.setAttribute("required", "true");


var submitButton = document.createElement("input");
submitButton.setAttribute("type", "submit");
submitButton.setAttribute("value", "Submit");


bookingForm.appendChild(nameLabel);
bookingForm.appendChild(nameInput);
bookingForm.appendChild(emailLabel);
bookingForm.appendChild(emailInput);
bookingForm.appendChild(phoneLabel);
bookingForm.appendChild(phoneInput);
bookingForm.appendChild(dateLabel);
bookingForm.appendChild(dateInput);
bookingForm.appendChild(timeLabel);
bookingForm.appendChild(timeInput);
bookingForm.appendChild(paxLabel);
bookingForm.appendChild(paxInput);
bookingForm.appendChild(submitButton);


function createAndOpenPopup(restName, restAdd) {
    var popup = document.getElementById("popup");

    // If popup element doesn't exist, create it
    if (!popup) {
        popup = document.createElement("div");
        popup.setAttribute("id", "popup");
        popup.classList.add("popup");

        var closeButton = document.createElement("span");
        closeButton.classList.add("close");
        closeButton.textContent = "×"; // Using × for close symbol
        closeButton.addEventListener("click", closePopup);

        var popupContent = document.createElement("div");
        popupContent.classList.add("popup-content");
        var strongElement = document.createElement("strong");
        strongElement.textContent = "Make a reservation with us today!";

        popupContent.appendChild(strongElement);
        popup.appendChild(closeButton);
        popup.appendChild(popupContent);
        popup.appendChild(bookingForm);

        // Append the popup to the document body
        document.body.appendChild(popup);
    }

    restaurantName.textContent = "Restaurant: "+ restName;
    popup.querySelector(".popup-content").appendChild(restaurantName);
    restaurantAddress.textContent = "Address: "+ restAdd;
    popup.querySelector(".popup-content").appendChild(restaurantAddress);

    // Display the popup
    popup.style.display = "block";

    document.getElementById('bookingForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const paxSize = parseInt(document.getElementById('paxSize').value); // Parse the number of guests as an integer
        if (name.trim() === '' || email.trim() === '' || phone.trim() === '' || date.trim() === '' || time.trim() === '' || isNaN(paxSize)) { // Check if guests is NaN
            alert('Please fill out all fields correctly.');
            return;
    }
    
    // Get the current user's ID
    const currentUser = firebase.auth().currentUser;
    const userID = currentUser ? currentUser.uid : null;
    
    // Save reservation to Firestore
    saveReservationToFirestore(restName, restAdd, name, email, phone, date, time, paxSize, userID);
    
    // Reset form fields
    document.getElementById('bookingForm').reset();
    
    // Optionally, display a success message or perform other actions
    alert('Reservation submitted successfully!');
    });
    
    

}


// Function to close the popup
function closePopup() {
    restaurantName.remove();
    restaurantAddress.remove();
    document.getElementById("popup").style.display = "none";

}


function saveReservationToFirestore(restName, restAdd, name, email, phone, date, time, guests, userID) {
    const reservationData = {
        restaurantName: restName,
        restaurantAddress: restAdd,
        name: name,
        email: email,
        phone: phone,
        date: date,
        time: time,
        guests: guests,
        completed: false,
        userId: userID // Include the userID in the reservation data
    };

    db.collection('reservations').add(reservationData)
        .then(function(docRef) {
            console.log("Reservation added with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding reservation: ", error);
        });
}