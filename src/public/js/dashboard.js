document.addEventListener('DOMContentLoaded', function() {
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
            }, {
                type: 'line',
                label: 'Revenue Trend',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
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
                        label: function(tooltipItem) {
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
            labels: ['Cash', 'VNPay'],
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
                        label: function(tooltipItem) {
                            return '$' + tooltipItem.raw;
                        }
                    }
                }
            }
        }
    });

    // Function to update the chart data based on the selected time range
    function updateChartData(timeRange) {
        // Fetch new data based on the time range
        fetch(`/dashboard/data?timeRange=${timeRange}`)
            .then(response => response.json())
            .then(data => {
                const newData = data.revenueData || [];
                const newLabels = data.revenueLabels || [];
                const newPaymentData = data.paymentData || [];

                revenueColumnChart.data.labels = newLabels;
                revenueColumnChart.data.datasets[0].data = newData; // Update bar chart data
                revenueColumnChart.data.datasets[1].data = newData; // Update line chart data
                revenueColumnChart.update();

                revenuePieChart.data.datasets[0].data = newPaymentData;
                revenuePieChart.update();
            })
            .catch(error => console.error('Error fetching chart data:', error));
    }

    // Event listeners for time range buttons
    document.getElementById('dayButtonChart').addEventListener('click', function() {
        updateChartData('day');
    });

    document.getElementById('weekButtonChart').addEventListener('click', function() {
        updateChartData('week');
    });

    document.getElementById('monthButtonChart').addEventListener('click', function() {
        updateChartData('month');
    });

    document.getElementById('yearButtonChart').addEventListener('click', function() {
        updateChartData('year');
    });

    // Initial chart update
    updateChartData('day');
});