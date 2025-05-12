document.addEventListener("DOMContentLoaded", function () {
    const voiceBtn = document.getElementById("voice-btn");
    const taskInput = document.getElementById("task-input");
    const taskDate = document.getElementById("task-date");
    const taskCategory = document.getElementById("task-category");
    const taskPriority = document.getElementById("task-priority");
    const addTaskButton = document.querySelector(".add-task-button");
    const taskListBody = document.querySelector(".todos-list-body");
    const categoryFilter = document.getElementById("category-filter");

    function setMinDate() {
        let today = new Date().toISOString().split("T")[0];
        taskDate.setAttribute("min", today);
    }
    setMinDate();
    
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
        saveTasksToLocalStorage();  // Save the updated list
    }

    addTaskButton.addEventListener("click", function () {
        addTask(taskInput.value, taskDate.value, taskCategory.value, taskPriority.value);
        taskInput.value = "";
        taskDate.value = "";
    });

    taskListBody.addEventListener("click", function (event) {
        if (event.target.classList.contains("complete-task")) {
            const row = event.target.closest("tr");
            row.querySelector("td:nth-child(5)").innerHTML = `<span class="badge badge-success">Completed</span>`;
            saveTasksToLocalStorage();
        }
        if (event.target.classList.contains("delete-task")) {
            event.target.closest("tr").remove();
            saveTasksToLocalStorage();
        }
    });

    categoryFilter.addEventListener("change", function () {
        const selectedCategory = this.value;
        document.querySelectorAll(".todos-list-body tr").forEach(row => {
            row.style.display = (selectedCategory === "all" || row.getAttribute("data-category") === selectedCategory) ? "table-row" : "none";
        });
    });

    loadTasksFromLocalStorage(); // Load tasks on page load

    // -------------- Voice Input Feature --------------
    if ("webkitSpeechRecognition" in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        voiceBtn.addEventListener("click", function () {
            recognition.start();
            voiceBtn.textContent = "Listening...";
        });

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            taskInput.value = transcript;
            voiceBtn.textContent = "🎤 Voice Input";
        };

        recognition.onerror = function () {
            voiceBtn.textContent = "🎤 Voice Input";
        };

        recognition.onend = function () {
            voiceBtn.textContent = "🎤 Voice Input";
        };
    } else {
        voiceBtn.disabled = true;
        voiceBtn.textContent = "Voice Not Supported";
    }
});
