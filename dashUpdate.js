document.addEventListener("DOMContentLoaded", function () {
    function updateDashboardCounts() {
        let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

        let pendingCount = tasks.filter(task => task.status === "Pending").length;
        let completedCount = tasks.filter(task => task.status === "Completed").length;
        let today = new Date().toISOString().split("T")[0];
        let todayCount = tasks.filter(task => task.dueDate === today).length;
        let highPriorityCount = tasks.filter(task => task.priority === "High").length;
        let overdueCount = tasks.filter(task => {
            let dueDate = new Date(task.dueDate);
            let now = new Date();
            return task.status !== "Completed" && dueDate < now;
        }).length;

        // Update only if elements exist to prevent errors
        if (document.getElementById("pending-count")) {
            document.getElementById("pending-count").textContent = pendingCount;
        }
        if (document.getElementById("completed-count")) {
            document.getElementById("completed-count").textContent = completedCount;
        }
        if (document.getElementById("today-count")) {
            document.getElementById("today-count").textContent = todayCount;
        }
        if (document.getElementById("high-priority-count")) {
            document.getElementById("high-priority-count").textContent = highPriorityCount;
        }
        if (document.getElementById("overdue-count")) {
            document.getElementById("overdue-count").textContent = overdueCount;
        }
    }

    updateDashboardCounts();
    window.addEventListener("storage", updateDashboardCounts);
});
