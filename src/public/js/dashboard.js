document.addEventListener('DOMContentLoaded', function () {
    const barCtx = document.getElementById('revenueColumnChart').getContext('2d');
    const pieCtx = document.getElementById('revenuePieChart').getContext('2d');

    // Initialize charts with empty data
    const revenueColumnChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                type: 'bar',
                label: 'Revenue',
                data: [],
                backgroundColor: '#4caf50',
                borderColor: '#388e3c',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Revenue ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time Period'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return '$' + tooltipItem.raw;
                        }
                    }
                }
            }
        }
    });

    const revenuePieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['VNPay', 'Cash'],
            datasets: [{
                label: 'Payment Type',
                data: [],
                backgroundColor: ['#4caf50', '#ff9800'],
                borderColor: '#ffffff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return '$' + tooltipItem.raw;
                        }
                    }
                }
            }
        }
    });

    // Function to update the chart data based on the selected time range
    async function updateChartData(timeRange) {
        try {
            showLoading();
            const response = await fetch(`/dashboard/data?timeRange=${timeRange}`);
            const data = await response.json();
            const newData = data.result.revenueData || [];
            const newLabels = data.result.revenueLabels || [];
            const newPaymentData = data.result.paymentData || [];

            hideLoading();
            revenueColumnChart.data.labels = newLabels;
            revenueColumnChart.data.datasets[0].data = newData; // Update bar chart data
            revenueColumnChart.update();

            revenuePieChart.data.datasets[0].data = newPaymentData;
            revenuePieChart.update();
        } catch (error) {
            hideLoading();
            showAlert('error','Error', 'Failed to fetch data');
        }

    }

    // Event listeners for time range buttons
    document.getElementById('dayButtonChart').addEventListener('click', function () {
        updateChartData('day');
    });

    document.getElementById('weekButtonChart').addEventListener('click', function () {
        updateChartData('week');
    });

    document.getElementById('monthButtonChart').addEventListener('click', function () {
        updateChartData('month');
    });

    document.getElementById('yearButtonChart').addEventListener('click', function () {
        updateChartData('year');
    });

    // Initial chart update
    updateChartData('day');
});