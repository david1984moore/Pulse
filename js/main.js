document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const database = initializeFirebase();
    if (!database) {
        console.error("Firebase not available");
        return;
    }

    // Button click handlers
    const buttons = document.querySelectorAll('.pill-button, .get-started-button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (button.classList.contains('get-started-button')) {
                window.location.href = './signup.html';
            } else if (button.type === 'submit') {
                e.preventDefault();
                const form = button.closest('form');
                if (form) {
                    const loading = document.createElement('span');
                    loading.textContent = ' Loading...';
                    button.appendChild(loading);
                    setTimeout(() => {
                        button.removeChild(loading);
                        alert('Form submitted! (Simulated)');
                    }, 1000);
                }
            }
        });
    });

    // Dropdown functionality
    const hamburger = document.querySelector('.hamburger');
    const dropdownContent = document.querySelector('.dropdown-content');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
            navLinks.style.display = dropdownContent.classList.contains('show') ? 'none' : 'flex';
        });
    }

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.hamburger') && dropdownContent.classList.contains('show')) {
            dropdownContent.classList.remove('show');
            navLinks.style.display = 'flex';
        }
    });
});