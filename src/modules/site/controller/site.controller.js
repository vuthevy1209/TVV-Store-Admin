const siteService = require('../service/site.service');

class SiteController {
    
// [GET] /dashboard
    async index(req, res, next) {
        try {
            const {response} = await siteService.getInitialData();
            console.log('get initial dashboard data successfully');
            console.log(response);
            res.render('page/dashboard/dashboard', { response });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            next(error);
        }
    }

    // [GET] /dashboard/data
    async getData(req, res, next) {
        try {
            const { timeRange } = req.query;
            const result = await siteService.getRevenueChartData(timeRange);
            console.log('get dashboard chart data successfully');
            console.log(result);
            return res.json({ result });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // [GET] /dashboard/top-products
    async getTopProducts(req, res, next) {
        try {
            const { timeRange } = req.query;
            const result = await siteService.getTopProductsByRevenue(timeRange);
            console.log('get top products by revenue successfully');
            console.log(result);
            return res.json({ result });
        } catch (error) {
            console.error('Error fetching top products data:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new SiteController();
