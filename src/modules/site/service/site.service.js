const { response } = require('express');
const orderService = require('../../order/service/order.service');
const productService = require('../../product/service/product.service');
const moment = require('moment');
const DecimalUtils = require('../../../utils/decimal.utils');

class SiteService{

    // total revenue
    // total orders
    // total products
    async getInitialData(){
        let {totalOrder, totalRevenue} = await orderService.getTotalOrder();
        totalRevenue = DecimalUtils.divide(totalRevenue, 1000); // Convert to thousand 
        const totalProduct = await productService.getTotalProducts();

        return {response: {totalOrder, totalRevenue, totalProduct}};
    }

    async getDayNamesOfMonth(year, month) {
        const dayNames = [];
        const startDate = moment([year, month]);
        const daysInMonth = startDate.daysInMonth();
    
        for (let day = 1; day <= daysInMonth; day++) {
            const date = moment([year, month, day]);
            dayNames.push(date.format('dddd, D'));
        }
    
        return dayNames;
    }

    async getRevenueChartData(timeRange){
        let revenueLabels = [];
        let revenueData = [];
        let paymentData = [];

        let tmp={};

        const today = new Date();
        if(timeRange==='day'){
            tmp = await orderService.getRevenueByDay(today);
        }
        else if(timeRange==='week'){
            tmp = await orderService.getRevenueByWeek(today);
        }
        else if (timeRange === 'month') {
            // Get the current year and month
            const year = today.getFullYear();
            const month = today.getMonth();
        
            // Get the names of the days of the month
            revenueLabels = await this.getDayNamesOfMonth(year, month);
        
            // Fetch revenue and payment data
            tmp = await orderService.getRevenueByMonth(today);
        }
        else if(timeRange==='year'){
            tmp = await orderService.getRevenueByYear(today);
        }

        revenueData = tmp.revenueData;
        paymentData = tmp.paymentData;
        revenueLabels = tmp.revenueLabels;


        return {revenueData, paymentData, revenueLabels};
    }

    async getTopProductsByRevenue(timeRange) {
        const today = new Date();
        let productList = [];

        if (timeRange === 'day') {
            productList = await productService.getTopProductsByDay(today);
        } else if (timeRange === 'week') {
            productList = await productService.getTopProductsByWeek(today);
        } else if (timeRange === 'month') {
            productList = await productService.getTopProductsByMonth(today);
        } else if (timeRange === 'year') {
            productList = await productService.getTopProductsByYear(today);
        }

        return { productList };
    }

}

module.exports = new SiteService();