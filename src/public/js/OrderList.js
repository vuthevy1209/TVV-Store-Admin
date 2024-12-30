document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderStatus = urlParams.get('orderStatus');
    const categorySelect = document.getElementById('category-select');
    const sortSelect = document.getElementById('sort-select');

    if (orderStatus && categorySelect) {
        categorySelect.value = orderStatus;
    }

    if (sortSelect) {
        const sort = urlParams.get('sort');
        if (sort) {
            sortSelect.value = sort;
        }
    }
    // Handle pagination clicks
    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) {
        paginationContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = e.target.dataset.page;
                if (page) {
                    const queryParams = new URLSearchParams(window.location.search);
                    queryParams.set('page', page);
                    window.history.pushState({}, '', `/orders?${queryParams.toString()}`);
                    await loadOrders(queryParams);
                }
            }
        });
    }

    // Handle search form submission
    const searchForm = document.querySelector('form');
    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(searchForm);
            const queryParams = new URLSearchParams(formData);
            window.history.pushState({}, '', `/orders?${queryParams.toString()}`);
            await loadOrders(queryParams);
        });
    }

    // Function to load orders
    async function loadOrders(queryParams) {
        try {
            const response = await fetch(`/orders?${queryParams.toString()}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            updateOrderTable(data.orders);
            updatePagination(data.pagination);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    // Function to update the order table
    function updateOrderTable(orders) {
        const tbody = document.querySelector('.data-tables tbody');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => {
            let statusHtml;
            if (order.status === 2) {
                statusHtml = `<span class="order-status-paid">${order.statusName}</span>`;
            } else if (order.status === 4) {
                statusHtml = `<span class="order-status-pending">${order.statusName}</span>`;
            } else {
                statusHtml = `<span class="product-brand">${order.statusName}</span>`;
            }

            return `
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
                        <span>${order.created_at}</span>
                    </td>
                    <td class="text-uppercase">
                        ${statusHtml}
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
                            <button type="button" class="button button-delete mr-2" data-bs-toggle="modal"
                                        data-bs-target="#deleteModal">
                                        <i class="fa-solid fa-x"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Function to update the pagination UI
    function updatePagination(pagination) {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = ''; // Clear existing pagination
        if (pagination.currentPage > 1) {
            paginationContainer.insertAdjacentHTML(
                'beforeend',
                `<li class="page-item"><a class="page-link" href="#" data-page="${pagination.currentPage - 1}">&laquo;</a></li>`
            );
        }

        pagination.pages.forEach(page => {
            paginationContainer.insertAdjacentHTML(
                'beforeend',
                `<li class="page-item ${page.active ? 'active' : ''}"><a class="page-link" href="#" data-page="${page.number}">${page.number}</a></li>`
            );
        });

        if (pagination.currentPage < pagination.totalPages) {
            paginationContainer.insertAdjacentHTML(
                'beforeend',
                `<li class="page-item"><a class="page-link" href="#" data-page="${pagination.currentPage + 1}">&raquo;</a></li>`
            );
        }
    }

});
