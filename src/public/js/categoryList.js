function previewLogo(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('logo-preview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function previewLogoEdit(event, id) {
    const file = event.target.files[0];
    const preview = document.getElementById(`logo-preview-edit-${id}`);

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

const uploadFile = async (image) => {
    try {
        const response = await fetch("/cloudinary/upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: image }),
        });

        if (response.ok) {
            const result = await response.json();
            return result.url;
        } else {
            console.error("Upload failed", response.status, await response.text());
            return null;
        }
    } catch (error) {
        console.error("Error uploading file", error);
        return null;
    }
};

// add category
const saveBtn = document.querySelector('#btn-save-category');

saveBtn.addEventListener('click', async (e) => {
    showLoading();

    e.preventDefault();
    const categoryName = document.querySelector('#category-name').value;
    const description = document.querySelector('#description').value;
    const logo = document.querySelector('#logo-preview').src;

    if (!categoryName || !description || !logo) {
        alert('Please fill all fields');
        return;
    }

    const imageUrl = await uploadFile(logo);

    const newCategory = {
        name: categoryName,
        description: description,
        logo: imageUrl
    };

    const response = await fetch('/categories/store', {
        method: 'POST',
        body: JSON.stringify(newCategory),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const result = await response.json();
        hideLoading();
        window.location.reload();
        showAlert('success', 'Success', 'Category saved successfully');
    } else {
        hideLoading();
        showAlert('error', 'Error', 'Failed to save category');
    }
});

const updateUIwithEditCategory = (category) => {
    const categoryCard = document.getElementById(`category-${category.id}`);
    if (!categoryCard) {
        console.error('Category card not found');
        return;
    }

    categoryCard.querySelector('.card-img-top').src = category.logo;
    categoryCard.querySelector('.card-text').textContent = category.name;
};

// edit category
document.querySelectorAll('.button-edit-category').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        showLoading();

        const categoryId = button.getAttribute('data-id');
        const image = document.querySelector(`#logo-preview-edit-${categoryId}`).src;
        const imageUrl = await uploadFile(image);

        const data = {
            id: categoryId,
            name: document.querySelector(`#category-name-${categoryId}`).value,
            desc: document.querySelector(`#description-edit-${categoryId}`).value,
            logo: imageUrl
        };

        console.log(data);

        try {
            const response = await fetch(`/categories/update`, {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                showAlert('success', 'Success', 'Category updated successfully');
                hideLoading();
                const result = await response.json();
                console.log(result);
                updateUIwithEditCategory(result.data);

            } else {
                showAlert('error', 'Error', 'Failed to update category');
                hideLoading();
            }
        } catch (error) {
            console.error('Error:', error);
            hideLoading();
        }
    });
});

// delete category
document.querySelectorAll('.button-delete-modal').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        showLoading();
        const categoryId = button.getAttribute('data-id');

        try {
            const response = await fetch(`/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                hideLoading();
                showAlert('success', 'Success', 'Category deleted successfully!');
                const categoryCard = document.getElementById(`category-${categoryId}`);
                categoryCard.remove();
            } else {
                const result = await response.json();
                hideLoading();
                showAlert('error', 'Error', result.message || 'Failed to delete category');
            }
        } catch (error) {
            hideLoading();
            console.error('Error:', error);
        }
    });
});