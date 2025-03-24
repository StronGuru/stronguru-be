const express = require('express');
const router = express.Router();
const Professionists = require('../models/Professionists'); // Importa il modello
const User = require('../models/User'); // Importa il modello
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const mongoose = require('mongoose');
const Workout = require('../models/Workout'); // Importa il modello


// Rotta: Ottieni tutti i professionisti
router.get('/', async (req, res) => {
    try {
        // Log the Professionists model to check if it's properly loaded
        console.log('Professionists model:', typeof Professionists, Professionists);

        if (!Professionists || !Professionists.find) {
            console.error('Professionists model is not properly loaded');
            return res.status(500).json({ message: 'Internal server error - Model not loaded' });
        }

        // Log before the query
        console.log('Attempting to fetch professionists...');

        const professionistsList = await Professionists.find({}).exec();

        // Log after the query
        console.log('Query result:', professionistsList);

        if (!professionistsList) {
            return res.status(404).json({ message: 'No professionists found' });
        }

        res.json(professionistsList);
    } catch (err) {
        // Enhanced error logging
        console.error('Full error details:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });

        res.status(500).json({
            message: 'Errore nel recupero utenti',
            error: err.toString(),
            details: err.message
        });
    }
});

// Rotta: Ottieni un utente per ID
router.get('/:id', async (req, res) => {
    try {
        const professionist = await Professionists.findById(req.params.id)
            .select('-password')
            .populate({
                path: 'customersList.user',
                model: 'User',
                select: '-password -__v' // Exclude sensitive fields
            });

        if (!professionist) {
            return res.status(404).json({ message: 'Professionista non trovato' });
        }

        res.json(professionist);
    } catch (err) {
        res.status(500).json({
            message: 'Errore nel recupero del professionista',
            error: err.message
        });
    }
});

// Rotta: Aggiorna un professionsta
router.put('/:id', async (req, res) => {
    try {
        const updatedProfessionst = await Professionists.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProfessionst);
    } catch (err) {
        res.status(400).json({ message: 'Errore nell\'aggiornamento professionsta', error: err.message });
    }
});

// Rotta: Elimina un Professionsta
router.delete('/:id', async (req, res) => {
    try {
        await Professionists.findByIdAndDelete(req.params.id);
        res.json({ message: 'Professionsta eliminato con successo' });
    } catch (err) {
        res.status(500).json({ message: 'Errore nella cancellazione del professionsta' });
    }
});

// Rotta: Registrazione (Signup) di un nuovo Professionista
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password, dateOfBirth, role, city, region, country, instagram, linkedin, whatsapp, phone } = req.body;

        // Verifica se l'utente esiste già
        const existingProfessionst = await Professionists.findOne({ email });
        if (existingProfessionst) {
            return res.status(400).json({ message: 'Professionista già registrato con questa email' });
        }

        // Crea un nuovo professionista
        const professionist = new Professionists({
            firstName,
            lastName,
            email,
            password,
            dateOfBirth,
            role,
            city,
            region,
            country,
            instagram,
            linkedin,
            whatsapp,
            phone
        });

        // Generate verification token
        professionist.verificationToken = crypto.randomBytes(32).toString('hex');
        console.log('Generated verification token:', professionist.verificationToken);
        professionist.isVerified = false;

        // Setup email data
        const msg = {
            to: email,
            from: process.env.SENDGRID_VERIFIED_SENDER,
            subject: 'Verifica il tuo account Sporty',
            templateId: process.env.SENDGRID_PRO_TEMPLATE_ID,
            dynamicTemplateData: {
                firstName: professionist.firstName,
                verificationToken: professionist.verificationToken,
                backendUrl: process.env.BACKEND_URL
            }
        };

        // Send email
        try {
            await sgMail.send(msg);
            console.log('Verification email sent');
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            return res.status(500).json({
                message: 'Errore nell\'invio dell\'email di verifica',
                error: emailError.message
            });
        }

        // Save professionist
        await professionist.save();

        res.status(201).json({
            message: 'Registrazione riuscita. Per favore controlla la tua email per verificare l\'account',
            professionistId: professionist._id
        });
    } catch (err) {
        console.error('Error in signup:', err);
        res.status(400).json({
            message: 'Errore nella registrazione del professionista',
            error: err.message
        });
    }
});

