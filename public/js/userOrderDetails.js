// Toast
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    toast.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.textContent = message;
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

// Invoice Download
document.getElementById("downloadInvoice")?.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("GadgetHub Invoice", 14, 20);

    doc.setFontSize(11);
    doc.text(`Order ID: ${document.querySelector(".summary-value").textContent}`, 14, 35);

    let y = 50;
    doc.text("Products:", 14, y);
    y += 8;

    // Pass items via EJS into JS
    orderItems.forEach(item => {
        doc.text(`${item.name} x${item.quantity} - Rs.${item.quantity * item.price}`, 14, y);
        y += 8;
    });

    y += 5;
    doc.text(`Total: Rs.${orderTotal}`, 14, y);

    doc.save(`invoice-${orderId}.pdf`);
});

const timelineSteps = [
    "Order Confirmed",
    "Packed Successfully", 
    "Shipped",
    "Out For Delivery",
    "Delivered"
];

const timeline = document.getElementById("timeline");

timelineSteps.forEach((title, i) => {
    const step = document.createElement("div");
    step.className = "timeline-step";
    step.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-title">${title}</div>
        <div class="timeline-date"></div>
    `;
    timeline.appendChild(step);
});

document.getElementById("cancelBtn")?.addEventListener("click", async () => {
    try {
        const id = document.getElementById("cancelBtn").dataset.id;
        const result = await Swal.fire({
            title: "Cancel Order?",
            text: "The order will be cancelled",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, Cancel"
        });
        if(!result.isConfirmed) return;

        const res = await fetch(`/orders/${id}/cancel`, { method: "PATCH" });
        const data = await res.json();
        if(data.success) location.reload();
    } catch (error) {
        console.log(error)
        showToast("Something went wrong", "danger");
    }
});

document.getElementById("returnBtn")?.addEventListener("click", async () => {
    try {
        const id = document.getElementById("returnBtn").dataset.id;

        const result = await Swal.fire({
            title: "Return Order?",
            text: "A return request will be submitted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, Return"
        });
        if(!result.isConfirmed) return;

        const res = await fetch(`/orders/${id}/return`, { method: "PATCH" });
        const data = await res.json();
        if(data.success) location.reload();
    } catch (error) {
        showToast("Something went wrong", "danger");
    }
});

// Status Map
const statusOrder = ["pending", "processing", "shipped", "delivered"];
const currentIndex = statusOrder.indexOf(orderStatus);
const steps = document.querySelectorAll(".timeline-step");

steps.forEach((step, i) => {
    if (currentIndex === -1) {
        const cancelledIndex = statusOrder.indexOf(cancelledAtStatus);
        steps.forEach((step, j) => {
            if (j <= cancelledIndex) {
                step.classList.add("active");
            } else if (j === steps.length - 1) {
                step.classList.remove("active");
                step.querySelector(".timeline-dot").style.background = "#dc3545";
                step.querySelector(".timeline-title").textContent = orderStatus.toUpperCase();
            } else {
                step.classList.remove("active");
            }
        });
    }
});