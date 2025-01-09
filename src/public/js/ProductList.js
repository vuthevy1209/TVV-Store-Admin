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
    async function loadProducts(page, limit = 10) {
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
                <td>${product.price}</td>
                <td class="text-uppercase">
                    <span class="product-brand">${product.brand.name}</span>
                </td>
                <td>${product.inventory_quantity}</td>
                <td>
                    <div class="d-flex align-items-center justify-content-center list-action">
                        <div class="button button-view mr-2">
                            <i class="fa-solid fa-eye"></i>
                        </div>
                        <a class="button button-edit mr-2" href="/products/edit/${product.id}" style="text-decoration: none;">
                            <i class="fa-solid fa-pen"></i>
                        </a>
                        <button type="button" class="button button-delete mr-2" data-bs-toggle="modal" data-bs-target="#deleteModal-${product.id}">
                            <i class="fa-solid fa-x"></i>
                        </button>
                    </div>
                </td>
            </tr>

            <!-- Modal -->
            <div class="modal" id="deleteModal-${product.id}" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="deleteModalLabel">Confirm Delete</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to delete this product?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Close
                            </button>
                            <button type="button" class="btn btn-dark button-delete-modal" data-id="${product.id}">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Function to update the pagination UI
    function updatePagination(pagination) {
        const paginationElement = document.querySelector('.pagination');
        if (!paginationElement) return;

        paginationElement.innerHTML = `
            ${pagination.pages.map(page => `
                <li class="page-item ${page.active ? 'active' : ''}">
                    <button class="page-link" data-page="${page.number}">${page.number}</button>
                </li>
            `).join('')}
        `;
    }

    // Handle delete button click event
    document.querySelectorAll('.button-delete-modal').forEach(button => {
        button.addEventListener('click', async function () {
            // Get the product ID from data-id
            const productId = this.getAttribute('data-id');
            console.log("Product ID: ", productId);

            try {
                // Send DELETE request to the server
                const response = await fetch(`/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const currentPage = document.querySelector('.pagination .active')?.querySelector('.page-link')?.dataset.page || 1;
                    showAlert('success', 'Success', 'Product deleted successfully!');
                    await loadProducts(currentPage);
                } else {
                    const result = await response.json();
                    showAlert('error', 'Error', result.message || 'Failed to delete product');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    });
});
