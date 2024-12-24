class ProductController{
    index(req, res){
        res.render('page/product/ProductList');
    }
}

module.exports = new ProductController();