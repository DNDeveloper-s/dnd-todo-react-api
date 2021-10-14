const { authenticator } = require('otplib');

// const secret = 'idontmissanyone';
// Alternative:
const secret = 'P45F2UYCHB2AMYIR';
// Note: .generateSecret() is only available for authenticator and not totp/hotp

const token = authenticator.generate(secret);
console.log(token);

try {
  // const isValid = authenticator.check(token, secret);
  // or
  // const isValid = authenticator.verify({ token, secret });
} catch (err) {
  // Possible errors
  // - options validation
  // - "Invalid input - it is not base32 encoded string" (if thiry-two is used)
  // console.error(err);
}
