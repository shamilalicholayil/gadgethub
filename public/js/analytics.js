// Monthly Revenue Chart
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    
    new Chart(document.getElementById("revenueChart"), {
        type: "line",
        data: {
            labels: monthlySales.map(d => months[d._id.month - 1]),
            datasets: [{
                label: "Revenue (₹)",
                data: monthlySales.map(d => d.revenue),
                borderColor: "#38bdf8",
                backgroundColor: "rgba(56,189,248,0.1)",
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            plugins: { legend: { labels: { color: "#fff" } } },
            scales: {
                x: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
                y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } }
            }
        }
    });

    // Orders by Status Chart

    new Chart(document.getElementById("statusChart"), {
        type: "doughnut",
        data: {
            labels: ordersByStatus.map(d => d._id),
            datasets: [{
                data: ordersByStatus.map(d => d.count),
                backgroundColor: ["#38bdf8","#22c55e","#f59e0b","#ef4444","#8b5cf6","#ec4899"]
            }]
        },
        options: {
            plugins: { legend: { labels: { color: "#fff" } } }
        }
    });