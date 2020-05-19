'use strict';

const path = require('path');

const express = require('express');
const router = new express.Router();

router.get('*.html', (req, res) => {
    return res.render(path.join(__dirname, 'view', req.path));
});

router.use('/resources', express.static(path.join(__dirname, 'resources')));

module.exports = router;
