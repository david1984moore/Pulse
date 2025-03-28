document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const database = initializeFirebase();
    if (!database) {
        console.error("Firebase not available");
        return;
    }

    // Handle bill form submission
    const billForm = document.getElementById('billForm');
    if (billForm) {
        billForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('billName').value;
            const amount = document.getElementById('billAmount').value;
            const frequency = document.getElementById('billFrequency').value;

            database.ref('bills').push({
                name: name,
                amount: parseFloat(amount),
                frequency: frequency,
                dateAdded: new Date().toISOString()
            }).then(() => {
                console.log("Bill saved successfully!");
                alert("Bill saved successfully!");
                billForm.reset();
                document.getElementById('addBillModal').style.display = 'none';
            }).catch((error) => {
                console.error("Error saving bill:", error);
                alert("Error saving bill. Check console for details.");
            });
        });

        const cancelButton = document.querySelector('.modal-buttons .cancel');
        if (cancelButton) {
            cancelButton.addEventListener('click', function() {
                billForm.reset();
                document.getElementById('addBillModal').style.display = 'none';
            });
        }

        const addBillBtn = document.querySelector('.add-bill-btn');
        if (addBillBtn) {
            addBillBtn.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById('addBillModal').style.display = 'block';
            });
        }
    }

    // Dashboard calculation (Chatbot - Alice)
    const chatForm = document.querySelector('.chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const spend = parseFloat(e.target.querySelector('input').value) || 0;
            const totalExpenses = 900; // Update to read from database if dynamic
            const remaining = totalExpenses - spend;
            document.getElementById('calculation-result').textContent = `Alice says: You will have $${remaining >= 0 ? remaining : 0} left until payday.`;
        });
    }

    // Calendar functionality
    const calendarTitle = document.getElementById('calendar-title');
    const calendarBody = document.getElementById('calendar-body');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    // Initialize with the current month and year
    let currentDate = new Date();
    let displayedMonth = currentDate.getMonth();
    let displayedYear = currentDate.getFullYear();

    // Function to generate the calendar
    function generateCalendar(month, year) {
        // Clear the current calendar
        calendarBody.innerHTML = '';

        // Update the title
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        calendarTitle.textContent = `${monthNames[month]} ${year}`;

        // Get the first day of the month and the number of days in the month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Determine the current day for highlighting
        const today = new Date();
        const isCurrentMonth = (today.getMonth() === month && today.getFullYear() === year);
        const currentDay = today.getDate();

        // Generate the calendar rows
        let date = 1;
        for (let i = 0; i < 6; i++) { // Up to 6 weeks to cover all possible days
            const row = document.createElement('tr');

            // Fill each day of the week
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');

                if (i === 0 && j < firstDay) {
                    // Empty cells before the first day
                    cell.classList.add('empty');
                    cell.textContent = '';
                } else if (date > daysInMonth) {
                    // Empty cells after the last day
                    cell.classList.add('empty');
                    cell.textContent = '';
                } else {
                    // Actual day
                    cell.textContent = date;
                    if (isCurrentMonth && date === currentDay) {
                        cell.classList.add('current-day');
                    }
                    date++;
                }
                row.appendChild(cell);
            }
            calendarBody.appendChild(row);

            // Break if we've added all days
            if (date > daysInMonth) break;
        }
    }

    // Initial calendar generation
    generateCalendar(displayedMonth, displayedYear);

    // Navigation event listeners
    prevMonthBtn.addEventListener('click', () => {
        displayedMonth--;
        if (displayedMonth < 0) {
            displayedMonth = 11;
            displayedYear--;
        }
        generateCalendar(displayedMonth, displayedYear);
    });

    nextMonthBtn.addEventListener('click', () => {
        displayedMonth++;
        if (displayedMonth > 11) {
            displayedMonth = 0;
            displayedYear++;
        }
        generateCalendar(displayedMonth, displayedYear);
    });
});