const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authentication.split(" ")[1];
        jwt.verify(token, process.env.JWT_KEY || "raghav_garg_first_mean_project_this_can_be_anything");
        // req.userData={id:localStorage.getItem('Id').split(' ')[1]};
        next();
    } catch (error) {
        res.status(401).json({
            message: 'Auth Failed',
        })
    }
};


// Importing the jsonwebtoken library to handle JWT operations.

// Defining middleware to authenticate incoming requests.

// Extracting the JWT token from the authentication header, assuming it's in the format Bearer <token>.

// Verifying the extracted token using a secret key stored in environment variables (JWT_KEY).

// (Commented out) An attempt to attach user data to the request object using data from localStorage.

// If token verification succeeds, the request proceeds to the next middleware or route handler.

// If verification fails, a 401 Unauthorized response with the message "Auth Failed" is sent.n