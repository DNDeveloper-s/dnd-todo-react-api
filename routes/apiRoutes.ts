import * as express from 'express';
import {
	getAppData,
	getCurrentUser,
	getNotifications,
	handleUserSearch,
	postAppGlobalData,
	updateNotificationStatus,
	validateToken
} from "../controllers/apiController";
import isAuth from '../middleware/isAuth';

const apiRoutes = express.Router();

// apiRoutes.get('/user', getUser);
apiRoutes.get('/current-user', isAuth, getCurrentUser);
apiRoutes.get('/user-app-data', isAuth, getAppData);
apiRoutes.get('/notifications', isAuth, getNotifications);
apiRoutes.post('/user-search', isAuth, handleUserSearch);
apiRoutes.post('/app-global-data', isAuth, postAppGlobalData);
apiRoutes.post('/validate-token', validateToken);
apiRoutes.post('/update-notification-status', updateNotificationStatus);
// apiRoutes.post('/recipe', createRecipe);
// apiRoutes.post('/ingredient', createIngredient);

export default apiRoutes;
