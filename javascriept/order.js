document.addEventListener("DOMContentLoaded", function () {
    fetchOrders();
});

function fetchOrders() {
    fetch("http://localhost:8080/orders/getAll")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch orders.");
            }
            return response.json();
        })
        .then(data => renderOrders(data))
        console.log("load" +data)
        .catch(error => console.error("Error fetching orders:", error));
}

function renderOrders(orders) {
    const tableBody = document.getElementById("customer-table");
    tableBody.innerHTML = "";

    orders.forEach((order) => {
        const row = document.createElement("tr");

        const itemDetails = order.details && order.details.length
            ? order.details.map(detail => `${detail.itemCode} (${detail.qty} x ${detail.unitPrice})`).join("<br>")
            : "No Items";

        row.innerHTML = `
            <td>${"ODR00"+order.id ?? "N/A"}</td>
            <td>Customer ID: ${order.customerId ?? "N/A"}</td>
            <td>${order.date ?? "N/A"}</td>
            <td>${order.time ?? "N/A"}</td>
            <td>${itemDetails}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editOrder(${order.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function deleteOrder(id) {
    if (!id) {
        alert("Invalid order ID");
        return;
    }

    if (confirm("Are you sure you want to delete this order?")) {
        fetch(`http://localhost:8080/orders/delete/${id}`, {
            method: "DELETE"
        })
        .then(res => res.text())
        .then(msg => {
            alert(msg);
            fetchOrders(); // refresh table
        })
        .catch(err => {
            console.error("Error deleting order:", err);
            alert("Failed to delete order.");
        });
    }
}


function editOrder(id) {
    fetch(`http://localhost:8080/orders/getOrderById/${id}`)
        .then(res => res.json())
        .then(order => {
            document.getElementById("editOrderId").value = order.id;
            document.getElementById("editCustomerId").value = order.customerId;
            document.getElementById("editDate").value = order.date;
            document.getElementById("editTime").value = order.time;

            const detailsContainer = document.getElementById("orderDetailsContainer");
            detailsContainer.innerHTML = "<h6>Order Items:</h6>";

            order.details.forEach((detail, index) => {
                detailsContainer.innerHTML += `
                    <div class="mb-2 border p-2 rounded">
                        <label>Item Code:</label>
                        <input disabled type="text" class="form-control mb-1" name="itemCode" value="${detail.itemCode}" required>
                        <label>Quantity:</label>
                        <input type="number" class="form-control mb-1" name="qty" value="${detail.qty}" required>
                        <label>Unit Price:</label>
                        <input disabled type="number" class="form-control" name="unitPrice" step="0.01" value="${detail.unitPrice}" required>
                    </div>
                `;
            });

            const modal = new bootstrap.Modal(document.getElementById("editOrderModal"));
            modal.show();
        })
        .catch(err => {
            console.error("Failed to fetch order for edit:", err);
            alert("Could not load order data.");
        });
}

document.getElementById("editOrderForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("editOrderId").value;
    const customerId = document.getElementById("editCustomerId").value;
    const date = document.getElementById("editDate").value;
    const time = document.getElementById("editTime").value;

    // Collect order details
    const itemCodeElems = document.getElementsByName("itemCode");
    const qtyElems = document.getElementsByName("qty");
    const unitPriceElems = document.getElementsByName("unitPrice");

    const details = [];
    for (let i = 0; i < itemCodeElems.length; i++) {
        details.push({
            itemCode: itemCodeElems[i].value,
            qty: parseInt(qtyElems[i].value),
            unitPrice: parseFloat(unitPriceElems[i].value)
        });
    }

    fetch(`http://localhost:8080/orders/update/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, customerId, date, time, details })
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        bootstrap.Modal.getInstance(document.getElementById("editOrderModal")).hide();
        fetchOrders();
    })
    .catch(err => {
        console.error("Failed to update order:", err);
        alert("Failed to update order.");
    });
});
