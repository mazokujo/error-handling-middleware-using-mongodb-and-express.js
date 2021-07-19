const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const product = require('./models/product');
const Farm = require('./models/farm')
//const { findById } = require('./models/product');
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
// Home 

app.get('/', (req, res) => {
    res.render('home')
})

//FARM ROUTES
//all farms
app.get('/farm', wrapAsync(async (req, res, next) => {
    const { location } = req.query;
    if (location) {
        const items = await Farm.find({ location });
        res.render('farm/index', { items, location })
    } else {
        const items = await Farm.find({});
        res.render('farm/index', { items, location: 'All' })
    }
})
)

//add a new farm
app.get('/farm/new', wrapAsync(async (req, res) => {
    res.render('farm/new')
}));

app.post('/farm', wrapAsync(async (req, res, next) => {
    const newFarm = new Farm(req.body)
    await newFarm.save();
    res.redirect('/farm')
}));

//show details about the farm
app.get('/farm/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id).populate('product');
    console.log(farm)
    res.render('farm/show', { farm })
}))
//edit farm
app.put('/farm/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/farm/${items._id}`)
}))

//delete farm
app.delete('/farm/:id', wrapAsync(async (req, res) => {
    const { id } = req.params
    const deleteFarm = await Farm.findByIdAndDelete(id);
    res.redirect('/farm');
}))
// add a product to the farm, we use original newproduct template
app.get('/farm/:id/product/new', wrapAsync(async (req, res) => {
    const { id } = req.params
    const farm = await Farm.findById(id);
    res.render('product/new', { categories, farm })
}));
app.post('/farm/:id/product', async (req, res) => {
    const { name, price, category } = req.body
    const newProduct = await new product({ name, price, category });
    const { id } = req.params
    const farm = await Farm.findById(id);
    farm.product.push(newProduct)
    newProduct.farm = farm
    await newProduct.save();
    await farm.save();
    res.redirect(`/farm/${id}`);
    //const farm = await Farm.findById(id);

})


//PRPODUCT ROUTES

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