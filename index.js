const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const product = require('./models/product');
const { findById } = require('./models/product');
const methodOverride = require('method-override');
const AppError = require('./AppError');

mongoose.connect('mongodb://localhost:27017/farmStand2', { useNewUrlParser: true, useUnifiedTopology: true })
    .then((data) => {
        console.log(data)
        console.log("Well done mongo Connection successful")
    })
    .catch((err) => {
        console.log("Error Signaled!!!!")
        console.log(err);
    });

const categories = ['fruit', 'vegetable', 'dairy', 'baked good', 'fish', 'meat']
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
//app.use(express.static(path.join(__dirname, '/public')));
app.use(methodOverride('_method'));
//app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//this function handles async function errors
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}


//both get and post routes to create a new product
app.get('/product/new', (req, res) => {
    res.render('product/new', { categories });
});



app.post('/product', wrapAsync(async (req, res, next) => {

    const newProduct = new product(req.body)
    await newProduct.save();
    res.redirect('/product')

}));

// both get and put routes used to edit product
app.get('/product/:id/edit', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const items = await product.findById(id);
    if (!items) {
        return next(new AppError('Product not found', 404));
    } else {
        res.render('product/edit', { items, categories });
    }


}));

app.put('/product/:id', wrapAsync(async (req, res, next) => {

    const { id } = req.params;
    const items = await product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/product/${items._id}`)

}));

//delete a product
app.delete('/product/:id', wrapAsync(async (req, res, next) => {

    const { id } = req.params;
    const deleteItem = await product.findByIdAndDelete(id);
    res.redirect('/product')
}
))
//show details about product
app.get('/product/:id', wrapAsync(async (req, res, next) => {

    const { id } = req.params
    const items = await product.findById(id);
    if (!items) {
        return next(new AppError('Product not found', 404));
    } else {
        res.render('product/show', { items });
    }
}
))

//index of all product
app.get('/product', wrapAsync(async (req, res, next) => {
    const { category } = req.query;
    if (category) {
        const items = await product.find({ category });
        res.render('product/index', { items, category })
    } else {
        const items = await product.find({});
        res.render('product/index', { items, category: 'All' })
    }
})
)
//function used to handle mangoose error: in this case validation error
const validationErrorHandler = err => {
    console.dir(err);
    return new AppError(`Unsuccessful Validation - ${err.message}`, 400)
}
//new error handling middleware: to handle mangoose error
app.use((err, req, res, next) => {
    console.log(err.name);
    if (err.name === 'ValidationError') err = validationErrorHandler(err);
    next(err);
})


//custom error with custom err.stack  
app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong!!!' } = err;
    // change stack message
    res.status(status).send(message);
});
// //change to 404 Route
// app.use((req, res) => {
//     res.status(404).send('NOT FOUND');
// })

app.listen('8080', () => {
    console.log('listening to port 8080')
})