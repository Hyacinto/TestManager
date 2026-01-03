import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
    providers: [
        GitHubProvider({
            clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token?.login) {
                session.user.login = token.login as string;
            }
            return session;
        },
        async jwt({ token, profile }) {
            if (profile && "login" in profile) {
                token.login = profile.login;
            }
            return token;
        }
    }
});

export { handler as GET, handler as POST };

