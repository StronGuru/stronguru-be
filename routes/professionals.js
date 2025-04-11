const express = require('express');
const router = express.Router();
const Professional = require('../models/discriminators/Professional');


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

module.exports = router;