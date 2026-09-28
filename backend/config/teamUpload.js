const multer = require("multer");
const path = require("path");
const fs = require("fs");

const projectRoot = path.join(__dirname, "..", "..");

const teamUploadPath = path.join(
    projectRoot,
    "backend",
    "uploads",
    "teams"
);

const playerUploadPath = path.join(
    projectRoot,
    "backend",
    "uploads",
    "player-photos"
);

fs.mkdirSync(teamUploadPath, { recursive: true });
fs.mkdirSync(playerUploadPath, { recursive: true });


const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        if (file.fieldname === "teamLogo") {

            cb(null, teamUploadPath);

        }

        else if (
            file.fieldname.startsWith("playerPhoto")
        ) {

            cb(null, playerUploadPath);

        }

        else {

            cb(
                new Error(
                    "Invalid upload field."
                )
            );

        }

    },


    filename: function (req, file, cb) {

        const extension =
            path.extname(file.originalname);

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1e9
            ) +
            extension;

        cb(null, uniqueName);

    }

});


const fileFilter =
    function (req, file, cb) {

        const allowedTypes = [
            "image/jpeg",
            "image/png"
        ];

        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(null, true);

        }

        else {

            cb(
                new Error(
                    "Only JPG and PNG images are allowed."
                )
            );

        }

    };


const upload =
    multer({

        storage: storage,

        fileFilter: fileFilter,

        limits: {
            fileSize: 2 * 1024 * 1024
        }

    });


module.exports = upload;