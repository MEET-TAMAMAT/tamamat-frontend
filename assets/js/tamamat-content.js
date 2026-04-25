/**
 * TAMAMAT Directus Content Integration
 * Enhanced content loading using actual Directus field names
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize after other scripts load
    setTimeout(initializeContent, 500);
});

async function initializeContent() {
    console.log('🚀 Initializing TAMAMAT content from Directus...');

    try {
        // Load content from proper collections
        await Promise.all([
            loadTamamatHomeContent(),
            loadFeaturesContent(),
            loadPricingContent(),
            loadFAQContent(),
            loadContactContent(),
            loadNavigationContent()
        ]);

        console.log('✅ All TAMAMAT content loaded successfully!');
    } catch (error) {
        console.error('❌ Error loading TAMAMAT content:', error);
    }
}

/**
 * Load content from tamamat_com_home collection
 */
async function loadTamamatHomeContent() {
    try {
        const homeData = await window.directus.getItems('tamamat_com_home', {
            fields: '*',
            filter: { status: { _eq: 'published' } },
            limit: 1
        });

        if (homeData && homeData.length > 0) {
            const home = homeData[0];
            console.log('📄 Home content loaded:', home);

            // Update hero section with correct field mapping
            updateHeroFromHomeData(home);
        }
    } catch (error) {
        console.warn('Home collection not available:', error);
    }
}

/**
 * Update hero section using actual Directus field names
 */
function updateHeroFromHomeData(home) {
    // Update hero title (home_title → hero-title)
    const titleEl = document.getElementById('hero-title');
    if (titleEl && home.home_title) {
        titleEl.textContent = home.home_title;
    }

    // Update hero subtitle (home_description → hero-subtitle)
    const subtitleEl = document.getElementById('hero-subtitle');
    if (subtitleEl && home.home_description) {
        subtitleEl.textContent = home.home_description;
    }

    // Update hero image (home_image → hero-image)
    const imageEl = document.getElementById('hero-image');
    if (imageEl && home.home_image) {
        imageEl.src = `https://admin.tamamat.com/assets/${home.home_image}`;
        imageEl.alt = home.home_title || 'TAMAMAT Platform';
    }

    // Update hero button (home_button → hero-btn-secondary span)
    const secondaryBtn = document.getElementById('hero-btn-secondary');
    if (secondaryBtn && home.home_button) {
        const span = secondaryBtn.querySelector('span');
        if (span) {
            span.textContent = home.home_button;
        }
    }
}

/**
 * Load features content with correct field names
 */
async function loadFeaturesContent() {
    try {
        const featuresData = await window.directus.getItems('features_section', {
            fields: '*',
            filter: { status: { _eq: 'published' } },
            limit: 1
        });

        if (featuresData && featuresData.length > 0) {
            const features = featuresData[0];
            console.log('🎯 Features content loaded:', features);

            // Update main features title
            const featuresTitle = document.getElementById('features-title');
            if (featuresTitle && features.main_title) {
                featuresTitle.textContent = features.main_title;
            }

            // Update individual feature blocks (1-6)
            updateFeatureBlocks(features);
        }
    } catch (error) {
        console.warn('Features section not available:', error);
    }
}

/**
 * Update feature blocks with correct field names
 */
function updateFeatureBlocks(features) {
    for (let i = 1; i <= 6; i++) {
        const titleEl = document.getElementById(`feature-${i}-title`);
        const descEl = document.getElementById(`feature-${i}-description`);
        const iconEl = document.getElementById(`feature-${i}-icon`);

        // Update title
        if (titleEl && features[`feature_${i}_title`]) {
            titleEl.textContent = features[`feature_${i}_title`];
        }

        // Update description
        if (descEl && features[`feature_${i}_description`]) {
            descEl.textContent = features[`feature_${i}_description`];
        }

        // Update icon (convert HeroIcon to Bootstrap icon)
        if (iconEl && features[`feature_${i}_icon`]) {
            const iconMap = {
                'EnvelopeIcon': 'bi-envelope',
                'UsersIcon': 'bi-people',
                'ChartBarSquareIcon': 'bi-bar-chart',
                'DevicePhoneMobileIcon': 'bi-phone',
                'GlobeAltIcon': 'bi-globe',
                'AdjustmentsHorizontalIcon': 'bi-sliders'
            };

            const bsIcon = iconMap[features[`feature_${i}_icon`]] || 'bi-star';
            iconEl.className = `bi ${bsIcon}`;
        }
    }
}

/**
 * Load pricing content with correct field names
 */
async function loadPricingContent() {
    try {
        const pricingData = await window.directus.getItems('pricing_section', {
            fields: '*',
            filter: { status: { _eq: 'published' } },
            limit: 1
        });

        if (pricingData && pricingData.length > 0) {
            const pricing = pricingData[0];
            console.log('💰 Pricing content loaded:', pricing);

            // Update main pricing title
            const pricingTitle = document.getElementById('pricing-title');
            if (pricingTitle && pricing.main_title) {
                pricingTitle.textContent = pricing.main_title;
            }

            // Update pricing plans (1-3)
            updatePricingPlans(pricing);
        }
    } catch (error) {
        console.warn('Pricing section not available:', error);
    }
}

