const express = require('express');
const router = new express.Router();
const adminAuth = require('../../middleware/adminAuth');
const {
	adminLogin,
	adminLogout,
	getUserList,
	getUserById,
	updateUser,
	deleteUser,
	sendEmail
} = require('../../controllers/admin/adminControllers');

//Login admin
router.post('/admin/login', adminLogin);

//Logout Admin
router.post('/admin/logout', adminAuth, adminLogout);

// Get list of users
router.get('/admin/user/', adminAuth, getUserList);

// Get single user by id
router.get('/admin/user/:userID', adminAuth, getUserById);

// Update user
router.put('/admin/user/:userID', adminAuth, updateUser);

// Delete user
router.delete('/admin/user/:userID', adminAuth, deleteUser);

// Send email
router.post('/admin/user/sendemail', adminAuth, sendEmail);

module.exports = router;
