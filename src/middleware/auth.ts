import { Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
    userId?: number;
}

// Custom middleware som veriferar en JWT från request headern
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {

        // Hämtar bearToken på header (authorization-delen)
        const bearerToken = req.headers.authorization;

        // Är det en Bearer token?
        if(!bearerToken?.startsWith("Bearer ")) {
            res.status(401).json({error: "Ingen token angiven"});
            return;
        }

        // Plocka ut andra delen av strängen, efter mellanruym
        const token = bearerToken.split(" ")[1];

        try {
            // Läser av vår token med vår secret så att vi kan avkoda vår userId
            const payload = jwt.verify(token, JWT_SECRET) as { userId: number}
            
            // Definerar vår userId på request-objektet
            req.userId = payload.userId;

            // Vi kan läsa av token och dekoda en user => auktioriserade
            // Så vi anropar vår next-funktion
            next()
        } catch(error) {
            console.log(error);
            res.status(401).json({eroro: "Ogiltig eller utgången token"});
        }



}