// Add verification route
router.get('/verify/:token', async (req, res) => {
    try {
        console.log('Verification attempt with token:', req.params.token);

        const professionist = await Professionists.findOne({ verificationToken: req.params.token });
        console.log('Found professionist:', professionist);

        if (!professionist) {
            return res.status(404).json({
                message: 'Token di verifica non valido'
            });
        }

        // Update professionist verification status
        professionist.isVerified = true;
        professionist.verificationToken = undefined; // Clear the token after use
        await professionist.save();

        // Redirect to frontend login page
        res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);

    } catch (err) {
        console.error('Error verifying email:', err);
        res.redirect(`${process.env.FRONTEND_URL}/login?verified=false`);
    }
});

// Update login route to check verification
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const professionist = await Professionists.findOne({ email });
        if (!professionist) {
            return res.status(400).json({ message: 'Email o password errati' });
        }

        // Check if email is verified
        if (!professionist.isVerified) {
            return res.status(401).json({
                message: 'Per favore verifica la tua email prima di accedere'
            });
        }

        const isMatch = await professionist.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email o password errati' });
        }

        const token = professionist.generateAuthToken();
        const professionistWithoutPassword = professionist.toObject();
        delete professionistWithoutPassword.password;

        res.json({
            message: 'Login riuscito',
            token,
            user: professionistWithoutPassword
        });
    } catch (err) {
        res.status(500).json({ message: 'Errore durante il login', error: err.message });
    }
});

// Rotta: Aggiungi un cliente alla lista dei clienti del professionista
router.post('/:id/customers', async (req, res) => {
    const { customerId } = req.body;
    await Professionists.findByIdAndUpdate(req.params.id, { $push: { customersList: customerId } }, { new: true });
    res.json({ message: 'Cliente aggiunto alla lista con successo' });
});

// Rotta: Elimina un cliente dalla lista dei clienti del professionista
router.delete('/:profId/customers/:userId', async (req, res) => {
    try {
        const { profId, userId } = req.params;

        // Find the professionist
        const professionist = await Professionists.findById(profId);
        if (!professionist) {
            return res.status(404).json({
                message: 'Professionista non trovato'
            });
        }

        // Find the user to get their email for notification
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Cliente non trovato'
            });
        }

        // Remove customer from the list using the correct path
        const updatedProfessionist = await Professionists.findByIdAndUpdate(
            profId,
            {
                $pull: {
                    customersList: {
                        user: userId
                    }
                }
            },
            { new: true }
        );

        if (!updatedProfessionist) {
            return res.status(400).json({
                message: 'Errore nella rimozione del cliente'
            });
        }

        res.json({
            message: 'Cliente rimosso dalla lista con successo',
            professionist: updatedProfessionist
        });

    } catch (err) {
        console.error('Error removing customer:', err);
        res.status(500).json({
            message: 'Errore durante la rimozione del cliente',
            error: err.message
        });
    }
});

