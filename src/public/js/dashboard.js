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

    // Function to update the top products table based on the selected time range
    async function updateTopProducts(timeRange) {
        try {
            showLoading();
            const response = await fetch(`/dashboard/top-products?timeRange=${timeRange}`);
            const data = await response.json();
            const productList = data.result.productList || [];

            hideLoading();
            const tbody = document.querySelector('.tbl-server-info tbody');
            tbody.innerHTML = ''; // Clear existing rows

            productList.slice(0, 5).forEach((product, index) => {
                const row = document.createElement('tr');
                row.classList.add('text-center');
                row.innerHTML = `
                    <td>
                        <div class="checkbox d-inline-block">
                            <input type="checkbox" class="checkbox-input" id="checkbox${index}">
                            <label for="checkbox${index}" class="mb-0"></label>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${product.image_urls[0]}" alt="image">
                            <div>
                                <div class="m-2">
                                    <span class="product-name">${product.name}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="text-uppercase">
                        <span class="product-brand">${product.revenue}</span>
                    </td>
                    <td>${product.total_sold_quantity}</td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            hideLoading();
            showAlert('error', 'Error', 'Failed to fetch data');
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

    // Event listeners for top products time range buttons
    document.getElementById('dayButtonProduct').addEventListener('click', function () {
        updateTopProducts('day');
    });

    document.getElementById('weekButtonProduct').addEventListener('click', function () {
        updateTopProducts('week');
    });

    document.getElementById('monthButtonProduct').addEventListener('click', function () {
        updateTopProducts('month');
    });

    document.getElementById('yearButtonProduct').addEventListener('click', function () {
        updateTopProducts('year');
    });

    // Initial chart update
    updateChartData('day');

    // Initial top products update
    updateTopProducts('day');
});