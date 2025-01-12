const userService = require('../service/user.service');

class UserController {
    // [POST] /users/update-profile
    async updateProfile(req, res) {
        const { firstName, lastName } = req.body;
        const userId = req.user.id;

        try {
            var avatarUrl = null;
            if(req.file) {
                avatarUrl = await userService.uploadAvatar(req.file);
                await userService.updateUserProfileWithAvatar(userId, firstName, lastName, avatarUrl);
            }
            else {
                await userService.updateUserProfile(userId, firstName, lastName);
            }

            res.status(200).json({ message: 'Profile updated successfully', avatar_url: avatarUrl });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'An error occurred while updating the profile' });
        }
    }

    // [GET] /users/profile
    async getProfile(req, res) {
        try {
            const user = await userService.findById(req.user.id);
            return res.json({
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                avatarUrl: user.avatar_url,
                email: user.email,
            });
        } catch (error) {
            console.error('Error getting profile:', error);
            res.status(500).json({ message: 'An error occurred while getting the profile' });
        }
    }

    // [GET] /users
    async getAllUser(req, res) {
        try {
            const users = await userService.getAll();
            res.render('page/user/UserList', { userList: users });
        } catch (error) {
            console.error('Error getting all users:', error);
            res.status(500).json({ message: 'An error occurred while getting all users' });
        }
    }

    // [GET] /users/blocked
    async getBlockedUsers(req, res) {
        try {
            const users = await userService.getBlockedUsers();
            res.render('page/user/BlockedUserList', { userList: users });
        } catch (error) {
            console.error('Error getting blocked users:', error);
            res.status(500).json({ message: 'An error occurred while getting blocked users' });
        }
    }

    // [POST] /users/block/:id
    async blockUser(req, res) {
        try {
            const { id } = req.params;
            await userService.blockUser(id);
            res.status(200).json({ message: 'User blocked successfully' });
        } catch (error) {
            res.status(500).json({ message: 'An error occurred while blocking user' });
        }
    }

    // [POST] /users/unblock/:id
    async unblockUser(req, res) {
        try {
            const { id } = req.params;
            await userService.unblockUser(id);
            res.status(200).json({ message: 'User unblocked successfully' });
        } catch (error) {
            res.status(500).json({ message: 'An error occurred while unblocking user' });
        }
    }
}


module.exports = new UserController();