const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true,
        min: 0 
    },
    description: { 
        type: String, 
        required: true 
    },
    brand: { 
        type: String, 
        required: true 
    },
    inStock: { 
        type: Boolean, 
        default: true 
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    image: { 
        type: String,  // URL to the image
        required: true 
    }
}, { timestamps: true });

// Middleware to update inStock based on quantity (for both save and update)
productSchema.pre(['save', 'findOneAndUpdate'], function(next) {
    // For findOneAndUpdate
    if (this.getUpdate) {
        const update = this.getUpdate();
        if (update.quantity !== undefined) {
            update.inStock = update.quantity > 0;
        }
    }
    // For save
    else {
        this.inStock = this.quantity > 0;
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
