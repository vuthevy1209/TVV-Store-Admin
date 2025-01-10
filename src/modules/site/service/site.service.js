const { response } = require('express');
const orderService = require('../../order/service/order.service');
const productService = require('../../product/service/product.service');
const moment = require('moment');

class SiteService{

    // total revenue
    // total orders
    // total products
    async getInitialData(){
        const {totalOrder, totalRevenue} = await orderService.getTotalOrder();
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
            revenueLabels.push('Today');
            tmp = await orderService.getRevenueByDay(today);
        }
        else if(timeRange==='week'){
            revenueLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
            revenueLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            tmp = await orderService.getRevenueByYear(today);
        }

        revenueData = tmp.revenueData;
        paymentData = tmp.paymentData;
        revenueLabels = tmp.revenueLabels;
        console.log('PAYMENT DATA IN SITE SERVICE', paymentData);
        console.log('REVENUE DATA IN SITE SERVICE', revenueData);
        console.log('REVENUE LABELS IN SITE SERVICE', revenueLabels);


        return {response: {revenueData, paymentData, revenueLabels}};
    }

    

}

module.exports = new SiteService();