const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// CREATE - Add a new product
router.post('/', async (req, res) => {
    try {
        const { title, price, description, brand, quantity, image } = req.body;

        const product = new Product({
            title,
            price,
            description,
            brand,
            quantity: quantity || 0,
            image
        });

        await product.save();

        res.status(201).json({
            message: 'Prodotto creato con successo',
            product
        });
    } catch (err) {
        res.status(500).json({
            message: 'Errore nella creazione del prodotto',
            error: err.message
        });
    }
});

// READ - Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({
            message: 'Errore nel recupero dei prodotti',
            error: err.message
        });
    }
});

// READ - Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Prodotto non trovato' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({
            message: 'Errore nel recupero del prodotto',
            error: err.message
        });
    }
});

// UPDATE - Update a product
router.put('/:id', async (req, res) => {
    try {
        const { title, price, description, brand, quantity, image } = req.body;
        
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id },
            {
                title,
                price,
                description,
                brand,
                quantity,
                image
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Prodotto non trovato' });
        }

        res.json({
            message: 'Prodotto aggiornato con successo',
            product
        });
    } catch (err) {
        res.status(500).json({
            message: 'Errore nell\'aggiornamento del prodotto',
            error: err.message
        });
    }
});

// DELETE - Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Prodotto non trovato' });
        }

        res.json({
            message: 'Prodotto eliminato con successo',
            product
        });
    } catch (err) {
        res.status(500).json({
            message: 'Errore nell\'eliminazione del prodotto',
            error: err.message
        });
    }
});

module.exports = router;