// Rotta per aggiungere utente alla customer list del professionista
router.patch('/:profId/customers/:userId', async (req, res) => {
    try {
        const { profId, userId } = req.params;
        const { status = 'pending' } = req.body; // Optional status in body

        // Validate status
        const validStatuses = ['active', 'pending', 'inactive'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Stato non valido. Utilizzare active, pending, o inactive'
            });
        }

        // Verify both users exist
        const professionist = await Professionists.findById(profId);
        const user = await User.findById(userId).select('-password');

        if (!professionist || !user) {
            return res.status(404).json({
                message: 'Professionista o utente non trovato'
            });
        }

        // Check if user is already in customer list
        if (professionist.customersList.some(customer => customer.toString() === userId)) {
            return res.status(400).json({
                message: 'Utente già presente nella lista clienti'
            });
        }

        // Add user to customersList with status
        const updatedProfessionist = await Professionists.findByIdAndUpdate(
            profId,
            {
                $push: {
                    customersList: {
                        user: user,
                        status: status
                    }
                }
            },
            { new: true }
        )
            .select('-password')
            .populate({
                path: 'customersList.user',
                select: '-password -__v'
            });

        res.json({
            message: 'Cliente aggiunto con successo',
            professionist: updatedProfessionist
        });

    } catch (err) {
        res.status(500).json({
            message: 'Errore durante l\'aggiunta del cliente',
            error: err.message
        });
    }
});

// Rotta per vedere tutta la customer list del professionista
router.get('/:id/customers', async (req, res) => {
    try {
        // Find the professionist and populate customersList with full details
        const professionist = await Professionists.findById(req.params.id)
            .populate({
                path: 'customersList.user',
                select: '-password'
            });

        if (!professionist) {
            return res.status(404).json({ message: 'Professionista non trovato' });
        }

        // Map the response to include both customer details and status
        const formattedCustomersList = professionist.customersList.map(entry => ({
            customer: entry.user,
            status: entry.status
        }));

        res.json(formattedCustomersList);
    } catch (err) {
        res.status(500).json({
            message: 'Errore nel recupero della lista clienti',
            error: err.message
        });
    }
});

// Rotta per aggiornare lo status di un cliente specifico
router.patch('/:profId/customers/:userId/status', async (req, res) => {
    try {
        const { profId, userId } = req.params;
        const { status } = req.body;

        console.log('Request params:', { profId, userId, status });

        // Validate status
        const validStatuses = ['active', 'pending', 'inactive'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Stato non valido. Utilizzare active, pending, o inactive'
            });
        }

        // First find the professionist
        const professionist = await Professionists.findById(profId);

        if (!professionist) {
            return res.status(404).json({
                message: 'Professionista non trovato'
            });
        }

        // Update the status using the correct path
        const updatedProfessionist = await Professionists.findOneAndUpdate(
            {
                _id: profId,
                'customersList.user': userId  // Match the specific customer
            },
            {
                $set: {
                    'customersList.$.status': status  // Update their status
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).populate({
            path: 'customersList.user',
            model: 'User',
            select: 'firstName lastName email dateOfBirth gender dietPlan trainingPlan psychoPlan measurements dietPlans trainingPlans'
        });

        if (!updatedProfessionist) {
            return res.status(404).json({
                message: 'Cliente non trovato nella lista del professionista'
            });
        }

        // Find the updated customer
        const updatedCustomer = updatedProfessionist.customersList.find(
            customer => customer.user._id.toString() === userId
        );

        if (!updatedCustomer) {
            return res.status(404).json({
                message: 'Cliente non trovato dopo l\'aggiornamento'
            });
        }

        res.json({
            message: 'Status del cliente aggiornato con successo',
            customer: {
                customer: updatedCustomer.user,
                status: updatedCustomer.status
            }
        });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            message: 'Errore durante l\'aggiornamento dello status del cliente',
            error: err.message
        });
    }
});

