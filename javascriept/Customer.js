const apiBaseUrl = "http://localhost:8080/customer"; 

// Fetch and display customers
async function fetchCustomers() {
    try {
        const response = await fetch(`${apiBaseUrl}/allcustomers`);
        const customers = await response.json();
        displayCustomers(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
    }
}

// Display customers in the table
function displayCustomers(customers) {
    const tableBody = document.getElementById("customer-table");
    tableBody.innerHTML = ""; // Clear previous data

    customers.forEach((customer) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phoneNumber}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="populateUpdateForm(${customer.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${customer.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Handle form submission for adding/updating a customer
document.getElementById("customer-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const customerId = document.getElementById("customerId").value;
    const customerData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phoneNumber: document.getElementById("phoneNumber").value
    };

    if (customerId) {
        customerData.id = customerId;
        updateCustomer(customerData);
    } else {
        addCustomer(customerData);
    }
});

// Add a new customer
async function addCustomer(customer) {
    try {
        await fetch(`${apiBaseUrl}/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customer)
        });

        alert("Customer added successfully!");
        document.getElementById("customer-form").reset();
        fetchCustomers(); 
        closeModal();
    } catch (error) {
        console.error("Error adding customer:", error);
    }
}

// Update a customer
async function updateCustomer(customer) {
    try {
        await fetch(`${apiBaseUrl}/updateCustomer`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customer)
        });

        alert("Customer updated successfully!");
        document.getElementById("customer-form").reset();
        fetchCustomers();
        closeModal();
    } catch (error) {
        console.error("Error updating customer:", error);
    }
}

// Delete a customer
async function deleteCustomer(id) {
    if (confirm("Are you sure you want to delete this customer?")) {
        try {
            await fetch(`${apiBaseUrl}/delete/${id}`, { method: "DELETE" });
            alert("Customer deleted successfully!");
            fetchCustomers(); 
        } catch (error) {
            console.error("Error deleting customer:", error);
        }
    }
}

// Populate update form with customer details
async function populateUpdateForm(id) {
    try {
        const response = await fetch(`${apiBaseUrl}/searchById/${id}`);
        const customer = await response.json();

        document.getElementById("customerId").value = customer.id;
        document.getElementById("name").value = customer.name;
        document.getElementById("email").value = customer.email;
        document.getElementById("phoneNumber").value = customer.phoneNumber;

        showModal();
    } catch (error) {
        console.error("Error fetching customer details:", error);
    }
}


//search by name

document.getElementById("search-bar").addEventListener("input", async function () {
    const searchTerm = this.value.trim();

    if (searchTerm === "") {
        fetchCustomers(); // Reload all 
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/searchByName/${encodeURIComponent(searchTerm)}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const customers = await response.json();
        displayCustomers(customers.length ? customers : []);
    } catch (error) {
        console.error("Error searching customers:", error);
    }
});




function showModal() {
    const updateModal = new bootstrap.Modal(document.getElementById("addCustomerModal"));
    updateModal.show();
}


function closeModal() {
    document.querySelector('[data-bs-dismiss="modal"]').click();
}

fetchCustomers();
