class FinancialCalculator extends HTMLElement {

    static get observedAttributes() {
        return ['amount', 'rate', 'term'];
    }

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: 'open' });
        this.amountValue = 100000;
        this.rateValue = 12;
        this.termValue = 12;
        this.isRendered = false;
        this.handleInput = this.handleInput.bind(this);
        console.log('Компонент создан');
    }

    connectedCallback() {
        console.log('Компонент добавлен в DOM');
        if (this.hasAttribute('amount')) {
            const v = parseFloat(this.getAttribute('amount'));
            if (this.isValidNumber(v, 0)) this.amountValue = v;
        }
        if (this.hasAttribute('rate')) {
            const v = parseFloat(this.getAttribute('rate'));
            if (this.isValidNumber(v, 0)) this.rateValue = v;
        }
        if (this.hasAttribute('term')) {
            const v = parseFloat(this.getAttribute('term'));
            if (this.isValidNumber(v, 1)) this.termValue = v;
        }
        if (!this.isRendered) {
            this.render();
            this.attachEvents();
            this.isRendered = true;
        }

        this.calculate();
    }

    disconnectedCallback() {
        console.log('Компонент удалён из DOM');
        this.detachEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        console.log(`Атрибут "${name}" изменён: "${oldValue}" => "${newValue}"`);

        const value = parseFloat(newValue);

        if (name === 'amount' && this.isValidNumber(value, 0)) this.amountValue = value;
        if (name === 'rate'   && this.isValidNumber(value, 0)) this.rateValue = value;
        if (name === 'term'   && this.isValidNumber(value, 1)) this.termValue = value;

       if (this.isRendered) {
        const active = this.shadow.activeElement;
        const typing = active && active.tagName === 'INPUT';
        if (!typing) {
            this.syncInputs();
        }
        this.calculate();
    }
    }

    get amount() { return this.amountValue; }
    set amount(value) {
        if (this.isValidNumber(value, 0)) this.setAttribute('amount', value);
    }

    get rate() { return this.rateValue; }
    set rate(value) {
        if (this.isValidNumber(value, 0)) this.setAttribute('rate', value);
    }

    get term() { return this.termValue; }
    set term(value) {
        if (this.isValidNumber(value, 1)) this.setAttribute('term', value);
    }

    render() {
        this.shadow.innerHTML = `
            <style>
                .card {
                    display: block;
                    max-width: 520px;
                    width: 100%;
                    color: #1f2933;
                    background: #fff;
                    border-radius: 12px;
                    padding: 28px;
                    box-shadow: 0 4px 20px rgba(0,0,0,.08);
                    box-sizing: border-box;
                }
                h2 {
                    margin: 0 0 20px; font-size: 22px; 
                }
                .field { 
                    margin-bottom: 16px; display: flex; flex-direction: column; 
                }
                label { 
                    font-size: 13px; color: #52606d; margin-bottom: 6px; 
                }
                input {
                    padding: 10px 12px;
                    border: 1px solid #cbd2d9;
                    border-radius: 6px;
                    font-size: 15px;
                    outline: none;
                }
                input:focus {
                    border-color: #3e7bfa;
                    box-shadow: 0 0 0 3px rgba(62,123,250,.15);
                }
                input.invalid {
                    border-color: #e12d39;
                    box-shadow: 0 0 0 3px rgba(225,45,57,.15);
                }
                .error {
                    color: #e12d39;
                    font-size: 12px;
                    margin-top: 4px;
                    min-height: 14px;
                }
                .results {
                    margin-top: 24px;
                    padding-top: 20px;
                    border-top: 1px solid #e4e7eb;
                }
                .results h3 {
                    margin: 0 0 14px; font-size: 17px; 
                 }
                .row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    font-size: 15px;
                }
                .row span:first-child {
                    color: #52606d; 
                 }
                .row span:last-child { 
                    font-weight: 600; 
                }
            </style>

            <div class="card">
                <h2>Финансовый калькулятор</h2>

                <div class="field">
                    <label for="amount">Сумма кредита (₽)</label>
                    <input id="amount" type="number" min="0" step="1000" value="${this.amountValue}">
                    <div class="error" id="amountError"></div>
                </div>

                <div class="field">
                    <label for="rate">Процентная ставка (% годовых)</label>
                    <input id="rate" type="number" min="0" step="0.1" value="${this.rateValue}">
                    <div class="error" id="rateError"></div>
                </div>

                <div class="field">
                    <label for="term">Срок кредита (месяцев)</label>
                    <input id="term" type="number" min="1" step="1" value="${this.termValue}">
                    <div class="error" id="termError"></div>
                </div>

                <div class="results">
                    <h3>Результаты расчёта</h3>
                    <div class="row"><span>Ежемесячный платёж:</span><span id="monthlyPayment">—</span></div>
                    <div class="row"><span>Общая сумма выплат:</span><span id="totalPayment">—</span></div>
                    <div class="row"><span>Общий процент по кредиту:</span><span id="totalInterest">—</span></div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        this.inputs = this.shadow.querySelectorAll('input');
        this.inputs.forEach(input => input.addEventListener('input', this.handleInput));
    }

    detachEvents() {
        this.inputs.forEach(input => input.removeEventListener('input', this.handleInput));
    }

    handleInput(event) {
        const input = event.target;
        if (input.id === 'amount') {
            this.setAttribute('amount', input.value);
        }
        if (input.id === 'rate') {
            this.setAttribute('rate', input.value);
        }
        if (input.id === 'term') {
            this.setAttribute('term', input.value);
        }
    }

    isValidNumber(value, min) {
        return typeof value === 'number' && Number.isFinite(value) && value >= min;
    }

    showError(input, message) {
        input.classList.toggle('invalid', Boolean(message));
        
        const errorElement = this.shadow.querySelector(`#${input.id}Error`);
        if (errorElement) errorElement.textContent = message || '';
    }

    syncInputs() {
        this.shadow.querySelector('#amount').value = this.amountValue;
        this.shadow.querySelector('#rate').value = this.rateValue;
        this.shadow.querySelector('#term').value = this.termValue;
    }

    calculate() {
        const amountInput = this.shadow.querySelector('#amount');
        const rateInput = this.shadow.querySelector('#rate');
        const termInput = this.shadow.querySelector('#term');

        const amount = parseFloat(amountInput.value);
        const rate = parseFloat(rateInput.value);
        const term = parseFloat(termInput.value);

        this.showError(amountInput, '');
        this.showError(rateInput, '');
        this.showError(termInput, '');

        let hasError = false;

        if (!this.isValidNumber(amount, 0) || amount === 0) {
            this.showError(amountInput, 'Введите сумму больше 0');
            hasError = true;
        }
        if (!this.isValidNumber(rate, 0)) {
            this.showError(rateInput, 'Введите неотрицательную ставку');
            hasError = true;
        }
        if (!this.isValidNumber(term, 1)) {
            this.showError(termInput, 'Срок должен быть не менее 1 месяца');
            hasError = true;
        }

        const monthlyElement = this.shadow.querySelector('#monthlyPayment');
        const totalElement = this.shadow.querySelector('#totalPayment');
        const interestElement = this.shadow.querySelector('#totalInterest');

        if (hasError) {
            monthlyElement.textContent = '—';
            totalElement.textContent = '—';
            interestElement.textContent = '—';
            return;
        }
        const monthlyRate = rate / 100 / 12;
        let monthlyPayment;
        if (monthlyRate === 0) {
            monthlyPayment = amount / term;
        } else {
            const factor = Math.pow(1 + monthlyRate, term);
            monthlyPayment = amount * (monthlyRate * factor) / (factor - 1);
        }
        const totalPayment = monthlyPayment * term;
        const totalInterest = totalPayment - amount;

        monthlyElement.textContent = monthlyPayment.toFixed(2);
        totalElement.textContent = totalPayment.toFixed(2);
        interestElement.textContent = `${((totalInterest / amount) * 100).toFixed(1)} %`;
        console.log('Данные обновлены, результаты пересчитаны');
    }

}

customElements.define('financial-calculator', FinancialCalculator);





function removeCalculator() {
    document.querySelector('financial-calculator').remove();
    document.getElementById('button').remove();
    document.getElementById('demo').remove();
}
document.getElementById('demo').addEventListener('click', () => {
    const c = document.querySelector('financial-calculator');
    c.amount = 500000;
    c.rate = 9.5;
    c.term = 36;
});