// Route for requesting password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Find professionist by email
        const professionist = await Professionists.findOne({ email });
        if (!professionist) {
            return res.status(404).json({
                message: 'Nessun account trovato con questa email'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        professionist.resetPasswordToken = resetToken;
        professionist.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
        await professionist.save();

        // Send reset email
        const msg = {
            to: email,
            from: process.env.SENDGRID_VERIFIED_SENDER,
            subject: 'Reset Password - Sporty',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #0078d7;">Reset Password</h1>
                    <p>Ciao ${professionist.firstName},</p>
                    <p>Hai richiesto il reset della password. Clicca sul link seguente per impostare una nuova password:</p>
                    <div style="margin: 20px 0;">
                        <a href="${process.env.BACKEND_URL}/professionists/reset-password/${resetToken}" 
                           style="background-color: #0078d7; color: white; padding: 12px 20px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Il link scadrà tra un'ora.</p>
                    <p>Se non hai richiesto il reset della password, ignora questa email.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                        Questa è un'email automatica, per favore non rispondere.
                    </p>
                </div>
            `
        };

        await sgMail.send(msg);

        res.json({
            message: 'Email per il reset della password inviata con successo'
        });

    } catch (err) {
        console.error('Error in forgot password:', err);
        res.status(500).json({
            message: 'Errore nell\'invio dell\'email di reset',
            error: err.message
        });
    }
});

// Route to handle the reset password link click
router.get('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Check if token exists and is not expired
        const professionist = await Professionists.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!professionist) {
            // Redirect to frontend with error parameter
            return res.redirect(`${process.env.FRONTEND_URL}/reset-password?error=invalid`);
        }

        // Redirect to frontend reset password page with token
        res.redirect(`${process.env.FRONTEND_URL}/reset-password/${token}`);

    } catch (err) {
        console.error('Error in reset password redirect:', err);
        res.redirect(`${process.env.FRONTEND_URL}/reset-password?error=server`);
    }
});

// Route for actually resetting the password
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        // Find professionist with valid reset token and not expired
        const professionist = await Professionists.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!professionist) {
            return res.status(400).json({
                message: 'Token non valido o scaduto'
            });
        }

        // Set new password
        professionist.password = password;
        professionist.resetPasswordToken = undefined;
        professionist.resetPasswordExpires = undefined;
        await professionist.save();

        // Send confirmation email
        const msg = {
            to: professionist.email,
            from: process.env.SENDGRID_VERIFIED_SENDER,
            subject: 'Password Aggiornata - Sporty',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #0078d7;">Password Aggiornata</h1>
                    <p>Ciao ${professionist.firstName},</p>
                    <p>La tua password è stata aggiornata con successo.</p>
                    <p>Puoi ora accedere al tuo account con la nuova password.</p>
                    <div style="margin: 20px 0;">
                        <a href="${process.env.FRONTEND_URL}/login" 
                           style="background-color: #0078d7; color: white; padding: 12px 20px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Accedi
                        </a>
                    </div>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                        Questa è un'email automatica, per favore non rispondere.
                    </p>
                </div>
            `
        };

        await sgMail.send(msg);

        res.json({
            message: 'Password aggiornata con successo'
        });

    } catch (err) {
        console.error('Error in reset password:', err);
        res.status(500).json({
            message: 'Errore nel reset della password',
            error: err.message
        });
    }
});

// Rotta: Aggiungi un certificato
router.post('/certificates/:id', async (req, res) => {
    try {
        const { title, entity, startDate, endDate } = req.body;

        // Validate required fields
        if (!title || !entity || !startDate || !endDate) {
            return res.status(400).json({
                message: 'Campi obbligatori mancanti. Necessari: title, entity, startDate, endDate'
            });
        }

        // Find the professionist and add the certificate
        const updatedProfessionist = await Professionists.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    certificates: {
                        title,
                        entity,
                        startDate,
                        endDate
                    }
                }
            },
            { new: true }
        );

        if (!updatedProfessionist) {
            return res.status(404).json({ message: 'Professionista non trovato' });
        }

        res.json({
            message: 'Certificato aggiunto con successo',
            certificates: updatedProfessionist.certificates
        });

    } catch (err) {
        console.error('Error adding certificate:', err);
        res.status(500).json({
            message: 'Errore durante l\'aggiunta del certificato',
            error: err.message
        });
    }
});

// Rotta: Get professionist certificates
router.get('/certificates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const professionist = await Professionists.findById(id);
        res.json(professionist.certificates);
    } catch (err) {
        console.error('Error getting certificates:', err);
        res.status(500).json({
            message: 'Errore durante la lettura dei certificati',
            error: err.message
        });
    }
});