/**
 * Update pricing plans with correct field names
 */
function updatePricingPlans(pricing) {
    for (let i = 1; i <= 3; i++) {
        const titleEl = document.getElementById(`pricing-plan-${i}-title`);
        const priceEl = document.getElementById(`pricing-plan-${i}-price`);
        const buttonEl = document.getElementById(`pricing-plan-${i}-button`);
        const featuresEl = document.getElementById(`pricing-plan-${i}-features`);

        // Update title (plan_X_name → pricing-plan-X-title)
        if (titleEl && pricing[`plan_${i}_name`]) {
            titleEl.textContent = pricing[`plan_${i}_name`];
        }

        // Update price (plan_X_price → pricing-plan-X-price)
        if (priceEl && pricing[`plan_${i}_price`]) {
            let priceDisplay = pricing[`plan_${i}_price`];
            if (pricing[`plan_${i}_price_description`]) {
                priceDisplay += ` ${pricing[`plan_${i}_price_description`]}`;
            }
            priceEl.innerHTML = priceDisplay;
        }

        // Update button (plan_X_button_text → pricing-plan-X-button)
        if (buttonEl && pricing[`plan_${i}_button_text`]) {
            buttonEl.textContent = pricing[`plan_${i}_button_text`];
            if (pricing[`plan_${i}_button_link`]) {
                buttonEl.href = pricing[`plan_${i}_button_link`];
            }
        }

        // Update features list (plan_X_feature_1, plan_X_feature_2, etc.)
        if (featuresEl) {
            let featuresHTML = '';
            for (let j = 1; j <= 5; j++) {
                const feature = pricing[`plan_${i}_feature_${j}`];
                if (feature) {
                    featuresHTML += `<li>${feature}</li>`;
                }
            }
            if (featuresHTML) {
                featuresEl.innerHTML = featuresHTML;
            }
        }
    }
}

/**
 * Load FAQ content
 */
async function loadFAQContent() {
    try {
        const faqData = await window.directus.getItems('faq_items', {
            fields: '*',
            filter: { status: { _eq: 'published' } },
            sort: ['sort', 'id']
        });

        if (faqData && faqData.length > 0) {
            console.log('❓ FAQ content loaded:', faqData);

            faqData.forEach((faq, index) => {
                const faqNumber = index + 1;
                const questionEl = document.getElementById(`faq-${faqNumber}-question`);
                const answerEl = document.getElementById(`faq-${faqNumber}-answer`);

                if (questionEl && answerEl) {
                    questionEl.textContent = faq.question;
                    answerEl.textContent = faq.answer;
                }
            });
        }
    } catch (error) {
        console.warn('FAQ content not available:', error);
    }
}

/**
 * Load contact content with correct field names
 */
async function loadContactContent() {
    try {
        const contactData = await window.directus.getItems('contact_section', {
            fields: '*',
            filter: { status: { _eq: 'published' } },
            limit: 1
        });

        if (contactData && contactData.length > 0) {
            const contact = contactData[0];
            console.log('📧 Contact content loaded:', contact);

            // Update contact fields with actual Directus field names
            updateElementIfExists('contact-title', contact.main_title);
            updateElementIfExists('contact-subtitle', contact.form_title);
            updateElementIfExists('contact-email', contact.email_address);
            updateElementIfExists('contact-phone', contact.telegram_handle);
            updateElementIfExists('contact-address', `${contact.support_hours_days} ${contact.support_hours_time}`);
        }
    } catch (error) {
        console.warn('Contact section not available:', error);
    }
}

/**
 * Load navigation content
 */
async function loadNavigationContent() {
    try {
        const navData = await window.directus.getItems('navigation_items', {
            fields: '*',
            filter: { is_active: { _eq: true } },
            sort: ['sort', 'id']
        });

        if (navData && navData.length > 0) {
            console.log('🧭 Navigation loaded:', navData);
            updateNavigation(navData);
        }
    } catch (error) {
        console.warn('Navigation not available:', error);
    }
}

/**
 * Update navigation menu
 */
function updateNavigation(navItems) {
    const navContainer = document.querySelector('#navmenu .navbar-nav, .navbar-nav');
    if (!navContainer || navItems.length === 0) return;

    const navHTML = navItems.map(item => `
        <li>
            <a href="${item.href}" class="${item.is_active ? 'active' : ''}">
                ${item.label}
            </a>
        </li>
    `).join('');

    navContainer.innerHTML = navHTML;
}

/**
 * Helper function to update element if it exists
 */
function updateElementIfExists(elementId, value) {
    if (!value) return;

    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

/**
 * Utility function to refresh enhanced content
 */
window.refreshTamamatContent = function() {
    console.log('🔄 Refreshing TAMAMAT content...');
    if (window.directus) {
        window.directus.clearCache();
    }
    initializeContent();
};

// Auto-refresh content periodically if page is visible
setInterval(() => {
    if (!document.hidden && window.directus) {
        window.refreshTamamatContent();
    }
}, 10 * 60 * 1000); // 10 minutes

console.log('📝 TAMAMAT content integration loaded and ready!');