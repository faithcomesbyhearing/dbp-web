/**
 * Direct selector to the profile state domain
 */
const selectProfileDomain = (state) => state?.profile;

/**
 * Other specific selectors
 */

/**
 * Default selector used by Profile
 */

const makeSelectProfile = selectProfileDomain;

export default makeSelectProfile;
export { selectProfileDomain };
