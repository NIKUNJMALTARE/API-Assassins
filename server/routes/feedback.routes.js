const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');

// Submit feedback
router.post('/submit', feedbackController.submitFeedback);

// Get all feedback for an event
router.get('/feedback', feedbackController.getEventFeedback);

// Get all feedback for a specific team in an event
router.get('/event/:eventId/team/:teamId', feedbackController.getTeamFeedback);

module.exports = router;
