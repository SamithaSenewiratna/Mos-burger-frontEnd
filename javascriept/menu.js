const apiBaseUrl = "http://localhost:8080";
let menuItems = {}; 
let cart = [];
let customers = [];
let selectedCustomerId = null;  // Stores selected customer

// Fetch customers 
async function fetchCustomers() {
    try {
        const response = await fetch(`${apiBaseUrl}/customer/allcustomers`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        customers = await response.json();
        populateCustomerDropdown();
    } catch (error) {
        console.error("Error fetching customers:", error);
    }
}

// Populate customer dropdown in cart
function populateCustomerDropdown() {
    const customerSelect = document.getElementById("customer-select");
    customerSelect.innerHTML = "<option value=''>Select a Customer</option>";

    customers.forEach(customer => {
        const option = document.createElement("option");
        option.value = customer.id;
        option.textContent = `ID: ${customer.id} | Name: ${customer.name}`;
        customerSelect.appendChild(option);
    });

    disableCartActions(true);
}

// Handle customer selection
document.getElementById("customer-select").addEventListener("change", function () {
    selectedCustomerId = this.value;
    document.getElementById("selected-customer").innerText = selectedCustomerId
        ? `Selected Customer: ${this.options[this.selectedIndex].text}`
        : "No customer selected";

    disableCartActions(!selectedCustomerId);
});

// Disable/Enable cart actions based on customer selection
function disableCartActions(disabled) {
    document.querySelectorAll(".add-to-cart-btn").forEach(button => button.disabled = disabled);
    document.getElementById("checkout-btn").disabled = disabled || cart.length === 0;
    document.getElementById("generate-bill-btn").disabled = disabled || cart.length === 0;
}

// Fetch menu items from backend
async function fetchMenuItems() {
    try {
        const response = await fetch(`${apiBaseUrl}/menu/all`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        menuItems = data.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});

        renderMenu();
    } catch (error) {
        console.error("Error fetching menu items:", error);
    }
}

// Render menu items dynamically
function renderMenu() {
    const menuContainer = document.getElementById("menu-container");
    menuContainer.innerHTML = "";

    Object.entries(menuItems).forEach(([category, items]) => {
        let sectionHTML = `<div class="menu-section"><h2>${category}</h2><div class="row">`;

        items.forEach(item => {
            sectionHTML += `
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <img src="${item.img}" class="card-img-top" alt="${item.itemName}">
                        <div class="card-body">
                            <h5 class="card-title">${item.itemName}</h5>
                            <p class="card-text">Price: $${item.price.toFixed(2)}</p>
                            <p class="card-text">Discount: ${item.discount}%</p>
                            <button class="btn btn-warning add-to-cart-btn" data-item-code="${item.itemCode}" disabled>Add to Cart</button>
                        </div>
                    </div>
                </div>`;
        });

        sectionHTML += `</div></div>`;
        menuContainer.innerHTML += sectionHTML;
    });

    attachCartEventListeners();
}

// Attach event listeners for "Add to Cart" buttons
function attachCartEventListeners() {
    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", function () {
            const itemCode = this.getAttribute("data-item-code");
            const item = findMenuItem(itemCode);
            if (item) addToCart(item);
        });
    });

    disableCartActions(true);
}

// Find menu item by itemCode
function findMenuItem(itemCode) {
    for (const category in menuItems) {
        const item = menuItems[category].find(item => item.itemCode === itemCode);
        if (item) return item;
    }
    return null;
}

// Add item to cart
function addToCart(item) {
    if (!selectedCustomerId) {
        alert("Please select a customer first!");
        return;
    }

    const existingItem = cart.find(cartItem => cartItem.itemCode === item.itemCode);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        item.quantity = 1;
        cart.push(item);
    }

    updateCart();
}

