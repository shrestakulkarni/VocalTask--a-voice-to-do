document.addEventListener("DOMContentLoaded", function() {
    const voiceBtn = document.getElementById("voice-btn");
    const taskInput = document.getElementById("task-input");
    const taskDate = document.getElementById("task-date");
    const taskCategory = document.getElementById("task-category");
    const taskPriority = document.getElementById("task-priority");
    const addTaskButton = document.querySelector(".add-task-button");
    const taskListBody = document.querySelector(".todos-list-body");
    const categoryFilter = document.getElementById("category-filter");

    function setMinDate() {
        let today = new Date();
        let formattedDate = today.toISOString().split("T")[0];
        taskDate.setAttribute("min", formattedDate);
    }
    setMinDate();
    taskDate.addEventListener("focus", setMinDate);

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (window.SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = function(event) {
            const command = event.results[0][0].transcript.trim().toLowerCase();
            console.log("Recognized:", command);
            
            if (command.startsWith("delete")) {
                let taskToDelete = command.replace("delete", "").trim();
                document.querySelectorAll(".todos-list-body tr").forEach(row => {
                    if (row.querySelector("td:first-child").textContent.toLowerCase() === taskToDelete) {
                        row.remove();
                        console.log("Task deleted:", taskToDelete);
                    }
                });
            } else if (command.startsWith("complete")) {
                let taskToComplete = command.replace("complete", "").trim();
                document.querySelectorAll(".todos-list-body tr").forEach(row => {
                    if (row.querySelector("td:first-child").textContent.toLowerCase() === taskToComplete) {
                        row.querySelector("td:nth-child(5)").innerHTML = `<span class="badge badge-success">Completed</span>`;
                        console.log("Task completed:", taskToComplete);
                    }
                });
            } else if (command.startsWith("edit")) {
                let parts = command.match(/edit (.+?) to (.+)/);
                if (parts) {
                    let oldTask = parts[1].trim().toLowerCase();
                    let newTask = parts[2].trim();
                    document.querySelectorAll(".todos-list-body tr").forEach(row => {
                        if (row.querySelector("td:first-child").textContent.toLowerCase() === oldTask) {
                            row.querySelector("td:first-child").textContent = newTask;
                            console.log("Task edited:", oldTask, "to", newTask);
                        }
                    });
                }
            } else {
                taskInput.value = command;
            }
        };

        recognition.onerror = function(event) {
            console.error("Speech Recognition Error:", event.error);
        };

        voiceBtn.addEventListener("click", function() {
            recognition.start();
        });
    } else {
        console.error("Speech Recognition not supported in this browser.");
    }

    function requestNotificationPermission() {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission !== "granted") {
                    console.warn("Notifications are disabled.");
                }
            });
        }
    }
    requestNotificationPermission();

    function addTask(taskText, dueDate, category, priority, status = "Pending")  {
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
            <td><span class="badge ${status === 'Completed' ? 'badge-success' : 'badge-warning'}">${status}</span></td>

            <td>
                <button class="btn btn-sm btn-success complete-task">✅</button>
                <button class="btn btn-sm btn-danger delete-task">🗑</button>
            </td>
        `;

        taskListBody.appendChild(newRow);

        if (priority === "High") {
            sendNotification(`🚨 High Priority Task Added: "${taskText}"`);
        }

        taskInput.value = "";
        taskDate.value = "";
    }

    addTaskButton.addEventListener("click", function() {
        addTask(taskInput.value, taskDate.value, taskCategory.value, taskPriority.value);
        saveTasksToLocalStorage(); // Save after adding a task
    });

    taskListBody.addEventListener("click", function(event) {
        if (event.target.classList.contains("complete-task")) {
            const row = event.target.closest("tr");
            row.querySelector("td:nth-child(5)").innerHTML = `<span class="badge badge-success">Completed</span>`;
            saveTasksToLocalStorage(); // Save after marking complete
        }
        if (event.target.classList.contains("delete-task")) {
            event.target.closest("tr").remove();
            saveTasksToLocalStorage(); // Save after deleting
        }
    });


    categoryFilter.addEventListener("change", function() {
        const selectedCategory = this.value;
        document.querySelectorAll(".todos-list-body tr").forEach(row => {
            row.style.display = (selectedCategory === "all" || row.getAttribute("data-category") === selectedCategory) ? "table-row" : "none";
        });
    });

    setInterval(function() {
        const today = new Date().toISOString().split("T")[0];

        document.querySelectorAll(".todos-list-body tr").forEach(row => {
            const dueDate = row.getAttribute("data-date");
            const priority = row.getAttribute("data-priority");
            const taskName = row.querySelector("td:first-child").textContent;

            if (dueDate === today && priority === "High") {
                sendNotification(`⏳ High-Priority Task Due Today: "${taskName}"`);
            }
        });
    }, 60000);

    function sendNotification(message) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("🔔 To-Do Reminder", { body: message });
        }
    }
});
