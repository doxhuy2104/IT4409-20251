import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
	api_key: process.env.CLOUDINARY_API_KEY!,
	api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const storage = new CloudinaryStorage({
	cloudinary,
	params: async (req, file) => {
		return {
			folder: 'uploads',
			format: file.mimetype.split('/')[1],
			public_id: `${Date.now()}-${file.originalname
				.replace(/\.[^/.]+$/, '')
				.replace(/[^a-zA-Z0-9-_]/g, '')}`,
			transformation: [{ width: 800, height: 800, crop: 'limit' }],
		};
	},
});

const upload = multer({ storage });

export { cloudinary, upload };
