const Employee = require("./employee")

class Manager extends Employee {
    constructor(name, id, email, officeNumber) {
        super(name, id, email)
        this.officeNumber = officeNumber;
    }

    get_role() {
        return "Manager"
    }

    get_officeNumber() {
        return this.officeNumber;
    }

}

module.exports = Manager;