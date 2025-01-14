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

            // Update preview table data
            const previewTableBody = document.getElementById('previewTableBody');
            previewTableBody.innerHTML = ''; // Clear existing rows

            newLabels.forEach((label, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${label}</td>
                    <td>${newData[index]}</td>
                `;
                previewTableBody.appendChild(row);
            });
        } catch (error) {
            hideLoading();
            showAlert('error', 'Error', 'Failed to fetch data');
        }
    }

    // Function to update the top products table based on the selected time range
    async function updateTopProducts(timeRange) {
        try {
            showLoading();
            const response = await fetch(`/dashboard/top-products?timeRange=${timeRange}`);
            const data = await response.json();
            const productList = data.productList || [];

            hideLoading();

            const tableBody = document.querySelector('.tbl-server-info tbody');
            tableBody.innerHTML = ''; // Clear existing rows

            productList.forEach(product => {
                const row = document.createElement('tr');
                row.classList.add('text-center');

                row.innerHTML = `
                    <td>
                        <div class="checkbox d-inline-block">
                            <input type="checkbox" class="checkbox-input" id="checkbox${product.productId}">
                            <label for="checkbox${product.productId}" class="mb-0"></label>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${product.image}" alt="image">
                            <div>
                                <div class="m-2">
                                    <span class="product-name">${product.name}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="text-uppercase">
                        <span class="product-brand">${product.totalRevenue}</span>
                    </td>
                    <td>${product.totalQuantity}</td>
                `;

                tableBody.appendChild(row);
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

    // Event listener for preview button
    document.getElementById('previewButton').addEventListener('click', function () {
        $('#previewDialog').modal('show');
    });

    // Event listener for close button in preview dialog
    document.querySelector('#previewDialog .btn-close').addEventListener('click', function () {
        $('#previewDialog').modal('hide');
    });

    // Initial chart update
    updateChartData('day');

    // Initial top products update
    updateTopProducts('day');
});