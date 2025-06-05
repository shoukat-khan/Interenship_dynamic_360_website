// Event Management
class EventManager {
    constructor() {
        this.events = [];
        this.initializeElements();
        this.setupEventListeners();
        this.loadEvents();
    }

    initializeElements() {
        this.eventsGrid = document.getElementById('eventsGrid');
        this.searchInput = document.getElementById('searchInput');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.startDate = document.getElementById('startDate');
        this.endDate = document.getElementById('endDate');
        this.themeToggle = document.querySelector('.theme-toggle');
        this.mobileMenu = document.querySelector('.mobile-menu');
        this.registrationModal = document.getElementById('registrationModal');
        this.closeModal = document.querySelector('.close-modal');
        this.registrationForm = document.getElementById('registrationForm');
        this.contactForm = document.getElementById('contactForm');
    }

    async loadEvents() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error('Failed to load events');
            }
            const data = await response.json();
            this.events = data.events || [];
            this.displayEvents(this.events);
        } catch (error) {
            console.error('Error loading events:', error);
            this.showErrorMessage('Failed to load events. Please try again later.');
        }
    }

    filterEvents() {
        if (!this.events || this.events.length === 0) return;
        
        const searchTerm = this.searchInput.value.toLowerCase();
        const category = this.categoryFilter.value;
        const start = this.startDate.value;
        const end = this.endDate.value;

        const filteredEvents = this.events.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                                event.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || event.category === category;
            const matchesDate = (!start || event.date >= start) && (!end || event.date <= end);

            return matchesSearch && matchesCategory && matchesDate;
        });

        this.displayEvents(filteredEvents);
    }

    displayEvents(eventsToDisplay) {
        if (!this.eventsGrid) return;
        
        this.eventsGrid.innerHTML = '';
        
        if (!eventsToDisplay || eventsToDisplay.length === 0) {
            this.eventsGrid.innerHTML = `
                <div class="no-events">
                    <h3>No events found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        eventsToDisplay.forEach(event => {
            const eventCard = this.createEventCard(event);
            this.eventsGrid.appendChild(eventCard);
        });

        this.attachEventListeners();
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.dataset.category = event.category;
        
        card.innerHTML = `
            <div class="event-image-container">
                <img src="${event.image}" alt="${event.title}" class="event-image" loading="lazy">
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-details">
                    <p><i class="fas fa-calendar"></i> ${this.formatDate(event.date)} at ${event.time}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                    <p><i class="fas fa-tag"></i> $${event.price}</p>
                    <p><i class="fas fa-users"></i> ${event.registered}/${event.capacity} registered</p>
                </div>
                <p class="event-description">${event.description}</p>
                <button class="register-btn" data-event-id="${event.id}">Register Now</button>
            </div>
        `;
        
        observer.observe(card);
        return card;
    }

    formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    attachEventListeners() {
        document.querySelectorAll('.register-btn').forEach(button => {
            button.addEventListener('click', () => {
                const eventId = button.dataset.eventId;
                const event = this.events.find(e => e.id === parseInt(eventId));
                this.showRegistrationModal(event);
            });
        });
    }

    setupEventListeners() {
        // Search and filter listeners
        this.searchInput.addEventListener('input', () => this.filterEvents());
        this.categoryFilter.addEventListener('change', () => this.filterEvents());
        this.startDate.addEventListener('change', () => this.filterEvents());
        this.endDate.addEventListener('change', () => this.filterEvents());

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Mobile menu
        this.mobileMenu.addEventListener('click', () => this.showMobileMenu());

        // Registration modal
        this.closeModal.addEventListener('click', () => this.hideRegistrationModal());
        this.registrationForm.addEventListener('submit', (e) => this.handleRegistration(e));

        // Contact form
        this.contactForm.addEventListener('submit', (e) => this.handleContact(e));

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleSmoothScroll(e, anchor));
        });
    }

    toggleTheme() {
        document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        this.themeToggle.querySelector('i').classList.toggle('fa-moon');
        this.themeToggle.querySelector('i').classList.toggle('fa-sun');
        localStorage.setItem('theme', document.body.dataset.theme);
    }

    showMobileMenu() {
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav active';
        mobileNav.innerHTML = `
            <span class="close-mobile-nav">&times;</span>
            <a href="#home">Home</a>
            <a href="#events">Events</a>
            <a href="#contact">Contact</a>
        `;
        document.body.appendChild(mobileNav);

        mobileNav.querySelector('.close-mobile-nav').addEventListener('click', () => {
            mobileNav.remove();
        });

        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.remove();
            });
        });
    }

    showRegistrationModal(event) {
        this.registrationModal.style.display = 'block';
        this.registrationForm.dataset.eventId = event.id;
    }

    hideRegistrationModal() {
        this.registrationModal.style.display = 'none';
    }

    handleRegistration(e) {
        e.preventDefault();
        const eventId = this.registrationForm.dataset.eventId;
        const event = this.events.find(e => e.id === parseInt(eventId));
        alert(`Registration successful for ${event.title}!`);
        this.hideRegistrationModal();
        this.registrationForm.reset();
    }

    handleContact(e) {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        this.contactForm.reset();
    }

    handleSmoothScroll(e, anchor) {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    showErrorMessage(message) {
        if (this.eventsGrid) {
            this.eventsGrid.innerHTML = `
                <div class="no-events">
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, {
    threshold: 0.1
});

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.dataset.theme = savedTheme;
        const themeToggle = document.querySelector('.theme-toggle');
        if (savedTheme === 'dark') {
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    }

    // Initialize event manager
    new EventManager();
}); 