// Update cart UI
function updateCart() {
    const cartDetails = document.getElementById("cart-details");
    cartDetails.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.quantity * item.price * (1 - item.discount / 100);
        total += itemTotal;

        cartDetails.innerHTML += `
            <div class="cart-item d-flex justify-content-between align-items-center border-bottom pb-2">
                <div>
                    <h6>${item.itemName}</h6>
                    <p>Qty: ${item.quantity} | Price: $${item.price.toFixed(2)}</p>
                </div>
                <div>
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>`;
    });

    document.getElementById("checkout-btn").innerText = `Checkout ($${total.toFixed(2)})`;
    document.getElementById("checkout-btn").disabled = cart.length === 0;
    document.getElementById("generate-bill-btn").disabled = cart.length === 0;
}

// Checkout function - Sends order to backend
document.getElementById("checkout-btn").addEventListener("click", async function () {
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }
    if (!selectedCustomerId) {
        alert("Please select a customer!");
        return;
    }

    const orderData = {
        customerId: selectedCustomerId,
        details: cart.map(item => ({
            itemCode: item.itemCode,
            qty: item.quantity,
            unitPrice: item.price
        }))
    };

    try {
        const response = await fetch(`${apiBaseUrl}/orders/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        alert("Order placed successfully!");
        cart = [];
        updateCart();
    } catch (error) {
        console.error("Error placing order:", error);
        alert("An error occurred while placing the order.");
    }
});

// Clear cart
document.getElementById("clear-cart-btn").addEventListener("click", function () {
    cart = [];
    updateCart();
});



//remove item from cart

function removeFromCart(index) {
    // Remove item from cart using the index
    cart.splice(index, 1);

    // Update the cart display
    updateCart();
}



// Print Bill functionality
document.getElementById("generate-bill-btn").addEventListener("click", function () {
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    if (!selectedCustomerId) {
        alert("Please select a customer!");
        return;
    }

    // Find the selected customer
    const selectedCustomer = customers.find(customer => customer.id === parseInt(selectedCustomerId));

    // Prepare the bill content
    let billContent = `<h2> Mos Burgers </h2>`;
    billContent += `<p><strong>Customer ID:</strong> ${selectedCustomer.id}</p>`;
    billContent += `<p><strong>Customer Email:</strong> ${selectedCustomer.email}</p>`;
    billContent += `<hr><h4>Items Ordered</h4><table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>`;

    let totalAmount = 0;

    // Loop through cart to display items
    cart.forEach(item => {
        const itemTotal = item.quantity * item.price * (1 - item.discount / 100);
        totalAmount += itemTotal;
        billContent += `
            <tr>
                <td>${item.itemName}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${itemTotal.toFixed(2)}</td>
            </tr>`;
    });

    billContent += `
        </tbody>
    </table>
    <hr>
    <h4>Total: $${totalAmount.toFixed(2)}</h4>
    <footer><p>Thank you for your purchase!</p></footer>`;

       // Open a new window and write the bill content into it
       const printWindow = window.open('', '', 'width=800, height=600');  // Corrected open parameters
       printWindow.document.write('<html><head><title>Invoice</title>');
       
       // Add styles for the invoice content size
       printWindow.document.write(`
           <style>
               body {
                   font-family: Arial, sans-serif;
                   font-size: 16px;
                   margin: 20px;
               }
               h2, h4 {
                   text-align: center;
               }
               table {
                   width: 100%;
                   border-collapse: collapse;
                   margin-top: 20px;
               }
               table, th, td {
                   border: 1px solid #000;
               }
               th, td {
                   padding: 10px;
                   text-align: left;
               }
               footer {
                   margin-top: 20px;
                   text-align: center;
               }
           </style>
       `);
   
       printWindow.document.write('</head><body>');
       printWindow.document.write(billContent);
       printWindow.document.write('</body></html>');
       printWindow.document.close();
       printWindow.print()
});




function disableCartActions(disabled) {
    document.querySelectorAll(".add-to-cart-btn").forEach(button => button.disabled = disabled);
    document.getElementById("checkout-btn").disabled = disabled || cart.length === 0;
    document.getElementById("generate-bill-btn").disabled = disabled || cart.length === 0;
}



// Load menu and customers on page load
fetchMenuItems();
fetchCustomers();
