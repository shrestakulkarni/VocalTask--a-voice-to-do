document.addEventListener("DOMContentLoaded", function() {
    const voiceBtn = document.getElementById("voice-btn");
    const taskInput = document.getElementById("task-input");
    const taskDate = document.getElementById("task-date");
    const taskCategory = document.getElementById("task-category");
    const taskPriority = document.getElementById("task-priority");
    const addTaskButton = document.querySelector(".add-task-button");
    const taskListBody = document.querySelector(".todos-list-body");

    function setMinDate() {
        let today = new Date().toISOString().split("T")[0];
        taskDate.setAttribute("min", today);
    }
    setMinDate();
    taskDate.addEventListener("focus", setMinDate);

    function saveTasksLocally() {
        const tasks = [...document.querySelectorAll(".todos-list-body tr")].map(row => ({
            taskText: row.cells[0].innerText,
            dueDate: row.cells[1].innerText,
            category: row.cells[2].innerText,
            priority: row.cells[3].innerText,
            status: row.cells[4].innerText.includes("Completed") ? "Completed" : "Pending"
        }));
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function loadTasksLocally() {
        let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.forEach(task => {
            addTask(task.taskText, task.dueDate, task.category, task.priority, task.status);
        });
    }
    localStorage.setItem("tasks", JSON.stringify([
        { status: "Pending", dueDate: "2025-03-07", priority: "High" },
        { status: "Completed", dueDate: "2025-03-06", priority: "Low" }
    ]));
    window.dispatchEvent(new Event("storage"));
    

    function updateDashboard() {
        let totalTasks = document.querySelectorAll(".todos-list-body tr").length;
        let completedTasks = document.querySelectorAll(".todos-list-body .badge-success").length;
        let pendingTasks = totalTasks - completedTasks;

        let today = new Date().toISOString().split("T")[0];
        let todayTasks = [...document.querySelectorAll(".todos-list-body tr")].filter(row => 
            row.getAttribute("data-date") === today
        ).length;

        let highPriorityTasks = [...document.querySelectorAll(".todos-list-body tr")].filter(row => 
            row.getAttribute("data-priority") === "High"
        ).length;

        document.getElementById("completed-count").textContent = completedTasks;
        document.getElementById("pending-count").textContent = pendingTasks;
        document.getElementById("today-count").textContent = todayTasks;
        document.getElementById("high-priority-count").textContent = highPriorityTasks;

        updateCharts();
    }

    function addTask(taskText, dueDate, category, priority, status = "Pending") {
        if (taskText.trim() === "") return;

        const newRow = document.createElement("tr");
        newRow.setAttribute("data-category", category);
        newRow.setAttribute("data-priority", priority);
        newRow.setAttribute("data-date", dueDate);

        newRow.innerHTML = `
            <td>${taskText}</td>
            <td>${dueDate || "No Date"}</td>
            <td>${category}</td>
            <td>${priority}</td>
            <td><span class="badge ${status === "Completed" ? "badge-success" : "badge-warning"}">${status}</span></td>
            <td>
                <button class="btn btn-sm btn-success complete-task">✅</button>
                <button class="btn btn-sm btn-danger delete-task">🗑</button>
            </td>
        `;

        taskListBody.appendChild(newRow);
        saveTasksLocally();
        updateDashboard();
    }

    addTaskButton.addEventListener("click", function() {
        addTask(taskInput.value, taskDate.value, taskCategory.value, taskPriority.value);
        saveTasksLocally();
    });

    taskListBody.addEventListener("click", function(event) {
        if (event.target.classList.contains("complete-task")) {
            const row = event.target.closest("tr");
            row.querySelector("td:nth-child(5)").innerHTML = `<span class="badge badge-success">Completed</span>`;
            saveTasksLocally();
            updateDashboard();
        }
        if (event.target.classList.contains("delete-task")) {
            event.target.closest("tr").remove();
            saveTasksLocally();
            updateDashboard();
        }
    });

    let categoryChart, priorityChart;

    function updateCharts() {
        let categories = {};
        let priorities = {};
        
        document.querySelectorAll(".todos-list-body tr").forEach(row => {
            let category = row.getAttribute("data-category");
            let priority = row.getAttribute("data-priority");

            categories[category] = (categories[category] || 0) + 1;
            priorities[priority] = (priorities[priority] || 0) + 1;
        });

        let categoryLabels = Object.keys(categories);
        let categoryData = Object.values(categories);
        
        let priorityLabels = Object.keys(priorities);
        let priorityData = Object.values(priorities);

        if (categoryChart) categoryChart.destroy();
        if (priorityChart) priorityChart.destroy();

        let ctxCategory = document.getElementById("task-category-chart").getContext("2d");
        categoryChart = new Chart(ctxCategory, {
            type: "pie",
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryData,
                    backgroundColor: ["#4CAF50", "#FF9800", "#2196F3", "#E91E63"]
                }]
            }
        });

        let ctxPriority = document.getElementById("priority-chart").getContext("2d");
        priorityChart = new Chart(ctxPriority, {
            type: "bar",
            data: {
                labels: priorityLabels,
                datasets: [{
                    label: "Task Priorities",
                    data: priorityData,
                    backgroundColor: ["#FF5722", "#FFC107", "#8BC34A"]
                }]
            }
        });
    }

    window.addEventListener("load", () => {
        loadTasksLocally();
        updateDashboard();
    });
});
