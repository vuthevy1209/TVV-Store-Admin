// ProductList.js
document.addEventListener('DOMContentLoaded', function() {
    // Handle pagination clicks
    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) {
        paginationContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = e.target.dataset.page;
                if (page) {
                    await loadProducts(page);
                }
            }
        });
    }

    // Function to load products
    async function loadProducts(page, limit = 3) {
        try {
            const response = await fetch(`/products?page=${page}&limit=${limit}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            updateProductTable(data.productList);
            updatePagination(data.pagination);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    // Function to update the product table
    function updateProductTable(products) {
        const tbody = document.querySelector('.data-tables tbody');
        if (!tbody) return;

        tbody.innerHTML = products.map(product => `
            <tr class="text-center">
                <td>
                    <div class="checkbox d-inline-block">
                        <input type="checkbox" class="checkbox-input" id="checkbox2">
                        <label for="checkbox2" class="mb-0"></label>
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
                <td>
                    <span class="product-category">${product.category.name}</span>
                </td>
                <td>$${product.price}</td>
                <td class="text-uppercase">
                    <span class="product-brand">${product.brand.name}</span>
                </td>
                <td>${product.inventory_quantity}</td>
                <td>
                    <div class="d-flex align-items-center justify-content-center list-action">
                        <a class="badge badge-info mr-2" data-toggle="tooltip" data-placement="top" title="View" href="#">
                            <i class="fa-solid fa-eye"></i>
                        </a>
                        <a class="badge bg-success mr-2" data-toggle="tooltip" data-placement="top" title="Edit" href="#">
                            <i class="fa-solid fa-pen"></i>
                        </a>
                        <a class="badge bg-warning mr-2" data-toggle="tooltip" data-placement="top" title="Delete" href="#">
                            <i class="fa-solid fa-x"></i>
                        </a>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Function to update the pagination UI
    function updatePagination(pagination) {
        const paginationElement = document.querySelector('.pagination');
        if (!paginationElement) return;

        paginationElement.innerHTML = `
            <li class="page-item ${!pagination.hasPrev ? 'disabled' : ''}">
                <button class="page-link" data-page="${pagination.prevPage}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </button>
            </li>
            ${pagination.pages.map(page => `
                <li class="page-item ${page.active ? 'active' : ''}">
                    <button class="page-link" data-page="${page.number}">${page.number}</button>
                </li>
            `).join('')}
            <li class="page-item ${!pagination.hasNext ? 'disabled' : ''}">
                <button class="page-link" data-page="${pagination.nextPage}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </button>
            </li>
        `;
    }
});