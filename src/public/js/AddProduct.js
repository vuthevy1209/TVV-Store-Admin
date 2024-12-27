


document.addEventListener('DOMContentLoaded', function() {
    const mainPreview = document.querySelector('.main-image-preview');
    const thumbnailStrip = document.querySelector('.thumbnail-strip');
    const fileInput = document.querySelector('.hidden-file-input');

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageId = Date.now().toString();
                    addThumbnail(e.target.result, imageId);
                    if (!mainPreview.querySelector('img')) {
                        updateMainPreview(e.target.result);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // Handle thumbnail clicks
    thumbnailStrip.addEventListener('click', function(e) {
        const thumbnail = e.target.closest('.thumbnail-wrapper');
        if (thumbnail) {
            const img = thumbnail.querySelector('img');
            if (img) {
                updateMainPreview(img.src);
                // Update selected state
                document.querySelectorAll('.thumbnail-wrapper').forEach(t => t.classList.remove('selected-main'));
                thumbnail.classList.add('selected-main');
            }
        }
    });

    // Handle image removal
    thumbnailStrip.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.remove-image');
        if (removeBtn) {
            e.stopPropagation();
            const thumbnail = removeBtn.closest('.thumbnail-wrapper');
            const imageId = thumbnail.dataset.imageId;
            thumbnail.remove();

            // Update main preview if needed
            if (thumbnail.classList.contains('selected-main')) {
                const firstThumbnail = document.querySelector('.thumbnail-wrapper img');
                if (firstThumbnail) {
                    updateMainPreview(firstThumbnail.src);
                    firstThumbnail.closest('.thumbnail-wrapper').classList.add('selected-main');
                } else {
                    clearMainPreview();
                }
            }
        }
    });

    function updateMainPreview(src) {
        mainPreview.innerHTML = `<img src="${src}" alt="Main preview" class="main-preview-img">`;
    }

    function clearMainPreview() {
        mainPreview.innerHTML = `
            <div class="upload-placeholder">
                <i class="upload-icon"></i>
            </div>`;
    }

    function addThumbnail(src, imageId) {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail-wrapper';
        thumbnail.dataset.imageId = imageId;
        thumbnail.innerHTML = `
            <img src="${src}" alt="thumbnail" class="thumbnail-img">
            <button type="button" class="remove-image" data-image-id="${imageId}">
                <i class="fas fa-times"></i>
            </button>`;
        thumbnailStrip.insertBefore(thumbnail, thumbnailStrip.lastElementChild);
    }

    const form = document.getElementById("productForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Ngăn hành vi mặc định của form

        const formData = new FormData(form);

        const body = {};

        for (let [key, value] of formData.entries()) {
            if (key !== 'image_urls') {
                body[key] = value;
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

        const imageList = Array.from(document.querySelectorAll('.thumbnail-wrapper img')).map(img => img.src);

        body.image_urls = [];
        for (let image of imageList) {
            try {
                const url = await uploadFile(image);
                if (url) {
                    body.image_urls.push(url);
                }
            } catch (error) {
                console.error("Error uploading image", error);
            }
        }


        console.log(body);
        try {
            const response = await fetch("/products/store", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product: body,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                alert("Product added successfully!");
                console.log(result);
                form.reset();
            } else {
                const error = await response.json();
                alert("Error adding product: " + error.message);
            }
        } catch (err) {
            console.error("Error:", err);
            alert("An unexpected error occurred!");
        }
    });
});