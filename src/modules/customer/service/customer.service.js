const User = require('../../user/model/user');
const Customer = require('../model/customer');

class CustomerService {
    async getByUserId(userId) {
        return await Customer.findOne({ where: { user_id: userId } });
        
    }

    async createCustomerBasedOnExistingUser(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const existingCustomer = await this.getByUserId(userId);
            if (existingCustomer) {
                throw new Error('Customer already exists for this user');
            }

            const customer = await Customer.create({ user_id: userId });
            return {customer};
        } catch (error) {
            console.error('Error creating customer:', error);
            throw new Error('Error creating customer');
        }
    }
}

module.exports = new CustomerService();