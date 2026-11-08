
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import api from "../services/api";
import { calculateTaxEstimate } from "../services/taxCalculator";

// South African tax year: 1 March to the end of February.
const getSouthAfricanTaxYear = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    return month >= 2 ? year + 1 : year;
};

const formatCurrency = (amount) => {
    return `R${Number(amount).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

const CHART_COLORS = {
    purple: "#8064d8",
    navy: "#253455",
    green: "#56ad91",
    lightPurple: "#e7ddff"
};

const createMonthlyEarnings = (transactions, taxYear) => {
    const startYear = taxYear - 1;

    const months = Array.from({ length: 12 }, (_, index) => {
        const date = new Date(startYear, index + 2, 1);

        return {
            month: date.toLocaleString("en-ZA", {
                month: "short"
            }),
            year: date.getFullYear(),
            monthIndex: date.getMonth(),
            earnings: 0
        };
    });

    transactions.forEach((transaction) => {
        if (
            transaction.status !== "completed" ||
            !transaction.createdAt
        ) {
            return;
        }

        const date = new Date(transaction.createdAt);

        if (
            Number.isNaN(date.getTime()) ||
            getSouthAfricanTaxYear(date) !== taxYear
        ) {
            return;
        }

        const month = months.find(
            (item) =>
                item.year === date.getFullYear() &&
                item.monthIndex === date.getMonth()
        );

        const amount = Number(transaction.amount);

        if (month && Number.isFinite(amount) && amount > 0) {
            month.earnings += amount;
        }
    });

    return months.map(({ month, year, earnings }) => ({
        month: `${month} ${String(year).slice(-2)}`,
        earnings: Math.round(earnings * 100) / 100
    }));
};

function FreelancerIncomePage() {
    const [income, setIncome] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [additionalIncome, setAdditionalIncome] = useState("");
    const [deductibleExpenses, setDeductibleExpenses] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchIncome = async () => {
            try {
                const [incomeResponse, transactionsResponse] =
                    await Promise.all([
                        api.get("/transactions/freelancer/income"),
                        api.get("/transactions/freelancer")
                    ]);

                setIncome(incomeResponse.data.income);
                setTransactions(
                    transactionsResponse.data.transactions || []
                );
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message ||
                    "Unable to load your financial dashboard."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchIncome();
    }, []);

    const currentTaxYear = getSouthAfricanTaxYear(new Date());

    const taxYearTransactions = transactions.filter((transaction) => {
        if (
            transaction.status !== "completed" ||
            !transaction.createdAt
        ) {
            return false;
        }

        const transactionDate = new Date(transaction.createdAt);

        return (
            !Number.isNaN(transactionDate.getTime()) &&
            getSouthAfricanTaxYear(transactionDate) === currentTaxYear
        );
    });

    const taxYearIncome = taxYearTransactions.reduce(
        (total, transaction) =>
            total + Number(transaction.amount || 0),
        0
    );

    const taxEstimate = calculateTaxEstimate({
        hustleHubIncome: taxYearIncome,
        additionalIncome,
        deductibleExpenses
    });

    const monthlyEarnings = createMonthlyEarnings(
        taxYearTransactions,
        currentTaxYear
    );

    const expenseAmount = Math.min(
        taxEstimate.grossIncome,
        Math.max(0, Number(deductibleExpenses) || 0)
    );

    const taxBreakdown = [
        {
            name: "After-tax income",
            value: taxEstimate.estimatedAfterTaxIncome,
            color: CHART_COLORS.green
        },
        {
            name: "Estimated tax",
            value: taxEstimate.estimatedTax,
            color: CHART_COLORS.purple
        },
        {
            name: "Deductible expenses",
            value: expenseAmount,
            color: CHART_COLORS.navy
        }
    ].filter((item) => item.value > 0);

    const hasCompletedTransactions = taxYearTransactions.length > 0;
    const hasTaxBreakdown = taxBreakdown.length > 0;

    if (isLoading) {
        return (
            <main className="page-container">
                <p>Loading financial dashboard...</p>
            </main>
        );
    }

    return (
        <main className="page-container">
            <div className="page-header page-header-row">
                <div>
                    <span className="page-eyebrow">
                        FREELANCER WORKSPACE
                    </span>

                    <h1>Financial Dashboard</h1>

                    <p>
                        Track your earnings and estimate your
                        annual income tax.
                    </p>
                </div>

                <Link
                    to="/freelancer/bookings"
                    className="btn btn-secondary"
                >
                    View My Bookings
                </Link>
            </div>

            {errorMessage ? (
                <div className="error-message">
                    {errorMessage}
                </div>
            ) : (
                <div className="financial-dashboard">
                    <div className="financial-summary-grid">
                        <div className="financial-summary-card highlight">
                            <span className="financial-summary-label">
                                Total Earnings
                            </span>

                            <strong className="financial-summary-value">
                                {formatCurrency(income)}
                            </strong>

                            <p className="financial-summary-note">
                                All recorded completed transactions
                            </p>
                        </div>

                        <div className="financial-summary-card">
                            <span className="financial-summary-label">
                                Tax Year {currentTaxYear} Earnings
                            </span>

                            <strong className="financial-summary-value">
                                {formatCurrency(taxYearIncome)}
                            </strong>

                            <p className="financial-summary-note">
                                {taxYearTransactions.length} completed
                                transactions this tax year
                            </p>
                        </div>

                        <div className="financial-summary-card">
                            <span className="financial-summary-label">
                                Estimated Taxable Income
                            </span>

                            <strong className="financial-summary-value">
                                {formatCurrency(taxEstimate.taxableIncome)}
                            </strong>

                            <p className="financial-summary-note">
                                Annual income after estimated deductions
                            </p>
                        </div>

                        <div className="financial-summary-card">
                            <span className="financial-summary-label">
                                Estimated Annual Tax
                            </span>

                            <strong className="financial-summary-value">
                                {formatCurrency(taxEstimate.estimatedTax)}
                            </strong>

                            <p className="financial-summary-note">
                                Based on South African tax year {currentTaxYear}
                            </p>
                        </div>
                    </div>

                    <section className="financial-tax-card">
                        <div className="financial-tax-header">
                            <h2>Annual Tax Estimator</h2>

                            <p>
                                Enter your expected additional annual income
                                and deductible expenses to calculate an
                                estimated tax liability.
                            </p>
                        </div>

                        <div className="financial-tax-form">
                            <div className="financial-tax-field">
                                <label htmlFor="additionalIncome">
                                    Additional Annual Income (R)
                                </label>

                                <input
                                    id="additionalIncome"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={additionalIncome}
                                    onChange={(event) =>
                                        setAdditionalIncome(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. 150000"
                                />
                            </div>

                            <div className="financial-tax-field">
                                <label htmlFor="deductibleExpenses">
                                    Deductible Expenses (R)
                                </label>

                                <input
                                    id="deductibleExpenses"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={deductibleExpenses}
                                    onChange={(event) =>
                                        setDeductibleExpenses(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. 20000"
                                />
                            </div>
                        </div>

                        <div className="financial-tax-footer">
                            <p>
                                Tax year {currentTaxYear} | Assumes a taxpayer
                                younger than 65. Calculations use recorded
                                HustleHub+ earnings and user-entered estimates.
                                HustleHub+ transactions are simulated, not
                                verified payments. This is an educational
                                estimate, not a SARS tax assessment or
                                professional tax advice.
                            </p>
                        </div>
                    </section>

                    <div className="financial-charts-grid">
                        <section className="financial-chart-card">
                            <div className="financial-chart-header">
                                <h2>Monthly Earnings</h2>
                                <p>
                                    Completed transactions for South African
                                    tax year {currentTaxYear}
                                </p>
                            </div>

                            {hasCompletedTransactions ? (
                                <div className="financial-chart-container">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <BarChart
                                            data={monthlyEarnings}
                                            margin={{
                                                top: 15,
                                                right: 15,
                                                left: 5,
                                                bottom: 5
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fontSize: 11 }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 11 }}
                                                tickFormatter={(value) =>
                                                    `R${value}`
                                                }
                                            />
                                            <Tooltip
                                                formatter={(value) =>
                                                    formatCurrency(value)
                                                }
                                            />
                                            <Bar
                                                dataKey="earnings"
                                                name="Earnings"
                                                fill={CHART_COLORS.purple}
                                                radius={[6, 6, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="financial-chart-empty">
                                    No completed transactions recorded
                                    for this tax year yet.
                                </p>
                            )}
                        </section>

                        <section className="financial-chart-card">
                            <div className="financial-chart-header">
                                <h2>Estimated Income Breakdown</h2>
                                <p>
                                    Estimated annual income allocation
                                    for tax year {currentTaxYear}
                                </p>
                            </div>

                            {hasTaxBreakdown ? (
                                <div className="financial-chart-container">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={taxBreakdown}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={55}
                                                outerRadius={90}
                                                paddingAngle={3}
                                            >
                                                {taxBreakdown.map((item) => (
                                                    <Cell
                                                        key={item.name}
                                                        fill={item.color}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) =>
                                                    formatCurrency(value)
                                                }
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={40}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="financial-chart-empty">
                                    Enter annual income to see your
                                    estimated financial breakdown.
                                </p>
                            )}
                        </section>
                    </div>
                </div>
            )}
        </main>
    );
}

export default FreelancerIncomePage;
