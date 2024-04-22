const Authentication = require("./authenticationModel");

class Patron extends Authentication {


    constructor(name, dietaryRequirement)
    {
        this.name = name;
        this.dietaryRequirement = dietaryRequirement;

    }
}

module.exports = Patron;