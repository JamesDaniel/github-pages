function getYearLabels(numOfYears) {
    const years = [];
    for (let i=0; i<numOfYears; i++) {
        years.push(`Year ${i}`);
    }
    return years;
}
function getMonthlyContributions(monthlyContribution, numOfYears, mortgageDuration, mortgageRepayments) {
    monthlyContribution = typeof monthlyContribution !== 'undefined' && monthlyContribution > 0 ? monthlyContribution : 0;
    const contributions = [];
    for (let i=0; i<numOfYears; i++) {
        if (typeof mortgageDuration === 'undefined' || i<mortgageDuration) {
            contributions.push(monthlyContribution);
        } else {
            contributions.push(monthlyContribution + mortgageRepayments);
        }
    }
    return contributions;
}
function calculateCumulativeInterest(initialInvestment, monthlyContribution, numOfYears, interestRate) {
    const monthlyContributions = getMonthlyContributions(monthlyContribution, numOfYears);
    const endOfYearInterest = [initialInvestment];
    for (let i=1; i<numOfYears+1; i++) {
        monthlyContribution = monthlyContributions.shift();
        let total=0;
        const prev = endOfYearInterest[i-1];
        total = ((interestRate/100.0)*prev)+prev;

        if (monthlyContribution>0) {
            total += monthlyContribution*12;
        }
        endOfYearInterest.push(total);
    }
    return endOfYearInterest;
}
function calculateDeemedDisposalOffset(initialInvestment, monthlyContribution, numOfYears, interestRate, interestAmounts) {
    const monthlyContributions = getMonthlyContributions(monthlyContribution, numOfYears);
    const deemedDisposalAdjustment = [initialInvestment];
    for (let i=1; i<numOfYears+1; i++) {
        monthlyContribution = monthlyContributions.shift();
        let total=0;
        const prev = deemedDisposalAdjustment[i-1];
        const inter = interestRate/100.0;
        const interest = prev*inter;
        interestAmounts.push(interest);
        total = prev+interest;

        if (monthlyContribution>0) {
            total += monthlyContribution*12;
        }

        if (i>8) {
            const amountGained = interestAmounts.shift();
            const fourtyPercentOfInterest = amountGained*0.41;
            deemedDisposalAdjustment.push(total - fourtyPercentOfInterest);
        } else {
            deemedDisposalAdjustment.push(total);
        }
    }
    return deemedDisposalAdjustment;
}
function calculateAmountAfterTax(gainedInterestAmounts, finalAmount) {
    let totalInterestGainedNotYetTaxed=0;
    for (let i = 0; i<gainedInterestAmounts.length; i++) {
        totalInterestGainedNotYetTaxed += gainedInterestAmounts[i];
    }
    let taxDue = totalInterestGainedNotYetTaxed*0.41;
    const amountAfterTax = finalAmount - taxDue;
    return amountAfterTax;
}
function calculateTotalContributions(initialInvestment, monthlyContribution, years) {
    const contributions = [];
    contributions.push(initialInvestment);
    for (let i=1; i<years + 1; i++) {
        contributions.push((monthlyContribution*12) + contributions[i-1]);
    }
    return contributions;
}
function loadChart(data, labels) {
    const ctx = document.getElementById('chart');

    const chart = Chart.getChart('chart');
    if (typeof chart !== 'undefined') {
        chart.destroy();
    }

    new Chart(ctx, {
        type: 'line',
        data: {
        labels: labels,
        datasets: data
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
function formatNumber(floatNum) {
    let num = Intl.NumberFormat('en-IE').format(floatNum.toFixed(2)) + "";
    if (num.indexOf(".") > -1) {
        if (num.split('.')[1].length === 1){
            return `${num}0`;
        }
    } else {
        return `${num}.00`;
    }
    return num;
}

module.exports.getYearLabels = getYearLabels;
module.exports.formatNumber = formatNumber;
module.exports.calculateCumulativeInterest = calculateCumulativeInterest;
module.exports.calculateDeemedDisposalOffset = calculateDeemedDisposalOffset;
module.exports.calculateAmountAfterTax = calculateAmountAfterTax;
module.exports.calculateTotalContributions = calculateTotalContributions;
module.exports.getMonthlyContributions = getMonthlyContributions;
module.exports.loadChart = loadChart;
