import React from 'react';
import { formatIndianCurrency } from '../utils/currencyFormat';

interface TestCase {
  title: string;
  input: {
    period: {
      fromDate: string;
      toDate: string;
      days: number;
    };
    dailyRent: number;
    outstanding: {
      size: number;
      pieces: number;
    }[];
    extraCosts?: {
      description: string;
      pieces: number;
      rate: number;
      amount: number;
    }[];
    discounts?: {
      description: string;
      pieces: number;
      rate: number;
      amount: number;
    }[];
    payments?: {
      description: string;
      amount: number;
    }[];
  };
  expected: {
    totalRent: number;
    extraCostsTotal: number;
    discountsTotal: number;
    grandTotal: number;
    totalPaid: number;
    duePayment: number;
  };
}

const testCases: TestCase[] = [
  {
    title: "Example 1: Simple Rental Bill",
    input: {
      period: {
        fromDate: "2025-01-01",
        toDate: "2025-01-31",
        days: 31
      },
      dailyRent: 5,
      outstanding: [
        { size: 1, pieces: 50 },
        { size: 2, pieces: 30 }
      ]
    },
    expected: {
      totalRent: 12400, // (50 × 31 × 5) + (30 × 31 × 5)
      extraCostsTotal: 0,
      discountsTotal: 0,
      grandTotal: 12400,
      totalPaid: 0,
      duePayment: 12400
    }
  },
  {
    title: "Example 2: Complex Bill with All Components",
    input: {
      period: {
        fromDate: "2025-01-01",
        toDate: "2025-01-31",
        days: 31
      },
      dailyRent: 5,
      outstanding: [
        { size: 1, pieces: 50 }
      ],
      extraCosts: [
        { description: "Transport", pieces: 20, rate: 50, amount: 1000 },
        { description: "Damage", pieces: 5, rate: 100, amount: 500 }
      ],
      discounts: [
        { description: "Bulk discount", pieces: 50, rate: 2, amount: 100 }
      ],
      payments: [
        { description: "Advance", amount: 5000 },
        { description: "Part payment", amount: 3000 }
      ]
    },
    expected: {
      totalRent: 7750, // 50 × 31 × 5
      extraCostsTotal: 1500,
      discountsTotal: 100,
      grandTotal: 9150, // 7750 + 1500 - 100
      totalPaid: 8000,
      duePayment: 1150 // 9150 - 8000
    }
  }
];

const BillingCalculationTest: React.FC = () => {
  // Function to calculate rental charges
  const calculateRentalCharges = (
    pieces: number,
    days: number,
    dailyRent: number
  ) => pieces * days * dailyRent;

  // Function to test calculations
  const testCalculations = (testCase: TestCase) => {
    // Calculate total rent
    const calculatedTotalRent = testCase.input.outstanding.reduce(
      (total, item) => total + calculateRentalCharges(item.pieces, testCase.input.period.days, testCase.input.dailyRent),
      0
    );

    // Calculate extra costs total
    const calculatedExtraCostsTotal = testCase.input.extraCosts?.reduce(
      (total, cost) => total + cost.amount,
      0
    ) || 0;

    // Calculate discounts total
    const calculatedDiscountsTotal = testCase.input.discounts?.reduce(
      (total, discount) => total + discount.amount,
      0
    ) || 0;

    // Calculate grand total
    const calculatedGrandTotal = calculatedTotalRent + calculatedExtraCostsTotal - calculatedDiscountsTotal;

    // Calculate total paid
    const calculatedTotalPaid = testCase.input.payments?.reduce(
      (total, payment) => total + payment.amount,
      0
    ) || 0;

    // Calculate due payment
    const calculatedDuePayment = calculatedGrandTotal - calculatedTotalPaid;

    // Check if calculations match expected values
    const matches = {
      totalRent: calculatedTotalRent === testCase.expected.totalRent,
      extraCostsTotal: calculatedExtraCostsTotal === testCase.expected.extraCostsTotal,
      discountsTotal: calculatedDiscountsTotal === testCase.expected.discountsTotal,
      grandTotal: calculatedGrandTotal === testCase.expected.grandTotal,
      totalPaid: calculatedTotalPaid === testCase.expected.totalPaid,
      duePayment: calculatedDuePayment === testCase.expected.duePayment
    };

    return {
      calculated: {
        totalRent: calculatedTotalRent,
        extraCostsTotal: calculatedExtraCostsTotal,
        discountsTotal: calculatedDiscountsTotal,
        grandTotal: calculatedGrandTotal,
        totalPaid: calculatedTotalPaid,
        duePayment: calculatedDuePayment
      },
      matches
    };
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Billing Calculation Test</h1>
      
      {testCases.map((testCase, index) => {
        const result = testCalculations(testCase);
        const allMatch = Object.values(result.matches).every(match => match);

        return (
          <div key={index} className={`mb-8 p-6 rounded-lg border ${allMatch ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <h2 className="text-xl font-semibold mb-4">{testCase.title}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Input Data:</h3>
                <p>Period: {testCase.input.period.fromDate} to {testCase.input.period.toDate}</p>
                <p>Days: {testCase.input.period.days}</p>
                <p>Daily Rent: {formatIndianCurrency(testCase.input.dailyRent)}</p>
                
                <div className="mt-2">
                  <p className="font-medium">Outstanding:</p>
                  {testCase.input.outstanding.map((item, i) => (
                    <p key={i}>Size {item.size}: {item.pieces} pieces</p>
                  ))}
                </div>

                {testCase.input.extraCosts && (
                  <div className="mt-2">
                    <p className="font-medium">Extra Costs:</p>
                    {testCase.input.extraCosts.map((cost, i) => (
                      <p key={i}>{cost.description}: {cost.pieces} × {formatIndianCurrency(cost.rate)} = {formatIndianCurrency(cost.amount)}</p>
                    ))}
                  </div>
                )}

                {testCase.input.discounts && (
                  <div className="mt-2">
                    <p className="font-medium">Discounts:</p>
                    {testCase.input.discounts.map((discount, i) => (
                      <p key={i}>{discount.description}: {discount.pieces} × {formatIndianCurrency(discount.rate)} = {formatIndianCurrency(discount.amount)}</p>
                    ))}
                  </div>
                )}

                {testCase.input.payments && (
                  <div className="mt-2">
                    <p className="font-medium">Payments:</p>
                    {testCase.input.payments.map((payment, i) => (
                      <p key={i}>{payment.description}: {formatIndianCurrency(payment.amount)}</p>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Calculations:</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="font-medium">Item</div>
                  <div className="font-medium">Expected</div>
                  <div className="font-medium">Calculated</div>

                  {Object.entries(result.calculated).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <div className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                      <div className={result.matches[key as keyof typeof result.matches] ? 'text-green-600' : 'text-red-600'}>
                        {formatIndianCurrency(testCase.expected[key as keyof typeof testCase.expected])}
                      </div>
                      <div className={result.matches[key as keyof typeof result.matches] ? 'text-green-600' : 'text-red-600'}>
                        {formatIndianCurrency(value)}
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-4">
                  <p className={`font-medium ${allMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {allMatch ? '✓ All calculations match' : '✗ Some calculations do not match'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BillingCalculationTest;