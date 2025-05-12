document.addEventListener("DOMContentLoaded", function () {
    function updateTaskTimers() {
        const now = new Date();

        document.querySelectorAll(".todos-list-body tr").forEach(row => {
            const dueDateStr = row.getAttribute("data-date");
            const statusCell = row.querySelector("td:nth-child(5)");

            if (!dueDateStr) return;

            const dueDateTime = new Date(dueDateStr + "T23:59:59");
            const timeDiff = dueDateTime - now;

            if (statusCell.innerText !== "Completed") {
                if (timeDiff <= 0) {
                    statusCell.innerHTML = `<span class="badge badge-danger">Overdue</span>`;
                } else {
                    const hours = String(Math.floor(timeDiff / (1000 * 60 * 60))).padStart(2, '0');
                    const minutes = String(Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                    const seconds = String(Math.floor((timeDiff % (1000 * 60)) / 1000)).padStart(2, '0');

                    statusCell.innerHTML = `<span class="badge badge-info">Time Left: ${hours}:${minutes}:${seconds}</span>`;
                }
            }
        });
    }

    setInterval(updateTaskTimers, 1000);
});
