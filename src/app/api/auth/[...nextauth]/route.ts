import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions, Provider } from 'next-auth';

const useStubAuth = process.env.NEXT_PUBLIC_STUB_AUTH === 'true';

const providers: Provider[] = [];

if (useStubAuth) {
  providers.push(
    CredentialsProvider({
      name: 'Stubbed Login',
      // We don't need a credentials form, as we will auto-login with a button click.
      credentials: {},
      async authorize(_credentials) {
        console.log('Authenticating with stub user.');
        // This is where you define your mock user data.
        const user = {
          id: 'stub-user-id-123', // This will be mapped to token.sub
          name: 'Local Developer',
          email: 'dev@example.com',
          image: 'https://placehold.co/100x100.png?text=LD',
        };
        // Any object returned will be saved in `user` property of the JWT
        return user;
      },
    })
  );
} else {
  providers.push(
    AzureADProvider({
      clientId: process.env.AUTH_AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AUTH_AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AUTH_AZURE_AD_TENANT_ID || '',
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.AUTH_SECRET || '',
  ...(useStubAuth && { trustHost: true }),
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // This block runs only on initial sign-in
      if (account && user) {
        // For Azure AD, add access token and user's OID to the token
        if (!useStubAuth && profile) {
          (token as any).accessToken = account.access_token;
          (token as any).id = (profile as any).oid;
        }
        // For stubbed auth, add the user's ID from the authorize function
        if (useStubAuth) {
          (token as any).id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // This block runs for every session access
      // Add the custom properties from the token to the session object
      if ((token as any).accessToken) {
        (session as any).accessToken = (token as any).accessToken;
      }
      if ((token as any).id && session.user) {
        (session.user as any).id = (token as any).id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
