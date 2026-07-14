document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const bgContainer = document.getElementById('bg-container');
    const acuityPercentage = document.getElementById('acuity-percentage');
    const progressFill = document.getElementById('progress-fill');
    const submitBtn = document.getElementById('submit-btn');
    const voucherBlurContent = document.getElementById('voucher-blur-content');
    const cupomPlaceholderText = document.getElementById('cupom-placeholder-text');

    const nomeInput = document.getElementById('nome');
    const whatsappInput = document.getElementById('whatsapp');
    const emailInput = document.getElementById('email');
    const lojaSelect = document.getElementById('loja');

    function checkFieldsValidity() {
        const results = {
            nome: nomeInput.value.trim().length >= 3,
            whatsapp: whatsappInput.value.replace(/\D/g, '').length >= 10 && whatsappInput.value.replace(/\D/g, '').length <= 11,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()),
            loja: lojaSelect.value !== ''
        };
        let completedCount = 0;
        if (results.nome) completedCount++;
        if (results.whatsapp) completedCount++;
        if (results.email) completedCount++;
        if (results.loja) completedCount++;
        return { validity: results, completedCount };
    }

    const progressionMap = {
        0: { voucherBlur: '20px', bgBlur: '22px', pct: '10%' },
        1: { voucherBlur: '9px', bgBlur: '10px', pct: '45%' },
        2: { voucherBlur: '5px', bgBlur: '5px', pct: '68%' },
        3: { voucherBlur: '2px', bgBlur: '2px', pct: '88%' },
        4: { voucherBlur: '0px', bgBlur: '0px', pct: '100%' }
    };

    function updateProgressUI() {
        const { completedCount } = checkFieldsValidity();
        const config = progressionMap[completedCount];

        if (config) {
            if (voucherBlurContent) voucherBlurContent.style.filter = `blur(${config.voucherBlur})`;
            bgContainer.style.filter = `blur(${config.bgBlur}) brightness(0.55) saturate(1.05)`;
            if (acuityPercentage) acuityPercentage.textContent = config.pct;
            if (progressFill) progressFill.style.width = config.pct;
        }

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

    nomeInput.addEventListener('input', updateProgressUI);
    emailInput.addEventListener('input', updateProgressUI);
    lojaSelect.addEventListener('change', updateProgressUI);

    whatsappInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);
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

    const unifiedForm = document.getElementById('unified-form');

    unifiedForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const { completedCount } = checkFieldsValidity();
        if (completedCount < 4) return;

        const leadData = {
            nome: nomeInput.value.trim(),
            whatsapp: whatsappInput.value.trim(),
            email: emailInput.value.trim(),
            loja: lojaSelect.value,
            timestamp: new Date().toISOString()
        };

        // TODO(Nathan): trocar por envio real ao Agente de IA / CRM HSales (webhook ou API) antes de publicar.
        localStorage.setItem('zeiss_lead_data', JSON.stringify(leadData));

        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem; padding: 1.5rem 0;">
                <span style="font-weight: 700; color: var(--success); font-size: 0.9rem; letter-spacing: 1.5px; text-transform: uppercase;">REVELANDO SEU CUPOM...</span>
                <i data-lucide="loader" class="spin" style="width: 24px; height: 24px; color: var(--success);"></i>
            </div>
        `;
        lucide.createIcons();

        if (voucherBlurContent) voucherBlurContent.style.filter = 'blur(0px)';
        submitBtn.style.borderColor = 'var(--success)';
        submitBtn.style.boxShadow = '0 0 35px rgba(16, 185, 129, 0.5)';
        bgContainer.style.filter = 'blur(0px) brightness(0.55) saturate(1.05)';

        if (acuityPercentage) acuityPercentage.textContent = '100%';
        if (progressFill) {
            progressFill.style.width = '100%';
            progressFill.style.background = 'var(--success)';
        }

        setTimeout(() => {
            window.location.href = 'obrigado.html';
        }, 1100);
    });

    updateProgressUI();
});
