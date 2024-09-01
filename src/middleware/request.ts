import { UserRegistration } from "../interfaces/user.js";

declare module "express" {
  interface Request {
    user?: UserRegistration; // Define the user property
  }
}
