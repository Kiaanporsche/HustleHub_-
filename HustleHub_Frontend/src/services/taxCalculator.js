
/*
 * HustleHub+ - South African Tax Estimator
 *
 * Tax year: 2027 (1 March 2026 - 28 February 2027)
 * Assumption: Individual taxpayer younger than 65.
 *
 * Source: South African Revenue Service (SARS)
 * https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/
 *
 * Educational estimate only. Not an official tax assessment.
 */

export const TAX_YEAR = 2027;

export const PRIMARY_REBATE = 17820;

const TAX_BRACKETS = [
    { limit: 245100, rate: 0.18 },
    { limit: 383100, rate: 0.26 },
    { limit: 530200, rate: 0.31 },
    { limit: 695800, rate: 0.36 },
    { limit: 887000, rate: 0.39 },
    { limit: 1878600, rate: 0.41 },
    { limit: Infinity, rate: 0.45 }
];

// Calculate annual tax before the primary rebate.
export const calculateGrossTax = (taxableIncome) => {
    const income = Number(taxableIncome);

    if (!Number.isFinite(income) || income <= 0) {
        return 0;
    }

    let remainingIncome = income;
    let previousLimit = 0;
    let totalTax = 0;

    for (const bracket of TAX_BRACKETS) {
        const bracketWidth = bracket.limit - previousLimit;
        const taxableAmount = Math.min(
            remainingIncome,
            bracketWidth
        );

        totalTax += taxableAmount * bracket.rate;
        remainingIncome -= taxableAmount;

        if (remainingIncome <= 0) {
            break;
        }

        previousLimit = bracket.limit;
    }

    return totalTax;
};

// Estimate annual income tax after the primary rebate.
export const calculateAnnualTax = (taxableIncome) => {
    const grossTax = calculateGrossTax(taxableIncome);

    return Math.round(
        Math.max(0, grossTax - PRIMARY_REBATE) * 100
    ) / 100;
};

// Combine recorded earnings with the user's annual estimates.
export const calculateTaxEstimate = ({
    hustleHubIncome = 0,
    additionalIncome = 0,
    deductibleExpenses = 0
} = {}) => {
    const toAmount = (value) => {
        const amount = Number(value);
        return Number.isFinite(amount)
            ? Math.max(0, amount)
            : 0;
    };

    const recordedIncome = toAmount(hustleHubIncome);
    const otherIncome = toAmount(additionalIncome);
    const expenses = toAmount(deductibleExpenses);

    const grossIncome = recordedIncome + otherIncome;

    const taxableIncome = Math.max(
        0,
        grossIncome - expenses
    );

    const estimatedTax = calculateAnnualTax(taxableIncome);

    return {
        taxYear: TAX_YEAR,
        grossIncome,
        taxableIncome,
        estimatedTax,
        estimatedAfterTaxIncome: Math.max(
            0,
            grossIncome - expenses - estimatedTax
        )
    };
};
