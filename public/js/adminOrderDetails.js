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