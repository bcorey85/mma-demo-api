const express = require('express');
const router = new express.Router();
const adminAuth = require('../../middleware/adminAuth');
const {
	adminLogin,
	getUserList,
	getUserById,
	updateUser,
	deleteUser,
	sendEmail
} = require('../../controllers/admin/admin');

//Login admin
router.post('/admin/login', adminLogin);

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
