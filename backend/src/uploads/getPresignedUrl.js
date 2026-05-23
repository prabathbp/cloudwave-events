const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({ region: "ap-southeast-1" });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

module.exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const body = JSON.parse(event.body);
    const fileName = `${uuidv4()}-${body.fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      ContentType: body.contentType
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // Returns CloudFront URL instead of direct S3 URL
    const CLOUDFRONT_DOMAIN = "https://d2fq3ggoqy2oph.cloudfront.net";

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        uploadUrl,
        fileUrl: `${CLOUDFRONT_DOMAIN}/${fileName}`
      })
    };
  } catch (error) {
    console.log("getPresignedUrl error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};
