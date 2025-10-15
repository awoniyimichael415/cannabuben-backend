const crypto = require("crypto");

const secret = "73d2da36efbf780448613807d8ed1b9250db577212d870896fc4b170509c44b4"; // same as in .env

const body = '{"id":1234,"status":"completed","total":"49.99","billing":{"email":"testuser@example.com"},"customer_id":10}';

const signature = crypto.createHmac("sha256", secret).update(body).digest("base64");
console.log("Signature:", signature);
