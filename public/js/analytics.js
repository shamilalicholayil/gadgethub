const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Revenue chart data sets
const chartDatasets = {
    daily: {
        labels: dailySales.map(d => `${d._id.day} ${months[d._id.month - 1]}`),
        data: dailySales.map(d => d.revenue)
    },
    monthly: {
        labels: monthlySales.map(d => months[d._id.month - 1]),
        data: monthlySales.map(d => d.revenue)
    },
    sixmonth: {
        labels: sixMonthSales.map(d => months[d._id.month - 1]),
        data: sixMonthSales.map(d => d.revenue)
    },
    yearly: {
        labels: yearlySales.map(d => String(d._id.year)),
        data: yearlySales.map(d => d.revenue)
    }
};

const revenueCtx = document.getElementById("revenueChart");
let revenueChart = new Chart(revenueCtx, {
    type: "line",
    data: {
        labels: chartDatasets.daily.labels,
        datasets: [{
            label: "Revenue (₹)",
            data: chartDatasets.daily.data,
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

function switchChart(range) {
    document.querySelectorAll(".btn-outline-info.btn-sm").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");

    revenueChart.data.labels = chartDatasets[range].labels;
    revenueChart.data.datasets[0].data = chartDatasets[range].data;
    revenueChart.update();
}

// Orders by Status
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

// Top 5 Products
new Chart(document.getElementById("topProductsChart"), {
    type: "bar",
    data: {
        labels: topProducts.map(p => p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name),
        datasets: [{
            label: "Units Sold",
            data: topProducts.map(p => p.totalSold),
            backgroundColor: "rgba(56,189,248,0.7)",
            borderColor: "#38bdf8",
            borderWidth: 1
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

// Category Sales
new Chart(document.getElementById("categoryChart"), {
    type: "pie",
    data: {
        labels: categorySales.map(c => c._id),
        datasets: [{
            data: categorySales.map(c => c.revenue),
            backgroundColor: ["#38bdf8","#22c55e","#f59e0b","#ef4444","#8b5cf6","#ec4899","#f97316"]
        }]
    },
    options: {
        plugins: { legend: { labels: { color: "#fff" } } }
    }
});

// Custom Date Download
function downloadCustom() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    if(!startDate || !endDate) return alert("Please select both dates.");
    if(startDate > endDate) return alert("Start date cannot be after end date.");
    window.location.href = `/admin/report/download?range=custom&startDate=${startDate}&endDate=${endDate}`;
}