// Rotta: Elimina un certificato
router.delete('/certificates/:id/:certificateId', async (req, res) => {
    try {
        const { id, certificateId } = req.params;
        const updatedProfessionist = await Professionists.findByIdAndUpdate(
            id,
            { $pull: { certificates: { _id: certificateId } } },
            { new: true }
        );

        if (!updatedProfessionist) {
            return res.status(404).json({ message: 'Professionista non trovato' });
        }

        res.json({
            message: 'Certificato eliminato con successo',
            certificates: updatedProfessionist.certificates
        });

    } catch (err) {
        console.error('Error deleting certificate:', err);
        res.status(500).json({
            message: 'Errore durante l\'eliminazione del certificato',
            error: err.message
        });
    }
});

// Rotta: Aggiungi un'istruzione
router.post('/education/:id', async (req, res) => {
    try {
        const { title, entity, startDate, endDate } = req.body;

        if (!title || !entity || !startDate || !endDate) {
            return res.status(400).json({
                message: 'Campi obbligatori mancanti. Necessari: title, institution, startDate, endDate'
            });
        }

        const updatedProfessionist = await Professionists.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    education: {
                        title,
                        entity,
                        startDate,
                        endDate
                    }
                }
            },
            { new: true }
        );

        if (!updatedProfessionist) {
            return res.status(404).json({ message: 'Professionista non trovato' });
        }

        res.json({
            message: 'Istruzione aggiunta con successo',
            education: updatedProfessionist.education
        });

    } catch (err) {
        console.error('Error adding education:', err);
        res.status(500).json({
            message: 'Errore durante l\'aggiunta dell\'istruzione',
            error: err.message
        });
    }
});

// Rotta: Get professionist education
router.get('/education/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const professionist = await Professionists.findById(id);
        res.json(professionist.education);
    } catch (err) {
        console.error('Error getting education:', err);
        res.status(500).json({
            message: 'Errore durante la lettura dell\'istruzione',
            error: err.message
        });
    }
});

// Rotta: Elimina un'istruzione
router.delete('/education/:id/:educationId', async (req, res) => {
    try {
        const { id, educationId } = req.params;
        const updatedProfessionist = await Professionists.findByIdAndUpdate(
            id,
            { $pull: { education: { _id: educationId } } },
            { new: true }
        );

        if (!updatedProfessionist) {
            return res.status(404).json({ message: 'Professionista non trovato' });
        }

        res.json({
            message: 'Istruzione eliminata con successo',
            education: updatedProfessionist.education
        });
    } catch (err) {
        console.error('Error deleting education:', err);
        res.status(500).json({
            message: 'Errore durante l\'eliminazione dell\'istruzione',
            error: err.message
        });
    }
});

// Create a new customer group
router.post('/:professionistId/groups', async (req, res) => {
    try {
        const { name, description, sport, location, customers } = req.body;

        const professionist = await Professionists.findById(req.params.professionistId);
        if (!professionist) {
            return res.status(404).json({ message: 'Professionista non trovato' });
        }

        // Verify all customers exist in customersList
        const validCustomers = customers.filter(customerId =>
            professionist.customersList.some(entry =>
                entry.user.toString() === customerId && entry.status === 'active'
            )
        );

        if (validCustomers.length !== customers.length) {
            return res.status(400).json({
                message: 'Alcuni clienti selezionati non sono validi o non sono attivi'
            });
        }

        const newGroup = {
            name,
            description,
            sport,
            location,
            customers: validCustomers
        };

        professionist.customerGroups.push(newGroup);
        await professionist.save();

        res.status(201).json({
            message: 'Gruppo creato con successo',
            group: newGroup
        });

    } catch (err) {
        res.status(500).json({
            message: 'Errore nella creazione del gruppo',
            error: err.message
        });
    }
});

