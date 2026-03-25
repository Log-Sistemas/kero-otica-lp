// Form handling and interactive features for Kero Ótica landing page

/** Injected at deploy time via GitHub Actions (replace __LAHAR_TOKEN__) */
const LAHAR_TOKEN = '__LAHAR_TOKEN__';
const LAHAR_NOME_FORMULARIO = 'kero_otica_lp';
const LAHAR_CONVERSIONS_URL = 'https://app.lahar.com.br/api/conversions';
const LAHAR_IFRAME_NAME = 'lahar-conversions-iframe';

function ensureLaharIframe(): HTMLIFrameElement {
    let el = document.getElementById('lahar-conversions-iframe') as HTMLIFrameElement | null;
    if (el) return el;
    el = document.createElement('iframe');
    el.id = 'lahar-conversions-iframe';
    el.name = LAHAR_IFRAME_NAME;
    el.title = 'LAHAR';
    el.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
}

interface KeroFormFields {
    name: string;
    email: string;
    phone: string;
    store: string;
    instagram: string;
    message: string;
}

function getUtmTags(): string {
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
    const parts: string[] = [];
    keys.forEach((key) => {
        const el = document.querySelector(`input[type="hidden"][name="${key}"]`) as HTMLInputElement | null;
        const v = el?.value?.trim();
        if (v) parts.push(`${key}=${v}`);
    });
    return parts.join(',');
}

function buildAnotacoes(message: string, instagram: string): string {
    const msg = message.trim();
    const ig = instagram.trim();
    if (msg && ig) return `${msg}\n\nInstagram: ${ig}`;
    if (ig) return `Instagram: ${ig}`;
    return msg;
}

async function sendLaharConversion(data: KeroFormFields): Promise<boolean> {
    const params = new URLSearchParams();
    params.set('token_api_lahar', LAHAR_TOKEN);
    params.set('nome_formulario', LAHAR_NOME_FORMULARIO);
    params.set('tipo_integracao', 'conversions');
    params.set('estagio_lead', '1');
    params.set('url_origem', window.location.href);
    params.set('email_contato', data.email.trim());
    params.set('nome_contato', data.name.trim());
    params.set('tel_celular', data.phone.trim());
    if (data.store.trim()) {
        params.set('name_empresa', data.store.trim());
    }
    const anotacoes = buildAnotacoes(data.message, data.instagram);
    if (anotacoes) {
        params.set('anotacoes', anotacoes);
    }
    const tags = getUtmTags();
    if (tags) {
        params.set('tags', tags);
    }

    ensureLaharIframe();
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = LAHAR_CONVERSIONS_URL;
    form.target = LAHAR_IFRAME_NAME;
    form.style.display = 'none';
    params.forEach((value, key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
    form.remove();
    return true;
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
const contactForm = document.getElementById('ko-form') as HTMLFormElement;

if (contactForm) {
    contactForm.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        void (async () => {
            const formData: KeroFormFields = {
                name: (document.getElementById('name') as HTMLInputElement).value,
                email: (document.getElementById('email') as HTMLInputElement).value,
                phone: (document.getElementById('phone') as HTMLInputElement).value,
                store: (document.getElementById('store') as HTMLInputElement).value,
                instagram: (document.getElementById('instagram') as HTMLInputElement).value,
                message: (document.getElementById('message') as HTMLTextAreaElement | null)?.value || ''
            };

            if (!validateForm(formData)) {
                return;
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]') as HTMLButtonElement | null;
            if (submitBtn) submitBtn.disabled = true;

            try {
                const ok = await sendLaharConversion(formData);
                if (ok) {
                    showFormMessage('Obrigado! Entraremos em contato em breve.', 'success');
                    setTimeout(() => {
                        contactForm.reset();
                    }, 500);
                } else {
                    showFormMessage(
                        'Não foi possível enviar agora. Tente novamente em instantes ou entre em contato por outro canal.',
                        'error'
                    );
                }
            } catch {
                showFormMessage(
                    'Erro de conexão. Verifique sua internet e tente novamente.',
                    'error'
                );
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        })();
    });
}

// Form validation
function validateForm(data: KeroFormFields): boolean {
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

    if (!data.instagram.trim()) {
        showFormMessage('Por favor, preencha seu Instagram ou nome da ótica.', 'error');
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
    const form = document.getElementById('ko-form');
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
            img.onload = () => {
                img.style.display = 'block';
                const placeholderId = (img.id || '').replace('Image', 'ImagePlaceholder').replace('Logo', 'LogoPlaceholder');
                const placeholder = placeholderId ? document.getElementById(placeholderId) : null;
                if (placeholder) {
                    (placeholder as HTMLElement).style.display = 'none';
                }
            };
            img.onerror = () => {
                img.style.display = 'none';
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
                    itemAnswer.style.maxHeight = '';
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
