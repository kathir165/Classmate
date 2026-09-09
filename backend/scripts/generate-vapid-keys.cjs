// Generates a VAPID key pair for Web Push, using only Node's built-in
// crypto module — no dependencies required, so you can run this before
// even running `npm install`.
//
// Usage: node scripts/generate-vapid-keys.js

const crypto = require("crypto");

function base64url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const pubJwk = publicKey.export({ format: "jwk" });
const privJwk = privateKey.export({ format: "jwk" });

const x = Buffer.from(pubJwk.x, "base64url");
const y = Buffer.from(pubJwk.y, "base64url");
const publicKeyRaw = Buffer.concat([Buffer.from([0x04]), x, y]); // uncompressed EC point

console.log("\nAdd these to backend/.env:\n");
console.log(`VAPID_PUBLIC_KEY=${base64url(publicKeyRaw)}`);
console.log(`VAPID_PRIVATE_KEY=${privJwk.d}`);
console.log(`VAPID_SUBJECT=mailto:you@example.com\n`);
