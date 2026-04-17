import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from './prisma.js';
import { env } from './env.js';
import logger from './logger.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const providerId = profile.id;

        let user = await prisma.user.findUnique({
          where: { email },
          include: { oauthAccounts: true },
        });

        if (!user) {

          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              avatar: profile.photos[0]?.value,
              isVerified: true, 
              oauthAccounts: {
                create: {
                  provider: 'google',
                  providerAccountId: providerId,
                  accessToken,
                  refreshToken,
                },
              },
            },
            include: { oauthAccounts: true },
          });
        } else {

          const oauthAccount = user.oauthAccounts.find(
            (acc) => acc.provider === 'google' && acc.providerAccountId === providerId
          );

          if (!oauthAccount) {
            await prisma.oauthAccount.create({
              data: {
                userId: user.id,
                provider: 'google',
                providerAccountId: providerId,
                accessToken,
                refreshToken,
              },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        logger.error(`Google Strategy Error: ${error.message}`);
        return done(error, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackURL: env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const providerId = profile.id.toString();

        let user = await prisma.user.findUnique({
          where: { email },
          include: { oauthAccounts: true },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || profile.username,
              avatar: profile.photos[0]?.value,
              isVerified: true,
              oauthAccounts: {
                create: {
                  provider: 'github',
                  providerAccountId: providerId,
                  accessToken,
                  refreshToken,
                },
              },
            },
            include: { oauthAccounts: true },
          });
        } else {
          const oauthAccount = user.oauthAccounts.find(
            (acc) => acc.provider === 'github' && acc.providerAccountId === providerId
          );

          if (!oauthAccount) {
            await prisma.oauthAccount.create({
              data: {
                userId: user.id,
                provider: 'github',
                providerAccountId: providerId,
                accessToken,
                refreshToken,
              },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        logger.error(`GitHub Strategy Error: ${error.message}`);
        return done(error, null);
      }
    }
  )
);

export default passport;
