const express = require( "express" );
const router = express.Router();

const statusCTRL = require( "../controllers/statusCTRL.js" );

router.get( "/all/" , statusCTRL.all );
// router.get( "/restart-pm2/" , specialCTRL.restartPM2 );
// router.get( "/tv-power/" , specialCTRL.tvPower );

// router.put( "/os/:task" , specialCTRL.osCommand  );

module.exports = router;