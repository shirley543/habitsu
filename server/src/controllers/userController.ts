import { Request, Response } from "express";
import { fetchAllUsers, registerNewUser } from "../services/userService";

export async function handleGetUsers(req: Request, res: Response) {
  const users = await fetchAllUsers();
  res.json(users);
}

export async function handleCreateUser(req: Request, res: Response) {
  const newUser = await registerNewUser(req.body);
  res.status(201).json(newUser)
  // TODOs: confirm correct status code
}
