document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // DOM Elements
    const bgContainer = document.getElementById('bg-container');
    const acuityPercentage = document.getElementById('acuity-percentage');
    const progressFill = document.getElementById('progress-fill');
    const submitBtn = document.getElementById('submit-btn'); // Note: this is now the interactive voucher button
    const voucherBlurContent = document.getElementById('voucher-blur-content');
    const cupomPlaceholderText = document.getElementById('cupom-placeholder-text');

    // Form inputs (Only 4 fields now!)
    const nomeInput = document.getElementById('nome');
    const whatsappInput = document.getElementById('whatsapp');
    const emailInput = document.getElementById('email');
    const lojaSelect = document.getElementById('loja');

    // -------------------------------------------------------------
    // FORM VALIDATION & DYNAMIC PROGRESS CONTROL
    // -------------------------------------------------------------

    function checkFieldsValidity() {
        const results = {
            nome: nomeInput.value.trim().length >= 3,
            whatsapp: whatsappInput.value.replace(/\D/g, '').length >= 10 && whatsappInput.value.replace(/\D/g, '').length <= 11,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()),
            loja: lojaSelect.value !== ''
        };

        // Calculate count of valid completed fields
        let completedCount = 0;
        if (results.nome) completedCount++;
        if (results.whatsapp) completedCount++;
        if (results.email) completedCount++;
        if (results.loja) completedCount++;

        return {
            validity: results,
            completedCount: completedCount
        };
    }

    // Progression map (Completed Fields -> Voucher Blur, Page Bg Blur, Acuity Pct Label)
    const progressionMap = {
        0: { voucherBlur: '18px', bgBlur: '15px', pct: '10%' },
        1: { voucherBlur: '7px', bgBlur: '6px', pct: '50%' }, // Dynamic drop to 50% on first step
        2: { voucherBlur: '4px', bgBlur: '3.5px', pct: '70%' },
        3: { voucherBlur: '2px', bgBlur: '1.5px', pct: '85%' },
        4: { voucherBlur: '0px', bgBlur: '0px', pct: '100%' }  // Perfectly sharp!
    };

    function updateProgressUI() {
        const { validity, completedCount } = checkFieldsValidity();
        const config = progressionMap[completedCount];

        if (config) {
            // Apply sync blur changes to both coupon content and page background image
            if (voucherBlurContent) voucherBlurContent.style.filter = `blur(${config.voucherBlur})`;
            bgContainer.style.filter = `blur(${config.bgBlur})`;
            
            if (acuityPercentage) acuityPercentage.textContent = config.pct;
            if (progressFill) progressFill.style.width = config.pct;
        }

        // Enable or disable submit button (the coupon itself) based on form completion
        if (completedCount === 4) {
            submitBtn.disabled = false;
            cupomPlaceholderText.textContent = 'CLIQUE AQUI PARA RESGATAR 🔓';
            cupomPlaceholderText.style.color = 'var(--neon-cyan)';
        } else {
            submitBtn.disabled = true;
            cupomPlaceholderText.textContent = 'PREENCHA PARA REVELAR 🔒';
            cupomPlaceholderText.style.color = '';
        }
    }

    // -------------------------------------------------------------
    // EVENT LISTENERS & INPUT HANDLING
    // -------------------------------------------------------------

    nomeInput.addEventListener('input', updateProgressUI);
    emailInput.addEventListener('input', updateProgressUI);
    lojaSelect.addEventListener('change', updateProgressUI);

    // WhatsApp Input Formatting Mask & trigger validation
    whatsappInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric
        if (value.length > 11) value = value.substring(0, 11);

        // Apply formatting mask dynamically
        if (value.length > 6) {
            e.target.value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
        } else if (value.length > 2) {
            e.target.value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        } else if (value.length > 0) {
            e.target.value = `(${value}`;
        } else {
            e.target.value = '';
        }

        updateProgressUI();
    });

    // -------------------------------------------------------------
    // FORM SUBMIT & LEADS RETENTION
    // -------------------------------------------------------------
    const unifiedForm = document.getElementById('unified-form');

    unifiedForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const { validity, completedCount } = checkFieldsValidity();
        if (completedCount < 4) return; // Halt if form is incomplete

        const nome = nomeInput.value.trim();
        const whatsapp = whatsappInput.value.trim();
        const email = emailInput.value.trim();
        const loja = lojaSelect.value;

        // Construct lead payload (sets default receta as 'agendar' for CRM alerts)
        const leadData = {
            nome: nome,
            whatsapp: whatsapp,
            email: email,
            receita: 'exame', // Leads default to scheduling examination validation on thanks page
            loja: loja,
            timestamp: new Date().toISOString()
        };

        // Save locally to display on thank you page
        localStorage.setItem('zeiss_lead_data', JSON.stringify(leadData));

        // Submit loading states on the Coupon button
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem; padding: 1.5rem 0;">
                <span style="font-weight: 700; color: #10b981; font-size: 0.9rem; letter-spacing: 1.5px; text-transform: uppercase;">GERANDO SEU VOUCHER...</span>
                <i data-lucide="loader" class="spin" style="width: 24px; height: 24px; color: #10b981;"></i>
            </div>
        `;
        lucide.createIcons();

        // 100% Unblur / focus satisfaction animation on submit
        if (voucherBlurContent) voucherBlurContent.style.filter = 'blur(0px)';
        submitBtn.style.borderColor = 'var(--success)';
        submitBtn.style.boxShadow = '0 0 35px rgba(16, 185, 129, 0.5)';
        
        bgContainer.style.filter = 'blur(0px)';
        
        if (acuityPercentage) acuityPercentage.textContent = '100%';
        if (progressFill) {
            progressFill.style.width = '100%';
            progressFill.style.background = 'var(--success)';
        }

        // Simulate small delay, then redirect
        setTimeout(() => {
            window.location.href = 'obrigado.html';
        }, 1100);
    });

    // Run initial UI state
    updateProgressUI();
});