// Get all groups
router.get('/:professionistId/groups', async (req, res) => {
    try {
        const professionist = await Professionists.findById(req.params.professionistId)
            .populate('customerGroups.customers', 'firstName lastName email');

        if (!professionist) {
            return res.status(404).json({ message: 'Professionista non trovato' });
        }

        res.json(professionist.customerGroups);

    } catch (err) {
        res.status(500).json({
            message: 'Errore nel recupero dei gruppi',
            error: err.message
        });
    }
});

// Update a group
router.put('/:professionistId/groups/:groupId', async (req, res) => {
    try {
        const { name, description, sport, location, customers } = req.body;

        const professionist = await Professionists.findById(req.params.professionistId);
        if (!professionist) {
            return res.status(404).json({ message: 'Professionista non trovato' });
        }

        const group = professionist.customerGroups.id(req.params.groupId);
        if (!group) {
            return res.status(404).json({ message: 'Gruppo non trovato' });
        }

        // Verify all customers exist in customersList
        if (customers) {
            const validCustomers = customers.filter(customerId =>
                professionist.customersList.some(entry =>
                    entry.user.toString() === customerId && entry.status === 'active'
                )
            );

            if (validCustomers.length !== customers.length) {
                return res.status(400).json({
                    message: 'Alcuni clienti selezionati non sono validi o non sono attivi'
                });
            }
            group.customers = validCustomers;
        }

        // Update basic fields if provided
        if (name) group.name = name;
        if (description) group.description = description;
        if (sport) group.sport = sport;
        if (location) group.location = location;

        await professionist.save();

        // Populate references before sending response
        await professionist.populate([
            {
                path: 'customerGroups.customers',
                select: 'firstName lastName email'
            },
            {
                path: 'customerGroups.trainings',
                select: 'title description'
            }
        ]);

        res.json({
            message: 'Gruppo aggiornato con successo',
            group: professionist.customerGroups.id(req.params.groupId)
        });

    } catch (err) {
        console.error('Error updating group:', err);
        res.status(500).json({
            message: 'Errore nell\'aggiornamento del gruppo',
            error: err.message
        });
    }
});

// Delete a group
router.delete('/:professionistId/groups/:groupId', async (req, res) => {
    try {
        const professionist = await Professionists.findById(req.params.professionistId);
        if (!professionist) {
            return res.status(404).json({ message: 'Professionista non trovato' });
        }

        professionist.customerGroups = professionist.customerGroups.filter(
            group => group._id.toString() !== req.params.groupId
        );

        await professionist.save();

        res.json({ message: 'Gruppo eliminato con successo' });

    } catch (err) {
        res.status(500).json({
            message: 'Errore nell\'eliminazione del gruppo',
            error: err.message
        });
    }
});

// Add customers to a group
router.post('/:professionistId/groups/:groupId/customers', async (req, res) => {
    try {
        const { customers } = req.body;
        const { professionistId, groupId } = req.params;

        console.log('Request params:', { professionistId, groupId });
        console.log('Customers to add:', customers);

        // Find professionist and populate customersList
        const professionist = await Professionists.findById(professionistId)
            .populate('customersList.user');

        if (!professionist) {
            return res.status(404).json({
                message: 'Professionista non trovato',
                professionistId
            });
        }

        // Find the specific group
        const group = professionist.customerGroups.id(groupId);
        if (!group) {
            return res.status(404).json({
                message: 'Gruppo non trovato',
                groupId
            });
        }

        // Check which customers are valid and active
        const activeCustomers = professionist.customersList
            .filter(entry => entry.status === 'active')
            .map(entry => entry.user._id.toString());

        console.log('Active customers:', activeCustomers);

        const validCustomers = customers.filter(customerId =>
            activeCustomers.includes(customerId)
        );

        console.log('Valid customers to add:', validCustomers);

        if (validCustomers.length === 0) {
            return res.status(400).json({
                message: 'Nessun cliente valido da aggiungere',
                providedCustomers: customers,
                activeCustomers: activeCustomers
            });
        }

        if (validCustomers.length !== customers.length) {
            console.log('Some customers were invalid:',
                customers.filter(id => !validCustomers.includes(id))
            );
        }

        // Add new customers avoiding duplicates
        const existingCustomers = group.customers.map(c => c.toString());
        const newCustomers = validCustomers.filter(id => !existingCustomers.includes(id));

        group.customers = [...existingCustomers, ...newCustomers];

        await professionist.save();

        // Populate customer details before sending response
        await professionist.populate('customerGroups.customers', 'firstName lastName email');

        res.json({
            message: 'Clienti aggiunti al gruppo con successo',
            addedCustomers: newCustomers.length,
            totalCustomers: group.customers.length,
            group: professionist.customerGroups.id(groupId)
        });

    } catch (err) {
        console.error('Error adding customers to group:', err);
        res.status(500).json({
            message: 'Errore nell\'aggiunta dei clienti al gruppo',
            error: err.message
        });
    }
});

