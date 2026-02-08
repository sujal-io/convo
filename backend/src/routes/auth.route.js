import express from 'express';
import { signup , login , logout, updateProfile} from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { arcjetProtection } from '../middlewares/arcjet.middleware.js';
import multer from 'multer';

// Store file in memory so we can upload buffer directly to Cloudinary
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

// router.get("/test",arcjetProtection, (req,res) => res.status(200).json({message: "Test"}));

router.use(arcjetProtection);

router.post('/signup', signup);

router.post('/login', login);

router.post("/logout",logout);

router.put("/update-profile", protectRoute, upload.single('profilePic'), updateProfile);

router.get("/check",protectRoute, (req,res) => res.status(200).json(req.user));

export default router; 