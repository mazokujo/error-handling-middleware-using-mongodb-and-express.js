const mongoose = require('mongoose');
// const { Schema } = mongoose.Schema;

const farmSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Specify farm name']
    },
    location: {
        type: String,
        required: [true, "please specify the farm's location"]
    },
    website: {
        type: String,
        required: [true, "website required"]
    },
    product: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        }
    ]

});
//use of mongoose middleware to delete a farm and associated product
farmSchema.post('findOneAndDelete', async function (farm) {
    if (farm.products.length) {
        const res = await Product.deleteMany({ _id: { $in: farm.products } })
        console.log(res);
    }
})
const Farm = mongoose.model('Farm', farmSchema);

module.exports = Farm
