const passport = require("passport");
const OIDCStrategy = require("passport-azure-ad").OIDCStrategy;
require("dotenv").config();

passport.use(
  new OIDCStrategy(
    {
      identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.AZURE_CLIENT_ID,
      responseType: "code id_token",
      responseMode: "form_post",
      redirectUrl: process.env.AZURE_REDIRECT_URI,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      allowHttpForRedirectUrl: true,
      validateIssuer: false,
      scope: ["openid", "profile", "email"],
    },
    (iss, sub, profile, accessToken, refreshToken, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;
