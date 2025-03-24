const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');

// Get all events for a user
router.get('/:userId/events', async (req, res) => {
    try {
        const events = await Event.find({ user: req.params.userId })
            .sort({ date: 1, time: 1 })
            .lean();

        if (!events) {
            return res.status(404).json({ message: 'Nessun evento trovato' });
        }

        const formattedEvents = events.map(event => ({
            ...event,
            date: new Date(event.date).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
        }));

        res.json(formattedEvents);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({
            message: 'Errore nel recupero degli eventi',
            error: err.message
        });
    }
});

// Get events by date using query parameter
router.get('/events', async (req, res) => {
    try {
        const { date, userId } = req.query;
        
        if (!date || !userId) {
            return res.status(400).json({
                message: 'Data e userId sono parametri richiesti'
            });
        }

        const searchDate = new Date(date);
        // Set time to start of day
        searchDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(searchDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const events = await Event.find({
            user: userId,
            date: {
                $gte: searchDate,
                $lt: nextDay
            }
        }).sort({ time: 1 }).lean();

        if (!events || events.length === 0) {
            return res.status(404).json({
                message: 'Nessun evento trovato per questa data'
            });
        }

        const formattedEvents = events.map(event => ({
            ...event,
            date: new Date(event.date).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
        }));

        res.json(formattedEvents);
    } catch (err) {
        console.error('Error fetching events by date:', err);
        res.status(500).json({
            message: 'Errore nel recupero degli eventi',
            error: err.message
        });
    }
});

// Add new event
router.post('/:userId/events', async (req, res) => {
    try {
        const { title, patientName, patientId, date, time, notes } = req.body;

        // Validate required fields
        if (!title || !patientName || !patientId || !date || !time) {
            return res.status(400).json({
                message: 'Campi obbligatori mancanti. Necessari: title, patientName, patientId, date, time'
            });
        }

        // Create new event
        const event = new Event({
            title,
            patientName,
            patientId,
            date: new Date(date),
            time,
            notes: notes || '',
            user: req.params.userId,
            status: 'scheduled'
        });

        await event.save();

        // Get patient email from User model
        const patient = await User.findById(patientId);
        if (!patient || !patient.email) {
            console.error('Patient email not found');
            // Continue with event creation even if email sending fails
        } else {
            // Format date for email
            const formattedDate = new Date(date).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Setup email data
            const msg = {
                to: patient.email,
                from: process.env.SENDGRID_VERIFIED_SENDER,
                subject: 'Nuovo Appuntamento Confermato - Sporty',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #0078d7;">Appuntamento Confermato</h1>
                        <p>Ciao ${patient.firstName},</p>
                        <p>Il tuo appuntamento è stato confermato con i seguenti dettagli:</p>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Titolo:</strong> ${event.title}</p>
                            <p><strong>Data e Ora:</strong> ${formattedDate} ${event.time}</p>
                            ${event.notes ? `<p><strong>Note:</strong> ${event.notes}</p>` : ''}
                        </div>
                        <p>Per qualsiasi modifica o cancellazione, contatta il tuo professionista.</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #666; font-size: 12px;">
                            Questa è un'email automatica, per favore non rispondere.
                        </p>
                    </div>
                `
            };

            try {
                await sgMail.send(msg);
                console.log('Appointment confirmation email sent');
            } catch (emailError) {
                console.error('Error sending appointment email:', emailError);
                // Continue with event creation even if email sending fails
            }
        }

        // Format the response
        const formattedEvent = {
            ...event.toObject(),
            date: new Date(event.date).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
        };

        res.status(201).json({
            message: 'Evento creato con successo',
            event: formattedEvent
        });
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(400).json({
            message: 'Errore nella creazione dell\'evento',
            error: err.message
        });
    }
});

// Modify event
router.put('/:userId/events/:eventId', async (req, res) => {
    try {
        const { title, patientName, date, time, notes, status } = req.body;
        const { userId, eventId } = req.params;

        // Find event and ensure it belongs to the user
        const event = await Event.findOne({
            _id: eventId,
            user: userId
        });

        if (!event) {
            return res.status(404).json({ message: 'Evento non trovato' });
        }

        // Update fields if provided
        if (title) event.title = title;
        if (patientName) event.patientName = patientName;
        if (date) event.date = new Date(date);
        if (time) event.time = time;
        if (notes !== undefined) event.notes = notes;
        if (status) event.status = status;

        await event.save();

        // Format the response
        const formattedEvent = {
            ...event.toObject(),
            date: new Date(event.date).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
        };

        res.json({
            message: 'Evento modificato con successo',
            event: formattedEvent
        });
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(400).json({
            message: 'Errore nella modifica dell\'evento',
            error: err.message
        });
    }
});

// Delete event
router.delete('/:userId/events/:eventId', async (req, res) => {
    try {
        const { userId, eventId } = req.params;

        // Find and ensure the event belongs to the user before deleting
        const event = await Event.findOne({
            _id: eventId,
            user: userId
        });

        if (!event) {
            return res.status(404).json({ 
                message: 'Evento non trovato o non autorizzato' 
            });
        }

        // Get patient details before deleting the event
        const patient = await User.findById(event.patientId);
        if (patient && patient.email) {
            // Format date for email
            const formattedDate = new Date(event.date).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Setup email data
            const msg = {
                to: patient.email,
                from: process.env.SENDGRID_VERIFIED_SENDER,
                subject: 'Appuntamento Cancellato - Sporty',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #0078d7;">Appuntamento Cancellato</h1>
                        <p>Ciao ${event.patientName},</p>
                        <p>Ti informiamo che il seguente appuntamento è stato cancellato:</p>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Titolo:</strong> ${event.title}</p>
                            <p><strong>Data e Ora:</strong> ${formattedDate} ${event.time}</p>
                        </div>
                        <p>Se hai domande, contatta il tuo professionista.</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #666; font-size: 12px;">
                            Questa è un'email automatica, per favore non rispondere.
                        </p>
                    </div>
                `
            };

            try {
                await sgMail.send(msg);
                console.log('Cancellation email sent');
            } catch (emailError) {
                console.error('Error sending cancellation email:', emailError);
                // Continue with event deletion even if email sending fails
            }
        }

        // Delete the event
        await Event.findByIdAndDelete(eventId);

        res.json({ 
            message: 'Evento eliminato con successo',
            deletedEvent: {
                ...event.toObject(),
                date: new Date(event.date).toLocaleDateString('it-IT', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                })
            }
        });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({
            message: 'Errore nella cancellazione dell\'evento',
            error: err.message
        });
    }
});

module.exports = router;
