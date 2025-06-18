import { Request, Response } from "express";
import { fetchAllUsers, registerNewUser } from "../services/userService";

export async function handleGetUsers(req: Request, res: Response) {
  const { orderBy = 'id', order = 'asc', search } = req.query;

  const users = await fetchAllUsers(orderBy as string, order as string, search as string);
  res.json(users);
  // TODOs: error-handling, e.g. query params invalid
  // res.status(400).json({ error: 'Invalid query' });
}

export async function handleCreateUser(req: Request, res: Response) {
  const newUser = await registerNewUser(req.body);
  res.status(201).json(newUser);
  // TODOs: error handling, e.g. email must be unique
}
