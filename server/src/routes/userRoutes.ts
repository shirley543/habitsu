// --------------
// User endpoints
// --------------
//
// GET    /users    -> Get a list of all users    [Done]
// POST   /users    -> Create a new user          [Done]
// GET    /user/:id -> Get a specific user by ID
// PUT    /user/:id -> Update a specific user
// DELETE /user/:id -> Delete a specific user

import { Router } from "express";
import { handleGetUsers, handleCreateUser } from "../controllers/userController";

const router = Router();

router.get('/', handleGetUsers);
router.post('/', handleCreateUser);

export default router;
