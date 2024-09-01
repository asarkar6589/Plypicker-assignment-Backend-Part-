export interface UserRegistration {
    _id: string
    email: string;
    password: string;
    role: "Admin" | "User"
}

export interface LoginUser {
    email: string;
    password: string;
}