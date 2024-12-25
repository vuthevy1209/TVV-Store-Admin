const { DataTypes } = require('@sequelize/core');
const { sequelize } = require('../../../config/database');

const Category = sequelize.define('Category', {
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
    tableName: 'product_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Define the association
// Category.hasMany(Product, { foreignKey: 'category_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = Category;