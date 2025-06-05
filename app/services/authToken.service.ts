import { Request, RequestHandler } from "express";
import jwt , { JwtPayload }  from "jsonwebtoken";
import { get } from "../config/config";


const config = get(process.env.NODE_ENV);

// Define an interface for the authenticated request
// This interface extends the Request object to include a user property
// which can be a string or a JwtPayload (the decoded JWT).
// This allows us to access the user information in subsequent middleware or controllers.
interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}


/* VERIFY AUTH TOKEN */
const verifyAuthToken: RequestHandler = (req, res, next) => {
  const token = req.header("token");

  if (!token) {
    res.status(403).json({ message: "Unauthorized User" });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.SECURITY_TOKEN as string);
    (req as AuthenticatedRequest).user = decoded;
    next(); 
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

/* GENERATE AUTH TOKEN */
const generateAuthToken = (user: any) => {
    console.log('Token generated!');
    const tokenExpiration = '1d';
    const payload = {
        id: user.user_id,
        email: user.email,
    };
    return jwt.sign(payload, config.SECURITY_TOKEN as string, { expiresIn: config.TOKEN_EXPIRES_IN });
};

/* GENERATE REFRESH AUTH TOKEN */
const generateRefreshAuthToken = (user: any) => {
    console.log('Refresh token generated!');
    const refreshTokenExpiration = '7d';
    const payload = {
        id: user.user_id,
        email: user.email,
    };

    return jwt.sign(payload, config.SECURITY_TOKEN as string, { expiresIn: config.REFRESH_TOKEN_EXPIRES_IN });
};

export const authToken = {
    generateAuthToken,
    generateRefreshAuthToken,
    verifyAuthToken
};