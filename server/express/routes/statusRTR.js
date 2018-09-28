const express = require( "express" );
const router = express.Router();

const statusCTRL = require( "../controllers/statusCTRL.js" );

router.get( "/" , statusCTRL.all );

module.exports = router;