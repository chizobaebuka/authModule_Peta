import express from 'express';
import { 
    registerUser, 
    verifyUser, 
    getAllUsers, 
    updateUserProfile, 
    deleteUser,
    loginUser, 
} from '../controllers/authCtrl.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify', verifyUser);
router.post('/login', loginUser);
router.get('/all-users', authMiddleware, getAllUsers);  
router.put('/update-profile', authMiddleware, updateUserProfile);  
router.delete('/delete', authMiddleware, deleteUser);
router.get('/profile', authMiddleware, (req, res) => {
    const user = req.user;
    res.json({ message: `Welcome, ${user.name}!`, user: user });
});

export default router;
