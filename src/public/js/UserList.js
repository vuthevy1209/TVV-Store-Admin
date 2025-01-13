document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const email = urlParams.get('email');
    const sort = urlParams.get('sort');

    const usernameInput = document.querySelector('input[name="username"]');
    const emailInput = document.querySelector('input[name="email"]');

    if (username && usernameInput) {
        usernameInput.value = username;
    }
    if (email && emailInput) {
        emailInput.value = email;
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
                    window.history.pushState({}, '', `/users?${queryParams.toString()}`);
                    await loadUsers(queryParams);
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
            window.history.pushState({}, '', `/users?${queryParams.toString()}`);
            await loadUsers(queryParams);
        });
    }

    // Handle sorting
    document.querySelectorAll('.sort-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const sort = button.getAttribute('data-sort');
            const order = button.getAttribute('data-order');
            const queryParams = new URLSearchParams(window.location.search);
            queryParams.set('sort', `${sort}:${order}`);
            window.history.pushState({}, '', `/users?${queryParams.toString()}`);
            await loadUsers(queryParams);
        });
    });

    // Function to load users
    async function loadUsers(queryParams) {
        try {
            showLoading();
            const response = await fetch(`/users?${queryParams.toString()}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                hideLoading();
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            updateUserTable(data.users);
            updatePagination(data.pagination);
            hideLoading();
        } catch (error) {
            hideLoading();
            showAlert('error', 'Error', error.message);
        }
    }

    // Function to update the user table
    function updateUserTable(users) {
        const tbody = document.querySelector('.data-tables tbody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => {
            return `
                <tr class="text-center">
                    <td>
                        <div class="checkbox d-inline-block">
                            <input type="checkbox" class="checkbox-input" id="checkbox2">
                            <label for="checkbox2" class="mb-0"></label>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${user.avatar_url || '/images/avatar_place_holder.jpg'}" alt="image" class="avatar">
                            <div>
                                ${user.username}
                            </div>
                        </div>
                    </td>
                    <td>
                        ${user.first_name} ${user.last_name}
                    </td>
                    <td>
                        ${user.email}
                    </td>
                    <td>
                        ${user.role.name}
                    </td>
                    <td>
                        ${user.formatted_created_at}
                    </td>
                    <td>
                        ${user.isCurrentUser ? '' : `
                        <button class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#deleteModal-${user.id}">
                            <i class="fa-solid fa-trash"></i> BAN
                        </button>`}
                    </td>
                </tr>

                <!-- Modal Delete -->
                <div class="modal" id="deleteModal-${user.id}" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="deleteModalLabel">Confirm Ban</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>Are you sure you want to ban this user?</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    Close
                                </button>
                                <button type="button" class="btn btn-dark button-delete-modal" data-id="${user.id}" data-bs-dismiss="modal">
                                    Ban
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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

    // Handle delete modal functionality
    document.querySelectorAll('.button-delete-modal').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            showLoading();
            const userId = button.getAttribute('data-id');

            try {
                const response = await fetch(`/users/block/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    hideLoading();
                    showAlert('success', 'Success', 'User blocked successfully');
                    window.location.reload();
                } else {
                    const result = await response.json();
                    hideLoading();
                    showAlert('error', 'Error', result.message || 'Failed to block user');
                }
            } catch (error) {
                hideLoading();
                showAlert('error', 'Error', 'Failed to block user');
            }
        });
    });
});