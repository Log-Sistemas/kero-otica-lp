// Form handling and interactive features for Kero Ótica landing page

interface FormData {
    name: string;
    email: string;
    phone: string;
    store: string;
    message: string;
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor: Element) => {
    anchor.addEventListener('click', function (e: Event) {
        e.preventDefault();
        const target = document.querySelector((anchor as HTMLAnchorElement).getAttribute('href') || '');
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handler
const contactForm = document.getElementById('contactForm') as HTMLFormElement;

if (contactForm) {
    contactForm.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        
        const formData: FormData = {
            name: (document.getElementById('name') as HTMLInputElement).value,
            email: (document.getElementById('email') as HTMLInputElement).value,
            phone: (document.getElementById('phone') as HTMLInputElement).value,
            store: (document.getElementById('store') as HTMLInputElement).value,
            message: (document.getElementById('message') as HTMLTextAreaElement).value
        };

        // Validate form
        if (!validateForm(formData)) {
            return;
        }

        // Show success message
        showFormMessage('Obrigado! Entraremos em contato em breve.', 'success');
        
        // Reset form
        contactForm.reset();
        
        // In a real application, you would send the data to a server here
        console.log('Form data:', formData);
    });
}

// Form validation
function validateForm(data: FormData): boolean {
    if (!data.name.trim()) {
        showFormMessage('Por favor, preencha seu nome.', 'error');
        return false;
    }

    if (!data.email.trim() || !isValidEmail(data.email)) {
        showFormMessage('Por favor, insira um e-mail válido.', 'error');
        return false;
    }

    if (!data.phone.trim()) {
        showFormMessage('Por favor, preencha seu telefone.', 'error');
        return false;
    }

    return true;
}

// Email validation
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show form message
function showFormMessage(message: string, type: 'success' | 'error'): void {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `form-message form-message-${type}`;
    messageElement.textContent = message;
    messageElement.style.cssText = `
        padding: 1rem;
        margin-top: 1rem;
        border-radius: 8px;
        text-align: center;
        font-weight: 500;
        ${type === 'success' 
            ? 'background-color: #10b981; color: white;' 
            : 'background-color: #ef4444; color: white;'}
    `;

    // Insert message after form
    const form = document.getElementById('contactForm');
    if (form && form.parentNode) {
        form.parentNode.insertBefore(messageElement, form.nextSibling);
    }

    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

// Intersection Observer for fade-in animations
const observerOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.benefit-card, .testimonial-card, .differentiator-item, .faq-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Handle image display - hide placeholder when image is loaded
    handleImageDisplay();
});

// Image display handler
function handleImageDisplay(): void {
    const images = document.querySelectorAll('img');
    images.forEach((img: HTMLImageElement) => {
        if (img.src && img.src !== window.location.href) {
            img.onload = function() {
                this.style.display = 'block';
                const placeholder = document.getElementById(this.id.replace('Image', 'ImagePlaceholder').replace('Logo', 'LogoPlaceholder'));
                if (placeholder) {
                    (placeholder as HTMLElement).style.display = 'none';
                }
            };
            img.onerror = function() {
                this.style.display = 'none';
            };
        } else {
            img.style.display = 'none';
        }
    });
}

// FAQ accordion functionality (optional enhancement)
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach((question: Element) => {
    question.addEventListener('click', () => {
        const faqItem = question.closest('.faq-item');
        const answer = faqItem ? faqItem.querySelector('.faq-answer') as HTMLElement : null;
        
        if (faqItem && answer) {
            const isOpen = faqItem.classList.contains('faq-open');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('faq-open');
                const itemAnswer = item.querySelector('.faq-answer') as HTMLElement;
                if (itemAnswer) {
                    itemAnswer.style.maxHeight = null;
                }
            });
            
            // Open clicked item if it wasn't open
            if (!isOpen) {
                faqItem.classList.add('faq-open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        }
    });
    
    // Make FAQ items clickable
    (question as HTMLElement).style.cursor = 'pointer';
});
