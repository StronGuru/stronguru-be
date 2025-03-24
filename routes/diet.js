const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importa il modello
const Diet = require('../models/Diet');
const sgMail = require('@sendgrid/mail');

router.get('/', (req, res) => {
    res.send('Diet route is working!');
});

// Rotta: Attiva il piano dietetico
router.put('/:id/dietPlan', async (req, res) => {
    const { dietPlan } = req.body;
    await User.findByIdAndUpdate(req.params.id, { dietPlan }, { new: true });
    res.json({ message: 'Stato del piano dietetico cambiato' });
});

// Rotta: aggiungi dietPlan
router.post('/:id/dietPlans', async (req, res) => {
    try {
        const { index, title, label, note, dailyDiet } = req.body;

        // Validate required fields
        if (!index || !title || !label) {
            return res.status(400).json({
                message: 'Campi obbligatori mancanti. Necessari: index, title, label'
            });
        }

        // Create diet document
        const diet = new Diet({
            index,
            title,
            label,
            note: note || '',
            dailyDiet: dailyDiet || [],
            user: req.params.id,
            status: 'active'
        });

        // Save the diet
        await diet.save();

        // Get user details
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                $push: { dietPlans: diet._id },
                $set: { dietPlan: true }
            },
            { new: true }
        );

        if (!user) {
            await Diet.findByIdAndDelete(diet._id);
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Format the diet for email
        const formattedDate = new Date().toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Setup email data
        const msg = {
            to: user.email,
            from: process.env.SENDGRID_VERIFIED_SENDER,
            templateId: process.env.SENDGRID_NEW_DIET_TEMPLATE_ID,
            dynamicTemplateData: {
                firstName: user.firstName,
            }
        };

        try {
            await sgMail.send(msg);
            console.log('Diet plan notification email sent');
        } catch (emailError) {
            console.error('Error sending diet plan email:', emailError);
            // Continue with diet plan creation even if email sending fails
        }

        // Format the response
        const formattedDiet = {
            _id: diet._id,
            index: diet.index,
            title: diet.title,
            label: diet.label,
            note: diet.note,
            dailyDiet: diet.dailyDiet,
            status: diet.status,
            createdAt: new Date(diet.createdAt).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        res.status(201).json({
            message: 'Piano dietetico aggiunto con successo',
            diet: formattedDiet
        });

    } catch (err) {
        console.error('Error:', err);
        res.status(400).json({
            message: 'Errore nell\'aggiunta del piano dietetico',
            error: err.message
        });
    }
});

// Rotta: vedi tutti i dietPlan di uno specifico utente
router.get('/:id/dietPlans', async (req, res) => {
    const dietPlans = await Diet.find({ user: req.params.id })
        .select('index title label note dailyDiet status createdAt')
        .sort({ index: 1 })
        .lean();
    res.json(dietPlans);
});

// Rotta: Elimina dietPlan
router.delete('/:id/:dietId', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { $pull: { dietPlans: req.params.dietId } }, { new: true });
    res.json({ message: 'Piano dietetico eliminato con successo' });
});

// Rotta: aggiungi misure corporee
router.post('/:id/measurements', async (req, res) => {
    try {
        const measurements = {
            weight: req.body.weight,
            bodyFat: req.body.bodyFat,
            chest: req.body.chest,
            waist: req.body.waist,
            thighs: req.body.thighs,
            arms: req.body.arms,
            height: req.body.height,
            date: new Date()
        };

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { measurements: measurements },  // Update current measurements
                $push: { measureHistory: measurements }  // Add to history
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.json({ 
            message: 'Misure corporee aggiornate con successo',
            currentMeasurements: user.measurements,
            measurementsHistory: user.measureHistory
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(400).json({ 
            message: 'Errore nell\'aggiornamento delle misure', 
            error: err.message 
        });
    }
});

// Rotta: vedi misure corporee
router.get('/:id/measurements', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user.measurements);
});

// Rotta: modifica misure corporee
router.put('/:id/measurements', async (req, res) => {
    try {
        // Get measurements directly from req.body instead of destructuring
        const measurements = {
            weight: req.body.weight,
            bodyFat: req.body.bodyFat,
            chest: req.body.chest,
            waist: req.body.waist,
            thighs: req.body.thighs,
            arms: req.body.arms,
            date: new Date()
        };

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { measurements: measurements } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        res.json({ 
            message: 'Misure corporee modificate con successo',
            measurements: updatedUser.measurements 
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(400).json({ 
            message: 'Errore nella modifica delle misure', 
            error: err.message 
        });
    }
});

// Rotta: vedi un singolo dietPlan per ID
router.get('/:id/dietPlans/:dietId', async (req, res) => {
    try {
        const { id, dietId } = req.params;

        console.log('Fetching diet plan:', { userId: id, dietId });

        // Find the diet plan by ID and ensure it belongs to the user
        const diet = await Diet.findOne({
            _id: dietId,
            user: id
        }).lean();

        if (!diet) {
            return res.status(404).json({
                message: 'Piano dietetico non trovato'
            });
        }

        // Format the response
        const formattedDiet = {
            _id: diet._id,
            index: diet.index,
            title: diet.title,
            label: diet.label,
            note: diet.note,
            dailyDiet: diet.dailyDiet,
            status: diet.status,
            createdAt: new Date(diet.createdAt).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        console.log('Returning diet plan:', JSON.stringify(formattedDiet, null, 2));

        res.json(formattedDiet);

    } catch (err) {
        console.error('Error fetching diet plan:', err);
        res.status(500).json({
            message: 'Errore nel recupero del piano dietetico',
            error: err.message
        });
    }
});

module.exports = router;
