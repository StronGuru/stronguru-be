const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Professional = require('../models/discriminators/Professional');
const auth = require('../middleware/auth');
const { filterValidSpecializations, assignSpecToProfessional } = require('../helpers/SpecValidation');
const UserDevices = require('../models/UserDevices');
const UserSettings = require('../models/UserSettings');
const { USER_ROLES } = require('../constants/userRoles');
const authorizeRoles = require('../middleware/authorizedRoles');

/**
 * @swagger
 * components:
 *   schemas:
 *     Professional:
 *       allOf:
 *       - $ref: '#/components/schemas/User'
 *       - type: object
 *         properties:
 *           specializations:
 *             type: array
 *             items:
 *               type: string
 *           contactEmail:
 *             type: string
 *           pIva:
 *             type: string
 *         example:
 *           _id: "64f9c9b3f2e7aa5f4d8c101a"
 *           firstName: "Mario"
 *           lastName: "Rossi"
 *           email: "mario@coach.com"
 *           role: "professional"
 *           gender: "male"
 *           dateOfBirth: "1988-07-22"
 *           phone: "‪+390112223344‬"
 *           specializations: ["trainer", "psychologist"]
 *           contactEmail: "mario@coach.com"
 *           pIva: "IT12345678901"
 */


//##### GET #####
/**
 * @swagger
 * /professionals/professional/{id}:
 *   get:
 *     summary: Recupera un professionista per ID (senza la password)
 *     description: Recupera i dettagli di un professionista escludendo il campo password.
 *     operationId: getProfessionalById
 *     tags:
 *       - Professional
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: L'ID del professionista da recuperare.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Professionista recuperato con successo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: L'ID del professionista.
 *                 firstName:
 *                   type: string
 *                   description: Nome del professionista.
 *                 lastName:
 *                   type: string
 *                   description: Cognome del professionista.
 *                 email:
 *                   type: string
 *                   description: Email del professionista.
 *                 role:
 *                   type: string
 *                   description: Ruolo del professionista (ad esempio, 'PROFESSIONAL').
 *                 phone:
 *                   type: string
 *                   description: Numero di telefono del professionista.
 *                 gender:
 *                   type: string
 *                   description: Genere del professionista.
 *                 dateOfBirth:
 *                   type: string
 *                   format: date
 *                   description: Data di nascita del professionista.
 *       '404':
 *         description: Professionista non trovato.
 *       '500':
 *         description: Errore interno del server.
 */

// GET - Recupera un professionista per ID
router.get('/professional/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Trova il professionista per ID e escludi la password dal risultato
    const professional = await Professional.findById(id).select('-password'); // '-password' esclude la password

    if (!professional) {
      return res.status(404).json({ message: 'Professionista non trovato' });
    }

    res.status(200).json(professional);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore del server' });
  }
});

/**
 * @swagger
 * /professionals:
 *   get:
 *     summary: Retrieve all registered professionals
 *     tags: [Professional]
 *     description: Returns a list of all professionals in the system. Admin access only.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of professionals successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Professional'
 *       401:
 *         description: Unauthorized – Missing or invalid token
 *       403:
 *         description: Forbidden – Admin access required
 *       500:
 *         description: Server error
 */

router.get('/', authorizeRoles(USER_ROLES.ADMIN), async (req, res) => {
    try {
        const professionals = await Professional.find().select('-password');
        res.status(200).json(professionals);
    } catch (err) {
        console.error('Error retrieving professionals:', err);
        res.status(500).json({ message: 'Server error'});
    }
});


module.exports = router;

// ##### PUT #####
/**
 * @swagger
 * /professionals/professional/{id}:
 *   put:
 *     summary: Aggiorna i dati modificabili di un professionista (esclusa la password)
 *     tags:
 *       - Professional
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del professionista da aggiornare
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Nome del professionista
 *               lastName:
 *                 type: string
 *                 description: Cognome del professionista
 *               gender:
 *                 type: string
 *                 description: Genere
 *               phone:
 *                 type: string
 *                 description: Numero di telefono
 *               biography:
 *                 type: string
 *                 description: Biografia o descrizione
 *               profileImg:
 *                 type: string
 *                 description: URL immagine profilo
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   instagram:
 *                     type: string
 *                   facebook:
 *                     type: string
 *                   linkedin:
 *                     type: string
 *                   tiktok:
 *                     type: string
 *                   youtube:
 *                     type: string
 *                 description: Link ai social
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   cap:
 *                     type: string
 *                   province:
 *                     type: string
 *                   country:
 *                     type: string
 *                 description: Indirizzo del professionista
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specializzazioni (es. NUTRITIONIST, PSYCHOLOGIST...)
 *               contactEmail:
 *                 type: string
 *                 description: Email professionale per contatti
 *               contactPhone:
 *                 type: string
 *                 description: Numero di telefono per contatti
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lingue parlate
 *               expStartDate:
 *                 type: string
 *                 format: date
 *                 description: Data inizio attività professionale
 *               professionalExp:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Esperienze professionali
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Certificazioni ottenute
 *     responses:
 *       '200':
 *         description: Profilo aggiornato con successo
 *       '400':
 *         description: Nessun campo valido fornito per l'aggiornamento
 *       '403':
 *         description: Non autorizzato
 *       '404':
 *         description: Professionista non trovato
 *       '500':
 *         description: Errore del server
 */


