const express = require('express');
const router = express.Router();

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/upload', async (req, res) => {
    try {
        const { data } = req.body;

        const uploadResponse = await cloudinary.uploader.upload(data, {
            folder: 'TVV_Store',
        });

        res.json({ msg: 'Image uploaded successfully', url: uploadResponse.secure_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ err: 'Something went wrong' });
    }
});


module.exports = router;