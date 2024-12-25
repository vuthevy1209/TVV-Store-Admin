const { DataTypes } = require('@sequelize/core');
const { sequelize } = require('../../../config/database');

const Brand = sequelize.define('Brand', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    desc: {
        type: DataTypes.TEXT
    },
    business_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'product_brands',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Define the association
// Brand.hasMany(Product, { foreignKey: 'brand_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = Brand;