function saveTasksToLocalStorage() {
    const tasks = [];
    document.querySelectorAll(".todos-list-body tr").forEach(row => {
        tasks.push({
            text: row.querySelector("td:nth-child(1)").textContent,
            date: row.querySelector("td:nth-child(2)").textContent,
            category: row.querySelector("td:nth-child(3)").textContent,
            priority: row.querySelector("td:nth-child(4)").textContent,
            status: row.querySelector("td:nth-child(5)").innerHTML.includes("Completed") ? "Completed" : "Pending"
        });
    });
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem("todoTasks")) || [];
    tasks.forEach(task => addTask(task.text, task.date, task.category, task.priority, task.status));
}

// Load tasks when the page refreshes
document.addEventListener("DOMContentLoaded", loadTasksFromLocalStorage);
