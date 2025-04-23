const apiBaseUrl = "http://localhost:8080/menu";
let menuItems = {}; 
let selectedImageDataUrl = ""; 
let isEditing = false; 
let editingItemCode = null; // 

// Fetch all menu items 
async function fetchMenuItems() {
    try {
        const response = await fetch(`${apiBaseUrl}/all`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
      // Debugging log

        menuItems = data.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});

        renderItemsTable();
    } catch (error) {
        console.error("Error fetching menu items:", error);
    }
}

function renderItemsTable() {
    const itemTable = document.getElementById("item-table");

    // Check if itemTable exists in the DOM
    if (!itemTable) {
        console.error("Element with id 'item-table' not found!");
        return;
    }

    itemTable.innerHTML = ""; // Clear previous content

    Object.entries(menuItems).forEach(([category, items]) => {
        items.forEach(item => {
            const row = document.createElement("tr");

            // Sanity check to avoid breaking on undefined values
            const itemCode = item.itemCode || "";
            const itemName = item.itemName || "";
            const price = item.price != null ? parseFloat(item.price).toFixed(2) : "0.00";
            const discount = item.discount != null ? `${item.discount}%` : "0%";
            const imageUrl = item.img || "";
            const categoryName = item.category || "";

            row.innerHTML = `
                <td>${itemCode}</td>
                <td>${itemName}</td>
                <td>${categoryName}</td>
                <td>$${price}</td>
                <td>${discount}</td>
                <td><img src="${imageUrl}" width="50" onerror="this.onerror=null;this.src='https://via.placeholder.com/50';"></td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="populateUpdateForm('${itemCode}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMenuItem('${itemCode}')">Delete</button>
                </td>
            `;

            itemTable.appendChild(row);
        });
    });
}

// Populate update form with item details (Fixed API call)
async function populateUpdateForm(itemCode) {
    try {
        const response = await fetch(`${apiBaseUrl}/searchByItemCode/${itemCode}`);
        if (!response.ok) throw new Error("Failed to fetch item details");

        const items = await response.json();

        if (!items || items.length === 0) {
            alert("Item not found!");
            return;
        }

        const item = items[0]; // Your backend returns a List<MenuItem>, so pick first item

        document.getElementById("modalTitle").textContent = "Update Item";
        document.getElementById("category").value = item.category;
        document.getElementById("itemCode").value = item.itemCode;
        document.getElementById("itemCode").disabled = true;
        document.getElementById("itemName").value = item.itemName;
        document.getElementById("price").value = item.price;
        document.getElementById("discount").value = item.discount;
        document.getElementById("img").value = item.img;
        document.getElementById("img-preview").src = item.img;
        document.getElementById("img-preview").style.display = "block";

        selectedImageDataUrl = "";
        isEditing = true;
        editingItemCode = itemCode;

        const updateModal = new bootstrap.Modal(document.getElementById("addItemModal"));
        updateModal.show();

    } catch (error) {
        console.error("Error fetching item details:", error);
    }
}


// Handle add/update menu item
document.getElementById("item-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const category = document.getElementById("category").value;
    const itemCode = document.getElementById("itemCode").value.trim();
    const itemName = document.getElementById("itemName").value.trim();
    const price = parseFloat(document.getElementById("price").value);
    const discount = parseFloat(document.getElementById("discount").value);
    
    // Use uploaded image  if available, otherwise use the entered URL
    const img = selectedImageDataUrl || document.getElementById("img").value.trim();

    if (!itemCode || !itemName || isNaN(price) || isNaN(discount)) {
        alert("Please fill in all required fields correctly.");
        return;
    }

    const newItem = { itemCode, itemName, price, discount, img, category };

    try {
        let method = "POST";
        let endpoint = "/add";

        if (isEditing) {
            method = "PUT";
            endpoint = "/update";
        }

        console.log("Sending data to API:", newItem); // Debugging log

        const response = await fetch(`${apiBaseUrl}${endpoint}`, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newItem),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        alert(`Item ${isEditing ? "updated" : "added"} successfully!`);
        fetchMenuItems();
        

        // Close modal after save
        const modal = bootstrap.Modal.getInstance(document.getElementById("addItemModal"));
        if (modal) {
            modal.hide();
        }
        resetForm(); // Reset form fields after saving
        
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while saving the item.");
    }
});

// Delete a menu item
async function deleteMenuItem(itemCode) {
console.log("Deleting item with code:", itemCode); // Debugging log

    if (!confirm("Are you sure you want to delete this item?")) {
        return; // User canceled the deletion
    }
  
    try {
        const url = `${apiBaseUrl}/delete/${itemCode}`; // <- Adjust this based on your actual API
        console.log("Deleting from:", url);

        const response = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${errorText}`);
        }

        alert("Item deleted successfully!");
        fetchMenuItems(); // Refresh the menu
    } catch (error) {
        console.error("Error deleting item:", error);
        alert("Error deleting item: " + error.message);
    }



}



// Handle image preview for URL input
document.getElementById("img").addEventListener("input", function () {
    const url = this.value.trim();
    const imgPreview = document.getElementById("img-preview");

    if (url) {
        imgPreview.src = url;
        imgPreview.style.display = "block";
    } else {
        imgPreview.src = "";
        imgPreview.style.display = "none";
    }
});

// Handle image file upload 
document.getElementById("img-file").addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            selectedImageDataUrl = e.target.result;

            // Automatically update the img text field with Base64 URL
            document.getElementById("img").value = selectedImageDataUrl;
            document.getElementById("img-preview").src = selectedImageDataUrl;
            document.getElementById("img-preview").style.display = "block";
        };
        reader.readAsDataURL(file);
    }
});

// Reset form fields
function resetForm() {
    document.getElementById("modalTitle").textContent = "Add Item";
    document.getElementById("item-form").reset();
    document.getElementById("img-preview").style.display = "none";
    document.getElementById("itemCode").disabled = false; // Allow modifying item code
    selectedImageDataUrl = "";
    isEditing = false;
    editingItemCode = null;
}


fetchMenuItems();
