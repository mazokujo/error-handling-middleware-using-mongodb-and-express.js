const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/farmStand2', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Well done mongo Connection successful")
    })
    .catch((err) => {
        console.log("Error Signaled!!!!")
        console.log(err);
    });

const product = require('./models/product')
product.deleteMany({});
const k = new product({
    name: 'kiwi',
    price: 2.99,
    category: 'fruit'
})

const seedProducts = [
    {
        name: 'butter',
        price: 3.99,
        category: 'dairy'
    },
    {
        name: 'spinach',
        price: 1.99,
        category: 'vegetable'
    },
    {
        name: 'strawberry',
        price: 0.99,
        category: 'fruit'
    },
    {
        name: 'Green pepper',
        price: 2.99,
        category: 'vegetable'
    },
    {
        name: 'White cheese',
        price: 6.99,
        category: 'dairy'
    }
]

// product.insertMany(seedProducts)
//     .then(data => console.log(data))
//     .catch(err => console.log(err))

