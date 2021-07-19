const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        lowercase: true,
        required: true,
        enum: ['fruit', 'vegetable', 'dairy']
    },
    farm: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Farm'
        }
    ]
})

const product = mongoose.model('product', productSchema);

module.exports = product;