const multer = require('multer')
const AWS = require('aws-sdk')
const fs = require('fs')

export const config = {
  api: {
    bodyParser: false,
  },
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})

var upload = multer({ storage: storage })

export default (req, res) => {
  upload.single("profile")(req, res, err => {

    if (err) {
      return res.status(400).send({ message: err.message })
    }

    // Everything went fine.
    const file = req.file;

    // Enter copied or downloaded access ID and secret key here
    const ID = process.env.S3_ACCESS_KEY_ID;
    const SECRET = process.env.S3_SECRET_ACCESS_KEY;

    // The name of the bucket that you have created
    const BUCKET_NAME = process.env.S3_BUCKET_NAME;

    const s3 = new AWS.S3({
        accessKeyId: ID,
        secretAccessKey: SECRET
    });

    const fileContent = fs.readFileSync('./upload/'+file.filename);

    // Setting up S3 upload parameters
    const params = {
        Bucket: BUCKET_NAME+'/test',
        Key: file.filename, // File name you want to save as in S3
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        res.send(`File uploaded successfully. ${data.Location}`);
    });

  })
}
