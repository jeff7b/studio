import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AUTH_AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AUTH_AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AUTH_AZURE_AD_TENANT_ID || "",
      // Optionally, you can define the scope:
      // authorization: { params: { scope: "openid profile email User.Read" } },
    }),
  ],
  secret: process.env.AUTH_SECRET || "",
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile?.oid; // OID is often used as a unique identifier for Azure AD users
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      if (token.id && session.user) {
        (session.user as any).id = token.id;
      }
      // Note: To add custom properties like 'role', you'd typically fetch them here
      // using the accessToken or id, and add them to the session.user object.
      // This example does not include role population.
      return session;
    },
  },
  // You can add custom pages here if needed
  // pages: {
  //   signIn: '/auth/signin',
  // },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
