// import React, { useState, useEffect } from "react";
// import { decryptData, encryptData } from "../lib/cryptoUtils";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";

// const EncryptionText = () => {
//   const [plainText, setPlainText] = useState<string>("");
//   const [encryptedText, setEncryptedText] = useState<any>(null);
//   const [decryptedText, setDecryptedText] = useState<string | null>(null);

//   // Handle the encryption process
//   const handleEncryption = async () => {
//     try {
//       const encrypted = await encryptData(plainText);
//       setEncryptedText(encrypted); // Save encrypted text to state
//     } catch (error) {
//       console.error("Encryption failed:", error);
//     }
//   };

//   // Handle the decryption process
//   const handleDecryption = async () => {
//     if (!encryptedText) return;

//     try {
//       const decrypted = await decryptData(JSON.stringify(encryptedText));
//       setDecryptedText(decrypted); // Save decrypted text to state
//     } catch (error) {
//       console.error("Decryption failed:", error);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2>Test Encryption and Decryption</h2>

//       {/* Input for plain text */}
//       <div className="mb-4">
//         <Input
//           type="text"
//           value={plainText}
//           onChange={(e) => setPlainText(e.target.value)}
//           placeholder="Enter text to encrypt"
//           className="p-2 border border-gray-300 rounded"
//         />
//       </div>

//       {/* Button to encrypt text */}
//       <Button
//         onClick={handleEncryption}
//         className="bg-blue-500 text-white p-2 rounded mr-2"
//       >
//         Encrypt Text
//       </Button>

//       {/* Button to decrypt the encrypted text */}
//       <Button
//         onClick={handleDecryption}
//         className="bg-green-500 text-white p-2 rounded"
//         disabled={!encryptedText}
//       >
//         Decrypt Text
//       </Button>

//       {/* Display encrypted text */}
//       {encryptedText && (
//         <div className="mt-4">
//           <h3>Encrypted Text:</h3>
//           <pre>{JSON.stringify(encryptedText, null, 2)}</pre>
//         </div>
//       )}

//       {/* Display decrypted text */}
//       {decryptedText && (
//         <div className="mt-4">
//           <h3>Decrypted Text:</h3>
//           <p>{decryptedText}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EncryptionText;
