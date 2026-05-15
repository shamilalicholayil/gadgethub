// Status Select
document.getElementById("statusSelect")?.addEventListener("change", async (e) => {
    const id = e.target.dataset.id;
    const orderStatus = e.target.value;
    try {
        const res = await fetch(`/admin/orders/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderStatus })
        });
        const data = await res.json();
        if(data.success) location.reload();
        else Swal.fire("Error!", data.message, "error");
    } catch (error) {
        Swal.fire("Error!", "Something went wrong.", "error");
    }
});

// Invoice Download
document.getElementById("downloadInvoice")?.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 188, 212);
    doc.text("GadgetHub", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Invoice", 14, 27);

    // Order Info
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`Order ID: #${orderId}`, 14, 42);
    doc.text(`Date: ${new Date().toDateString()}`, 14, 50);
    doc.text(`Payment: ${orderPayment}`, 14, 58);

    // Customer
    doc.text(`Customer: ${customerName}`, 14, 70);
    doc.text(`Email: ${customerEmail}`, 14, 78);

    // Products
    doc.setFontSize(12);
    doc.text("Products", 14, 92);
    doc.setFontSize(10);
    doc.setDrawColor(200);
    doc.line(14, 95, 196, 95);

    let y = 103;
    orderItems.forEach(item => {
        doc.text(`${item.name}`, 14, y);
        doc.text(`x${item.quantity}`, 120, y);
        doc.text(`Rs.${item.price}`, 150, y);
        doc.text(`Rs.${item.quantity * item.price}`, 175, y);
        y += 10;
    });

    // Total
    doc.line(14, y, 196, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Discount: -Rs.${orderDiscount}`, 130, y);
    y += 8;
    doc.setFontSize(13);
    doc.setTextColor(0, 188, 212);
    doc.text(`Total: Rs.${orderTotal}`, 130, y);

    doc.save(`invoice-${orderId}.pdf`);
});

// Timeline
const timelineSteps = [
    "Order Confirmed",
    "Packed Successfully",
    "Shipped",
    "Out For Delivery",
    "Delivered"
];

const timeline = document.getElementById("timeline");
timelineSteps.forEach((title) => {
    const step = document.createElement("div");
    step.className = "timeline-step";
    step.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-title">${title}</div>
        <div class="timeline-date"></div>
    `;
    timeline.appendChild(step);
});

const statusOrder = ["pending", "processing", "shipped", "delivered"];
const currentIndex = statusOrder.indexOf(orderStatus);
const steps = document.querySelectorAll(".timeline-step");

steps.forEach((step, i) => {
    if (currentIndex === -1) {
        const cancelledIndex = statusOrder.indexOf(cancelledAtStatus);
        if (i <= cancelledIndex) {
            step.classList.add("active");
        } else if (i === steps.length - 1) {
            step.classList.remove("active");
            step.querySelector(".timeline-dot").style.background = "#dc3545";
            step.querySelector(".timeline-title").textContent = orderStatus.toUpperCase();
        } else {
            step.classList.remove("active");
        }
    } else {
        i <= currentIndex
            ? step.classList.add("active")
            : step.classList.remove("active");
    }
});