const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            accessToken
          });
        } else {
          user.accessToken = accessToken; // refresh token
          await user.save();
        }

        return done(null, user); // MUST be DB user
      } catch (err) {
        return done(err);
      }
    }
  )
);

// ✅ ONLY STORE USER ID
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// ✅ RESTORE USER FROM DB
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
