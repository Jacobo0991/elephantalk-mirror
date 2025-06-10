import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const authOptions = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                username: {},
                password: {},
            },
            async authorize(credentials) {
                // get the access token from the API
                const loginResponse = await fetch(`${BASE_URL}/auth/login/admin`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: credentials.username,
                        password: credentials.password,
                    }),
                });

                if (!loginResponse.ok) {
                    return null;
                }

                const { access_token } = await loginResponse.json();

                // get the user info from the API
                const userResponse = await fetch(`${BASE_URL}/auth/whoami`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });

                if (!userResponse.ok) {
                    return null;
                }

                const { data: user } = await userResponse.json();

                return {
                    ...user,
                    access_token,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.access_token;
                token.sub = user._id;
                token.name = user.name;
                token.lastname = user.lastname;
            }

            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.sub,
                    name: token.name,
                    lastname: token.lastname,
                };
                session.accessToken = token.accessToken;
            }

            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
