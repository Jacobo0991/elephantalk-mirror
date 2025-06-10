/**
 * @description Public routes that can be accessed by anyone
 */
export const publicRoutes = [
  "/public",
]


/**
 * @description Auth routes that can be accessed by anyone.
 * This routes will redirect to "/" if the user is already logged in.
 */
export const authRoutes = [
  "/login",
]

/**
 * @description Prefix use for API authentication routes. 
 * The routes that start with this prefix are used for authentication purposes.
 */
export const apiAuthPrefix = "/api/auth"

/**
 * @description Default redirect path after login.
 */
export const DEFAULT_LOGIN_REDIRECT = "/"  