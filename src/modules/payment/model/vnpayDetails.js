const {DataTypes} = require('@sequelize/core');
const {sequelize} = require('../../../config/database');

const PaymentDetails = require('./paymentDetails');

const VNPayDetails = sequelize.define('vnpay-details', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    payment_detail_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    vnp_TransactionNo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
},{
    tableName: 'vnpay_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

VNPayDetails.belongsTo(PaymentDetails, {foreignKey: 'payment_detail_id'}, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});

module.exports = VNPayDetails;