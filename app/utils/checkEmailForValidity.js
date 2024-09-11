export default function checkEmail(email) {
	// Trim the email input to remove unnecessary whitespaces
	const trimmedEmail = email.trim();

	// Simple and readable regex for basic email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	// Test the email against the regex
	return emailRegex.test(trimmedEmail);
}
