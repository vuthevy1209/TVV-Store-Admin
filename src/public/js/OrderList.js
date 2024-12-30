document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.page-link').forEach(button => {
        button.addEventListener('click', async function() {
            const page = this.dataset.page;

            const queryString = new URLSearchParams({ page }).toString();
            window.history.pushState({}, '', `/orders?${queryString}`);


            try {
                const response = await fetch(url.toString(), {
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                updateOrderTable(data.orders);
                updatePagination(data.currentPage, data.totalPages);
            } catch (error) {
                console.error('Error loading orders:', error);
            }
        });
    });

    function updateOrderTable(orders) {
        const tbody = document.querySelector('.data-tables tbody');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => `
            <tr class="text-center">
                <td>
                    <div class="checkbox d-inline-block">
                        <input type="checkbox" class="checkbox-input" id="checkbox2">
                        <label for="checkbox2" class="mb-0"></label>
                    </div>
                </td>
                <td>${order.id}</td>
                <td>${order.customer.username}</td>
                <td class="text-uppercase">
                    <span class="product-brand">${order.created_at}</span>
                </td>
                <td class="text-uppercase">
                    <span class="product-brand">${order.statusName}</span>
                </td>
                <td class="text-uppercase">
                    ${order.status === 2 ? `<span class="order-status-paid">${order.paymentDetails.status}</span>` : '<span class="order-status-pending">Pending</span>'}
                </td>
                <td>$${order.total_price}</td>
                <td>
                    <div class="d-flex align-items-center justify-content-center list-action">
                        <div class="button button-view mr-2">
                            <i class="fa-solid fa-eye" href="/orders/${order.id}"></i>
                        </div>
                        <a class="button button-edit mr-2" href="/orders/edit/${order.id}" style="text-decoration: none;">
                            <i class="fa-solid fa-pen"></i>
                        </a>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Function to update the pagination UI
    function updatePagination(currentPage, totalPages) {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = ''; // Clear existing pagination
        if (currentPage > 1) {
            paginationContainer.insertAdjacentHTML(
                'beforeend',
                `<li class="page-item"><a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a></li>`
            );
        }
        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.insertAdjacentHTML(
                'beforeend',
                `<li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>`
            );
        }
        if (currentPage < totalPages) {
            paginationContainer.insertAdjacentHTML(
                'beforeend',
                `<li class="page-item"><a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a></li>`
            );
        }
    }
});
