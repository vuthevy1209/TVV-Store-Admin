const bcrypt = require('bcrypt');
const User = require('../model/user');
const Role = require('../model/role');
const { sequelize } = require('../../../config/database'); // Adjust the path to your database configuration
const cloudinary = require('../../../config/cloudinary');
const { Op } = require('sequelize');
const moment = require('moment');

class UserServices {
    // find user by username
    async findByUsername(username) {
        try {
            return await User.findOne({where: {username}});
        } catch (error) {
            return {error: error.message};
        }
    }

    // compare password
    async validatePassword(inputPassword, storedPassword) {
        try {
            return await bcrypt.compare(inputPassword, storedPassword);
        } catch (error) {
            return {error: error.message};
        }
    }

    // create a new user
    async createUser(userData) {
        try {
            const {username, password, email, firstName, lastName} = userData;

            // Check if username is already taken
            const existingUserByUsername = await User.findOne({where: {username}});
            if (existingUserByUsername) {
                throw new Error('Username is already taken');
            }

            // Check if email is already taken
            const existingUserByEmail = await User.findOne({where: {email}});
            if (existingUserByEmail) {
                throw new Error('Email is already taken');
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const user = await User.create({
                username,
                email,
                password: hashedPassword,
                first_name: firstName,
                last_name: lastName,
            });

            return {user};
        } catch (error) {
            // return { error: error.message };
            throw new Error(error.message);
        }

    }

    // find user by id
    async findById(id) {
        try {
            const user = await User.findByPk(id, {
                include: [{ model: Role, as: 'role' }]
            });
            if (!user) {
                throw new Error('User not found');
            }
            return {
                ...user.get({ plain: true }),
                formatted_created_at: moment(user.created_at).format('YYYY-MM-DD HH:mm:ss')
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }


    // change password
    async changePassword(id, oldPassword, newPassword) {
        try {
            return await sequelize.transaction(async (transaction) => {
                const user = await this.findById(id);
                if (!user) {
                    throw new Error('User not found');
                }

                const isMatch = await bcrypt.compare(oldPassword, user.password);
                if (!isMatch) {
                    throw new Error('Old password is incorrect');
                }

                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
                return await user.update({ password: hashedPassword }, { transaction });
            });
        } catch (error) {
            return {error: error.message};
        }
    }

    // update user password
    async updateUserPassword(userId, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.update({password: hashedPassword}, {where: {id: userId}});
        }
        catch(error) {
            console.log(error);
            throw new Error('Error updating password');
        }

    };


    // update user profile
    async uploadAvatar(file) {
        if (!file) return null;

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'TVV_Store' }, (error, result) => {
                if (error) {
                    console.error('Error uploading image:', error);
                    return reject('Failed to upload image');
                }
                resolve(result.secure_url);
            });

            uploadStream.end(file.buffer);
        });
    }

    async updateUserProfileWithAvatar(userId, firstName, lastName, avatarUrl) {
        await User.update(
            {
                first_name: firstName,
                last_name: lastName,
                avatar_url: avatarUrl,
            },
            {
                where: { id: userId },
            }
        );
    }

    async updateUserProfile(userId, firstName, lastName) {
        await User.update(
            {
                first_name: firstName,
                last_name: lastName,
            },
            {
                where: { id: userId },
            }
        );
    }

    // find admin by username
    async findAdminByUsername(username) {
        try {
            const user = await User.findOne({
                where: { username },
                include: [{
                    model: Role,
                    where: { name: 'admin' }
                }]
            });
            if (!user) {
                throw new Error('Admin not found');
            }
            return user;
        } catch (error) {
            return { error: error.message };
        }
    }

    // get all users
    async getAll({ username, email, sort, page, currentUserId }) {
        page = parseInt(page) || 1;
        const query = { status: true };
        if (username) query.username = { [Op.iLike]: `%${username}%` };
        if (email) query.email = { [Op.iLike]: `%${email}%` };

        const sortOptions = [];
        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions.push([field, order.toUpperCase()]);
        }

        const limit = 5;
        const offset = (page - 1) * limit;

        const { rows: users, count: total } = await User.findAndCountAll({
            where: query,
            include: [{ model: Role, as: 'role' }],
            order: sortOptions,
            limit,
            offset,
        });

        const totalPages = Math.ceil(total / limit);

        const formattedUsers = users.map(user => ({
            ...user.get({ plain: true }),
            formatted_created_at: moment(user.created_at).format('YYYY-MM-DD HH:mm:ss'),
            isCurrentUser: user.id === currentUserId
        }));

        return {
            data: formattedUsers,
            pagination: {
                currentPage: page,
                totalPages,
                pages: Array.from({ length: totalPages }, (_, i) => ({
                    number: i + 1,
                    active: i + 1 === page
                }))
            }
        };
    }

    // get blocked users
    async getBlockedUsers({ username, email, sort, page }) {
        page = parseInt(page) || 1;
        const query = { status: false };
        if (username) query.username = { [Op.iLike]: `%${username}%` };
        if (email) query.email = { [Op.iLike]: `%${email}%` };

        const sortOptions = [];
        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions.push([field, order.toUpperCase()]);
        }

        const limit = 5;
        const offset = (page - 1) * limit;

        const { rows: users, count: total } = await User.findAndCountAll({
            where: query,
            include: [{ model: Role, as: 'role' }],
            order: sortOptions,
            limit,
            offset,
        });

        const totalPages = Math.ceil(total / limit);

        const formattedUsers = users.map(user => ({
            ...user.get({ plain: true }),
            formatted_created_at: moment(user.created_at).format('YYYY-MM-DD HH:mm:ss')
        }));

        return {
            data: formattedUsers,
            pagination: {
                currentPage: page,
                totalPages,
                pages: Array.from({ length: totalPages }, (_, i) => ({
                    number: i + 1,
                    active: i + 1 === page
                }))
            }
        };
    }

    // block user
    async blockUser(userId, currentUserId) {
        if (userId === currentUserId) {
            throw new Error('Cannot ban your own account');
        }
        try {
            await User.update({ status: false }, { where: { id: userId } });
        } catch (error) {
            return { error: error.message };
        }
    }

    // unblock user
    async unblockUser(userId) {
        try {
            await User.update({status: true}, {where: {id: userId}});
        } catch (error) {
            return {error: error.message};
        }
    }
}

module.exports = new UserServices();