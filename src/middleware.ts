import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login"
    }
});

export const config = {
    matcher: [
        /*
          MINDEN oldal védett,
          kivéve:
          - /login
          - /api/auth/*
          - static fájlok
        */
        "/((?!login|api/auth|_next|favicon.ico).*)"
    ]
};
