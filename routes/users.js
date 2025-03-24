const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Professionist = require('../models/Professionists');
const Workout = require('../models/Workout');
const Diet = require('../models/Diet');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const Event = require('../models/Event');
const Product = require('../models/Product');
require('dotenv').config(); // Per leggere le variabili d'ambiente
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// Then specific user routes
router.get('/:id', async (req, res) => {
    try {
        // First find all events where this user is the PATIENT
        const events = await Event.find({ patientId: req.params.id });
        
        // Then find and update the user with these events
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { events: events.map(event => event._id) },
            { new: true }
        )
        .populate('events')
        .populate('dietPlans')
        .populate('trainingPlans');

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Format the response
        const formattedUser = {
            ...user.toObject(),
            createdAt: new Date(user.createdAt).toLocaleDateString('it-IT'),
            updatedAt: new Date(user.updatedAt).toLocaleDateString('it-IT')
        };

        res.json(formattedUser);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({
            message: 'Errore nel recupero dell\'utente',
            error: err.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: 'Errore nell\'aggiornamento utente', error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Utente eliminato con successo' });
    } catch (err) {
        res.status(500).json({ message: 'Errore nella cancellazione utente' });
    }
});

// add gym presence
router.post('/:id/gymPresence', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.gymPresence.push(req.body);
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: 'Errore nell\'aggiunta della presenza al gym', error: err.message });
    }
});

// Allergens routes
router.post('/:id/allergens', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.allergens.push(req.body);
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: 'Errore nell\'aggiunta degli allergeni', error: err.message });
    }
});

// allergens delete
router.delete('/:id/allergens/:allergenId', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.allergens.pull(req.params.allergenId);
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: 'Errore nella cancellazione degli allergeni', error: err.message });
    }
});

// General routes last
router.get('/', async (req, res) => {
    try {
        const users = await User.find().populate('trainingPlans'); // Recupera tutti gli utenti
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Errore nel recupero utenti' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body); // Crea un nuovo documento
        const savedUser = await newUser.save(); // Salva nel database
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: 'Errore nella creazione utente', error: err.message });
    }
});

// Add to cart (dryOrder)
router.post('/:userId/cart', async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Validate product exists and has enough stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Prodotto non trovato' });
        }
        if (product.quantity < quantity) {
            return res.status(400).json({ message: 'Quantità non disponibile' });
        }

        // Add to cart
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Check if product already in cart
        const existingItem = user.dryOrder.find(item => 
            item.product.toString() === productId
        );

        if (existingItem) {
            // Update quantity if product already in cart
            existingItem.quantity += quantity;
        } else {
            // Add new item to cart
            user.dryOrder.push({
                product: productId,
                quantity: quantity,
                price: product.price
            });
        }

        await user.save();

        // Populate product details
        await user.populate('dryOrder.product');

        res.json({
            message: 'Prodotto aggiunto al carrello',
            cart: user.dryOrder
        });

    } catch (err) {
        res.status(500).json({
            message: 'Errore nell\'aggiunta al carrello',
            error: err.message
        });
    }
});

// Update cart item quantity
router.put('/:userId/cart/:productId', async (req, res) => {
    try {
        const { quantity } = req.body;
        const user = await User.findById(req.params.userId);
        
        const cartItem = user.dryOrder.find(item => 
            item.product.toString() === req.params.productId
        );

        if (!cartItem) {
            return res.status(404).json({ message: 'Prodotto non trovato nel carrello' });
        }

        // Validate stock
        const product = await Product.findById(req.params.productId);
        if (product.quantity < quantity) {
            return res.status(400).json({ message: 'Quantità non disponibile' });
        }

        cartItem.quantity = quantity;
        await user.save();

        await user.populate('dryOrder.product');

        res.json({
            message: 'Carrello aggiornato',
            cart: user.dryOrder
        });

    } catch (err) {
        res.status(500).json({
            message: 'Errore nell\'aggiornamento del carrello',
            error: err.message
        });
    }
});

// Remove item from cart
router.delete('/:userId/cart/:productId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        user.dryOrder = user.dryOrder.filter(item => 
            item.product.toString() !== req.params.productId
        );
        
        await user.save();

        res.json({
            message: 'Prodotto rimosso dal carrello',
            cart: user.dryOrder
        });

    } catch (err) {
        res.status(500).json({
            message: 'Errore nella rimozione dal carrello',
            error: err.message
        });
    }
});

// Checkout (convert cart to order)
router.post('/:userId/checkout', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('dryOrder.product');

        if (!user.dryOrder.length) {
            return res.status(400).json({ message: 'Il carrello è vuoto' });
        }

        // Calculate total
        const totalAmount = user.dryOrder.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );

        // Create new order
        const newOrder = {
            items: user.dryOrder,
            totalAmount,
            status: 'completed',
            orderDate: new Date()
        };

        // Update product quantities
        for (const item of user.dryOrder) {
            const product = await Product.findById(item.product);
            product.quantity -= item.quantity;
            await product.save();
        }

        // Add to order history and clear cart
        user.orderHistory.push(newOrder);
        user.dryOrder = [];
        await user.save();

        res.json({
            message: 'Ordine completato con successo',
            order: newOrder
        });

    } catch (err) {
        res.status(500).json({
            message: 'Errore nel completamento dell\'ordine',
            error: err.message
        });
    }
});

// Get order history
router.get('/:userId/orders', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('orderHistory.items.product');

        res.json({
            orders: user.orderHistory
        });

    } catch (err) {
        res.status(500).json({
            message: 'Errore nel recupero degli ordini',
            error: err.message
        });
    }
});

// Get user dryOrder
router.get('/:userId/dryOrder', async (req, res) => {
    const user = await User.findById(req.params.userId)
        .populate('dryOrder.product');
    res.json(user.dryOrder);
});

module.exports = router;
