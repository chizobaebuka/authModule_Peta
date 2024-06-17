import randomstring from "randomstring";

// Generate a random OTP
export const generateOTP = () => {
  return randomstring.generate({
    length: 6,
    charset: "numeric"
  });
}

// Compare OTPs
export const compareOTP = (receivedOTP, storedOTP) => {
  return receivedOTP === storedOTP;
}