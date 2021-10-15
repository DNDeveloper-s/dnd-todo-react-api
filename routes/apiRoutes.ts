import * as express from 'express';
import {
	getAppData,
	getCurrentUser,
	getNotifications,
	handleUserSearch,
	postAppGlobalData,
	replyToTwilo,
	updateNotificationStatus,
	validateToken
} from "../controllers/apiController";
import isAuth from '../middleware/isAuth';

const apiRoutes = express.Router();

// apiRoutes.get('/user', getUser);

/**
 * @swagger
 * tags:
 *   - name: API
 *     description: Some generic apis for the todo-react helper functions
 */

/**
 * @swagger
 * /users:
 *   get:
 *     description: Returns users
 *     tags: [API]
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: users
 */

/**
 * @swagger
 * /login:
 *   post:
 *     description: Login to the application
 *     tags: [API]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: login
 *         schema:
 *           type: object
 */

/**
 *
 */


apiRoutes.get('/current-user', isAuth, getCurrentUser);
apiRoutes.get('/user-app-data', isAuth, getAppData);
apiRoutes.get('/notifications', isAuth, getNotifications);
apiRoutes.post('/user-search', isAuth, handleUserSearch);
apiRoutes.post('/app-global-data', isAuth, postAppGlobalData);
apiRoutes.post('/validate-token', validateToken);
apiRoutes.post('/update-notification-status', updateNotificationStatus);

// apiRoutes.post('/sms', replyToTwilo);
// apiRoutes.post('/recipe', createRecipe);
// apiRoutes.post('/ingredient', createIngredient);

export default apiRoutes;