// Add workout to a group
router.post('/:professionistId/groups/:groupId/workout', async (req, res) => {
    try {
        const { title, label, note, weeks } = req.body;
        const { professionistId, groupId } = req.params;

        // Validate required fields
        if (!title || !label) {
            return res.status(400).json({
                message: 'Campi obbligatori mancanti. Necessari: title, label'
            });
        }

        const professionist = await Professionists.findById(professionistId);
        if (!professionist) {
            return res.status(404).json({
                message: 'Professionista non trovato'
            });
        }

        const group = professionist.customerGroups.id(groupId);
        if (!group) {
            return res.status(404).json({
                message: 'Gruppo non trovato'
            });
        }

        // Create individual workouts for each user in the group
        const createdWorkouts = [];
        for (const userId of group.customers) {
            const workout = new Workout({
                title,
                label,
                note: note || '',
                weeks: weeks || [],
                user: userId,       
                type: 'group',
                status: 'active'
            });

            await workout.save();
            createdWorkouts.push(workout._id);

            // Update user's training plans
            const user = await User.findById(userId);
            if (user) {
                if (!user.trainingPlans) {
                    user.trainingPlans = [];
                }
                user.trainingPlans.push(workout._id);
                user.trainingPlan = true;
                await user.save();
            }
        }

        // Add workout references to group's trainings
        group.trainings.push(...createdWorkouts);
        await professionist.save();

        // Populate workout details before sending response
        const populatedWorkouts = await Workout.find({
            '_id': { $in: createdWorkouts }
        }).populate([
            { path: 'user', select: 'firstName lastName email' }
        ]);

        res.status(201).json({
            message: 'Piano di allenamento creato e aggiunto a tutti gli utenti del gruppo con successo',
            workouts: populatedWorkouts,
            addedToUsers: createdWorkouts.length
        });

    } catch (err) {
        console.error('Error creating group workout plans:', err);
        res.status(400).json({
            message: 'Errore nella creazione dei piani di allenamento per il gruppo',
            error: err.message
        });
    }
});

// Delete a workout from a group
router.delete('/:professionistId/groups/:groupId/workout/:workoutId', async (req, res) => {
    try {
        const { professionistId, groupId, workoutId } = req.params;

        const professionist = await Professionists.findById(professionistId);
        if (!professionist) {
            return res.status(404).json({ message: 'Professionista non trovato' });
        }

        const group = professionist.customerGroups.id(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Gruppo non trovato' });
        }

        group.trainings = group.trainings.filter(id => id.toString() !== workoutId);
        await professionist.save();

        res.json({ message: 'Allenamento rimosso dal gruppo con successo' });

    } catch (err) {
        res.status(500).json({
            message: 'Errore nella rimozione dell\'allenamento dal gruppo',
            error: err.message
        });
    }
});

module.exports = router;
