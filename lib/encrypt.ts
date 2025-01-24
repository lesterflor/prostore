/**
 * used to overcome vercel middleware file size limits on vercel deploy pertaining to bcrypt dependency. 
 
 ** IMPORTANT
  This occurs if using built in Neon adapter db provided by Vercel, which then extends the Prisma client to include the Neon adapter. 
  
  I have changed my code to use a different DB and removed the dependency injection in the prisma instance used, which removed the middleware file size issues and warnings about using Edge instead of Node environments.
  
  These utilities would be used to replace instances of bcrypt dependency in this application. Use at your own discretion and set up that you have.
 */

const encoder = new TextEncoder();
const key = new TextEncoder().encode(process.env.ENCRYPTION_KEY); // Retrieve key from env var

// Hash function with key-based encryption
export const hash = async (plainPassword: string): Promise<string> => {
	const passwordData = encoder.encode(plainPassword);

	const cryptoKey = await crypto.subtle.importKey(
		'raw',
		key,
		{ name: 'HMAC', hash: { name: 'SHA-256' } },
		false,
		['sign', 'verify']
	);

	const hashBuffer = await crypto.subtle.sign('HMAC', cryptoKey, passwordData);
	return Array.from(new Uint8Array(hashBuffer))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
};

// Compare function using key from env var
export const compare = async (
	plainPassword: string,
	encryptedPassword: string
): Promise<boolean> => {
	const hashedPassword = await hash(plainPassword);
	return hashedPassword === encryptedPassword;
};
// // Use Web Crypto API compatible with Edge Functions

// const encoder = new TextEncoder();
// const salt = crypto.getRandomValues(new Uint8Array(16)).join('');

// // Hash function
// export const hash = async (plainPassword: string): Promise<string> => {
//   const passwordData = encoder.encode(plainPassword + salt);
//   const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
//   return Array.from(new Uint8Array(hashBuffer))
//     .map((b) => b.toString(16).padStart(2, '0'))
//     .join('');
// };

// // Compare function
// export const compare = async (
//   plainPassword: string,
//   encryptedPassword: string
// ): Promise<boolean> => {
//   const hashedPassword = await hash(plainPassword);
//   return hashedPassword === encryptedPassword;
// };
