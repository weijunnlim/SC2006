
class Authentication {
    constructor(email, password, userType, last_login)
    {
        this.email = email;
        this.password = password;
        this.userType = userType;
        this.last_login = last_login;
    }
}

module.exports = Authentication;