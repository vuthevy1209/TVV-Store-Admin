document.addEventListener('DOMContentLoaded', function initialize () {
    const params = new URLSearchParams(window.location.search);

    const categorySelect = document.getElementById("category-select");
    if (categorySelect) {
        categorySelect.value = params.get("category_id") || "";
    }

    const brandSelect = document.getElementById("brand-select");
    if (brandSelect) {
        brandSelect.value = params.get("brand_id") || "";
    }

    const priceMinInput = document.querySelector('input[name="price_min"]');
    if (priceMinInput) {
        priceMinInput.value = params.get("price_min") || "";
    }

    const priceMaxInput = document.querySelector('input[name="price_max"]');
    if (priceMaxInput) {
        priceMaxInput.value = params.get("price_max") || "";
    }

    const sortCreationSelect = document.getElementById("sort-select-creation");
    if (sortCreationSelect) {
        sortCreationSelect.value = params.get("sort_by_creation") || "DESC";
    }

    const sortPriceSelect = document.getElementById("sort-select-price");
    if (sortPriceSelect) {
        sortPriceSelect.value = params.get("sort_by_price") || "DESC";
    }

    const searchInput = document.querySelector('input[name="name"]');
    if (searchInput) {
        searchInput.value = params.get("name") || "";
    }

    const businessStatusSelect = document.getElementById("business-status-select");
    if (businessStatusSelect) {
        const status = params.get("business_status");
        businessStatusSelect.value = status === 'true' ? 'true' : status === 'false' ? 'false' : "";
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
                const {productList, pagination} = await response.json();
                hideLoading();
                updateProductTable(productList);
                updatePagination(pagination);
                reloadDeleteButtons();
                reloadUnlockButtons();
            } else {
                hideLoading();
                showAlert('error', 'Error', 'Failed to load products');
            }
        } catch (error) {
            hideLoading();
            console.error('Error:', error);
        }
    }

    const formatCurrency = (value, locale = 'en-US', currency = 'USD') => {
        if (typeof value !== 'number') {
            return value; // Return unformatted value if it's not a number
        }
        // Use Math.round to remove the fractional part
        const integerValue = Math.round(value);
        // Format with Intl.NumberFormat
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 0, // No decimal places
            maximumFractionDigits: 0, // No decimal places
        }).format(integerValue);
    };

    const formatNumber = (value) => {
        if (typeof value !== 'number') {
            return value; // Return unformatted value if it's not a number
        }
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };


    function updateProductTable(products) {
        const productTable = document.querySelector('.product-table');
        if (!productTable) return;

        const tbodyContent = products.map(product => `
        <tr class="text-center">
            <td>
                <div class="d-flex align-items-center">
                    <img style="margin-left: 20px" src="${product.image_urls[0]}" alt="image">
                    <div style="margin-left: 40px">
                        <div class="m-2">
                            <span class="product-name">${product.name}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <span class="product-category">${product.category.name}</span>
            </td>
            <td>${formatCurrency(product.price)}</td>
            <td class="text-uppercase">
                <span class="product-brand">${product.brand.name}</span>
            </td>
            <td>${product.inventory_quantity}</td>
            
            <td>
                <div class="d-flex align-items-center justify-content-center list-action">
                    <a class="button button-edit mr-2" href="/products/edit/${product.id}" style="text-decoration: none;">
                        <i class="fa-solid fa-pen"></i>
                    </a>
                    ${product.business_status ? `
                        <button type="button" class="button button-delete mr-2" data-bs-toggle="modal" data-bs-target="#deleteModal-${product.id}">
                            <i class="fa-solid fa-lock"></i>
                        </button>
                    ` : `
                        <button type="button" class="button button-unlock mr-2" data-bs-toggle="modal" data-bs-target="#unlockModal-${product.id}">
                            <i class="fa-solid fa-unlock"></i>
                        </button>
                    `}
                </div>
            </td>
            <!-- Modal Delete -->
            <div class="modal" id="deleteModal-${product.id}" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="deleteModalLabel">Confirm Suspend</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to suspend this product?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-dark button-delete-modal" data-id="${product.id}" data-bs-dismiss="modal">Suspend</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Unlock -->
            <div class="modal" id="unlockModal-${product.id}" tabindex="-1" aria-labelledby="unlockModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="unlockModalLabel">Confirm Unlock</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to unlock this product?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-dark button-unlock-modal" data-id="${product.id}" data-bs-dismiss="modal">Unlock</button>
                        </div>
                    </div>
                </div>
            </div>
        </tr>
    `).join('\n');

        productTable.innerHTML = `
        <table class="data-tables table mb-0 tbl-server-info">
            <thead class="text-uppercase text-center">
                <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Brand Name</th>
                    <th>Quantity</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${tbodyContent}
            </tbody>
        </table>
    `;
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



    // Handle ban button click event
    function reloadDeleteButtons(){
        const getDeleteButtons = () => document.querySelectorAll('.button-delete-modal');
        const deleteButtons =  getDeleteButtons();
        console.log(deleteButtons);
        deleteButtons.forEach(button => {
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
                        showAlert('success', 'Success', 'Product suspended successfully!');
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
    }




    function reloadUnlockButtons(){

        const getUnlockButtons = () => document.querySelectorAll('.button-unlock-modal');
        const unlockButtons =  getUnlockButtons();
        console.log(unlockButtons);

        // Handle unlock button click event
        unlockButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                showLoading();

                // Get the product ID from data-id
                const productId = button.getAttribute('data-id');
                console.log("Product ID: ", productId);

                try {
                    // Send PUT request to the server to unlock the product
                    const response = await fetch(`/products/${productId}/unlock`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const currentPage = document.querySelector('.pagination .active')?.querySelector('.page-link')?.dataset.page || 1;
                        hideLoading();
                        showAlert('success', 'Success', 'Product unsuspended successfully!');
                        await loadProducts(new URLSearchParams(window.location.search));
                    } else {
                        const result = await response.json();
                        hideLoading();
                        showAlert('error', 'Error', result.message || 'Failed to unlock product');
                    }
                } catch (error) {
                    hideLoading();
                    console.error('Error:', error);
                }
            });
        });
    }

    reloadUnlockButtons();
    reloadDeleteButtons();

});