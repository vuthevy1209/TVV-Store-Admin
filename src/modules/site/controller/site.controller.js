class SiteController {
    index(req, res) {
        res.render('page/dashboard/dashboard');
    }
}

module.exports = new SiteController();