// PUT - Aggiorna i dati modificabili del profesionista
router.put('/professional/:id', async (req, res) => {
  try {
    const professionalId = req.params.id;

    //verifica che l'utente stia modificando se stesso
    if (req.user._id.toString() !== professionalId) {
      return res.status(403).json({ message: 'Non autorizzato a modificare questo profilo' });
    }

    const updatableFields = {
      firstName,
      lastName,
      gender,
      phone,
      biography,
      specializations,
      contactEmail,
      contactPhone,
      languages,
      address,
      professionalExp,
      expStartDate,
      certifications,
      profileImg,
      socialLinks
    } = req.body;

    //se nessun campo valido è presente --> errore 400
    const hasAtLeastOneField = Object.values(updatableFields).some(value=> value !== undefined);
    if (!hasAtLeastOneField) {
      return res.status(400).json({ message: 'Nessun campo valido fornito' });
    }

    const professional = await Professional.findById(professionalId);
    if (!professional) return res.status(404).json({ message: 'Professionista non trovato' });

    //aggiorna solo i campi presenti nel body
    if (firstName) professional.firstName = firstName;
    if (lastName) professional.lastName = lastName;
    if (gender) professional.gender = gender;
    if (phone) professional.phone = phone;
    if (biography) professional.biography = biography;
    if (contactEmail) professional.contactEmail = contactEmail;
    if (contactPhone) professional.contactPhone = contactPhone;
    if (languages) professional.languages = languages;
    if (address) professional.address = address;
    if (professionalExp) professional.professionalExp = professionalExp;
    if (expStartDate) professional.expStartDate = expStartDate;
    if (certifications) professional.certifications = certifications;
    if (profileImg) professional.profileImg = profileImg;
    if (socialLinks) professional.socialLinks = socialLinks;

    //gestione specializzazioni
    if (specializations && specializations.length > 0) {
      const validSpecs = filterValidSpecializations(specializations);
      professional.specializations = validSpecs;
      await assignSpecToProfessional(validSpecs, professionalId);
    }

    await professional.save();

    res.status(200).json({ message: 'Profilo aggiornato con successo', professionalId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore durante l'aggiornamento del profilo" });
  }
});

/**
 * @swagger
 * /professionals/professional/{id}/password:
 *   put:
 *    summary: Cambia la password del professionista
 *    tags:
 *      - Professional
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: ID del professionista
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - oldPassword
 *              - newPassword
 *            properties:
 *              oldPassword:
 *                type: string
 *                description: Vecchia password del professionista
 *              newPassword:
 *                type: string
 *                description: Nuova password del professionista
 *    responses:
 *      '200':
 *        description: Password aggiornata con successo
 *      '400':
 *        description: Parametri mancanti
 *      '401':
 *        description: Vecchia password errata
 *      '403':
 *        description: Non autorizzato
 *      '404':
 *        description: Professionista non trovato
 *      '500':
 *        description: Errore del server
 */

// PUT - modifica password
router.put('/professional/:id/password', async (req, res) => {
  try {
    const professionalId = req.params.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Fornire la vecchia password e la nuova password' });
    }

    //verifica che l'utente stia modificando se stesso
    if (req.user._id.toString() !== professionalId) {
      return res.status(403).json({ message: 'Non autorizzato a modificare questo profilo' });
    }

    const professional = await Professional.findById(professionalId);
    if (!professional) return res.status(404).json({ message: 'Professionista non trovato' });

    //verifica vecchia password
    const isMatch = await bcrypt.compare(oldPassword, professional.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Vecchia password non corretta' });
    }

    //gestione nuova password
    professional.password = newPassword;
    await professional.save();

    await UserDevices.deleteMany({user: professionalId});

    res.status(200).json({ message: 'Profilo aggiornato con successo', professionalId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore durante l'aggiornamento del profilo" });
  }
});

//##### DELETE #####
/**
 * @swagger
 * /professionals/professional/{id}:
 *   delete:
 *     summary: Elimina un account professionista (richiede conferma password)
 *     tags:
 *       - Professional
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del professionista da eliminare
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Password dell'account per conferma
 *     responses:
 *       '200':
 *         description: Account professionista eliminato con successo
 *       '400':
 *         description: Password mancante
 *       '401':
 *         description: Password errata
 *       '403':
 *         description: Non autorizzato
 *       '404':
 *         description: Professionista non trovato
 *       '500':
 *         description: Errore del server
 */


//DELETE - Elimina un professionista
router.delete('/professional/:id', async (req, res) => {
  try {
    const models = {
      nutritionist: require('../models/Nutritionist'),
      trainer: require('../models/Trainer'),
      psychologist: require('../models/Psychologist')
    };
    const professionalId = req.params.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "La password è richiesta per eliminare l'account" });
    }

    if (req.user._id.toString() !== professionalId) {
      return res.status(403).json({ message: 'Non autorizzato a eliminare questo profilo' });
    }

    const professional = await Professional.findById(professionalId);
    if (!professional) return res.status(404).json({ message: 'Professionista non trovato' });

    const isMatch = await bcrypt.compare(password, professional.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password errata. Eliminazione account annullata' });
    }
     // Itera sulle specializzazioni ed elimina i documenti
     for (let specializationName of professional.specializations) {
      const normalized = specializationName.toLowerCase();
      const Model = models[normalized];
      if (Model) {
        await Model.deleteMany({ professional: professional._id });
        console.log(`Eliminati ${normalized} per il professional ${professional._id}`);
      } else {
        console.warn(`Modello per ${normalized} non trovato`);
      }
    }

    await Professional.findByIdAndDelete(professionalId);

    await UserDevices.deleteMany({user: professionalId});

    await UserSettings.deleteMany({user: professionalId});

    res.status(200).json({ message: 'Account professionista eliminato con successo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore durante l'eliminazione dell'account" });
  }
});

module.exports = router;