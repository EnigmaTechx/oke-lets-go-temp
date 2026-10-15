# Message to the Developer

You are receiving the current working **OK Let's Go** Expo / React Native prototype.

Please treat the included project as the working baseline and continue from it. The owner has already approved a substantial amount of the Customer and Driver experience, so preserve the existing visual direction and interaction flow unless a change is discussed and approved.

## First actions

1. Extract the package and open `04-WORKING-PROJECT/ok-lets-go-clean`.
2. Create a Git repository/baseline commit of the untouched inherited version.
3. Copy `.env.example` to `.env` and obtain the Google Maps API key securely from the owner.
4. Run `npm ci` and then `npx expo start`.
5. Test the Customer and Driver flows before modifying anything.
6. Continue development from this version.

The project is a prototype and still needs production engineering for backend services, real authentication, payments, dispatch, real-time state, production mapping/navigation, notifications, security, administration, testing, and release infrastructure.

Please do not discard the existing work or rebuild approved screens simply for convenience. Refactor incrementally after the inherited baseline is running.
