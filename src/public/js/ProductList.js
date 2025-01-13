document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    // category_id, brand_id, price_min, price_max, sort_by_creation, sort_by_price, name, page, limit
    const category = urlParams.get('category_id');
    const brand = urlParams.get('brand_id');
    const priceMin = urlParams.get('price_min');
    const priceMax = urlParams.get('price_max');
    const sortCreation = urlParams.get('sort_by_creation');
    const sortPrice = urlParams.get('sort_by_price');
    const name = urlParams.get('name');

    const categorySelect = document.getElementById('category-select');
    const brandSelect = document.getElementById('brand-select');
    const priceMinInput = document.querySelector('input[name="price_min"]');
    const priceMaxInput = document.querySelector('input[name="price_max"]');
    const sortCreationSelect = document.getElementById('sort-by-creation');
    const sortPriceSelect = document.getElementById('sort-by-price');
    const nameInput = document.querySelector('input[name="name"]');

    if (category && categorySelect) {
        categorySelect.value = category;
    }

    if (brand && brandSelect) {
        brandSelect.value = brand;
    }

    if (priceMin && priceMinInput) {
        priceMinInput.value = priceMin;
    }

    if (priceMax && priceMaxInput) {
        priceMaxInput.value = priceMax;
    }

    if (sortCreation && sortCreationSelect) {
        sortCreationSelect.value = sortCreation;
    }

    if (sortPrice && sortPriceSelect) {
        sortPriceSelect.value = sortPrice;
    }

    if (name && nameInput) {
        nameInput.value = name;
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
                    window.history.pushState({}, '', `/products?${queryParams.toString()}`);
                    await loadProducts(queryParams);
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
            window.history.pushState({}, '', `/products?${queryParams.toString()}`);
            await loadProducts(queryParams);
        });
    }

    // Function to load products
    async function loadProducts(queryParams) {
        try {
            showLoading();
            const response = await fetch(`/products?${queryParams.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                },
                method: 'GET',
            });
            if (response.ok) {
                const { productList, pagination } = await response.json();
                hideLoading();
                updateProductTable(productList);
                updatePagination(pagination);
            } else {
                hideLoading();
                showAlert('error', 'Error', 'Failed to load products');
            }
        } catch (error) {
            hideLoading();
            console.error('Error:', error);
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
                <!-- Modal Delete -->
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
                                <button type="button" class="btn btn-dark button-delete-modal" data-id="${product.id}" data-bs-dismiss="modal">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </tr>
        `).join('');
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

    // Handle delete button click event
    document.querySelectorAll('.button-delete-modal').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            showLoading();

            // Get the product ID from data-id
            const productId = button.getAttribute('data-id');
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
                    hideLoading();
                    showAlert('success', 'Success', 'Product deleted successfully!');
                    await loadProducts(new URLSearchParams(window.location.search));
                } else {
                    const result = await response.json();
                    hideLoading();
                    showAlert('error', 'Error', result.message || 'Failed to delete product');
                }
            } catch (error) {
                hideLoading();
                console.error('Error:', error);
            }
        });
    });
});