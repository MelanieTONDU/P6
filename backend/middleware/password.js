var passwordValidator = require('password-validator');

var passwordSchema = new passwordValidator();

passwordSchema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(1)                                // Must have at least 1 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)){
        next();
    }
    else {
        return res.status(400).json({ error: `Mot de passe trop faible ! ${passwordSchema.validate('req.body.password', {list: true})}`});
    }
}