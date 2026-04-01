import { Request, Response, NextFunction } from "express";
import { z } from "zod"; // alternativ 1

// Middleware för att validera inkommande data utifrån Zod-schemat
export const validate = (schema: z.ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {

        // Validera req.body mot det givna schemat
        const result = schema.safeParse(req.body);

        if(!result.success) {
             res.status(400).json({ error: result.error.issues})
             return
        }

        req.body = result.data // Uppdatera req.body med den validerade och transformerade datat

        // Om validering lyckades
        next();

    }
}

// Auth-schema för validering av email och passwordd

// Alterntiv 1 - Zod fristående schema
export const userSchema = z.object({
    email: z.email({error: "Ogiltig emailadress"}),
    password: z.string()
        .min(8, { error: "Lösenordet måste vara minst 8 tecken långt"})
        .regex(/[A-Z]/, { error: "Lösenordet måste innehålla minst en stor bokstav"})
        .regex(/[a-z]/, { error: "Lösenordet måste innehålla minst en liten bokstav"})
        .regex(/[0-9]/, { error: "Lösenprdet ska innehålla minst en siffrra"})
        .regex(/[@$!%*?&_]/, { error: "Lösenordet måste innehålla minst ett specialtecken"})
})

// Alternativ 2: Använda drizzle egna, d.v.s drizzzle-zod
// import { createInsertSchema } from "drizzle-zod";
// import {users } from "../db/schema";
// const userSchema2 = createInsertSchema(users, {
//       email: z.email({error: "Ogiltig emailadress"}),
//       password: z.string()
//         .min(8, { error: "Lösenordet måste vara minst 8 tecken långt"})
//         .regex(/[A-Z]/, { error: "Lösenordet måste innehålla minst en stor bokstav"})
//         .regex(/[a-z]/, { error: "Lösenordet måste innehålla minst en liten bokstav"})
//         .regex(/[0-9]/, { error: "Lösenprdet ska innehålla minst en siffrra"})
//         .regex(/[@$!%*?&_]/, { error: "Lösenordet måste innehålla minst ett specialtecken"})
// }).omit({id: true})


// TODO:  gör ett postSchema som validerat minst och max antal tecken på title och content