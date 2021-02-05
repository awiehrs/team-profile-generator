const fs = require("fs");
const inquire = require("inquirer");
const manager = require("./templates/manager");
const employee = require("./templates/employee")
const intern = require("./templates/intern");
const engineer = require("./templates/engineer");
const cheerio = require("cheerio");
const open = require("open");

let empID = 0;

let employees = [];




const loopQuestion = [
    {
        name: "empAdd",
        message: "Would you like to add a member to your team?",
        type: "confirm",
        default: true
    }
]

const questionList = [
    {
        name: "empRole",
        message: "Enter your job role",
        type: "list",
        choices: ["Manager", "Engineer", "Intern"]
    },
    {
        name: "empName",
        message: "Enter your name",
        type: "input",
    },
    {
        name: "empEmail",
        message: "Enter your Email",
        type: "input",
        validate: function (empEmail) {

            valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(empEmail)

            if (valid) {
                return true;
            } else {
                console.log("Please enter a valid email")
                return false;
            }
        }
    },
    {
        name: "empSchool",
        message: "Enter your School",
        type: "input",
        when: function (answers) {
            return answers.empRole === "Intern"
        }
    },
    {
        name: "empOffice",
        message: "Enter your Office number",
        type: "input",
        when: function (answers) {
            return answers.empRole === "Manager"
        }
    },
    {
        name: "empGitHub",
        message: "Enter your GitHub username (case-sensitive)",
        type: "input",
        when: function (answers) {
            return answers.empRole === "Engineer"
        }
    },
]

function collectEmployee(retFunction) {


    inquire
        .prompt(questionList)
        .then(function (response) {
            
            empID+=1;

            let emp;

            if (response.empRole === "Manager") {
                emp = new manager(response.empName, empID, response.empEmail, response.empOffice);
            } else if (response.empRole === "Engineer") {
                emp = new engineer(response.empName, empID, response.empEmail, response.empGitHub);
            } else if (response.empRole === "Intern") {
                emp = new intern(response.empName, empID, response.empEmail, response.empSchool);
            }

            employees.push(emp);

            retFunction();
        });
}

function addEmployee() {
    inquire
        .prompt(loopQuestion) 
        .then(function (response) {
            if (response.empAdd)
                collectEmployee(addEmployee);
            else
                writeHTMLFile();
    });

}

function writeHTMLFile() {
    let profileHTML = fs.readFileSync("./templates/index.html", "utf8", function(err) {
        if (err) 
            console.log(err);
    });

    const $ = cheerio.load(profileHTML);

    employees.forEach(emp => {
        let empRole = emp.get_role();
        let output;

        if (empRole === "Manager") {
            output = generateManagerCard(emp.name, emp.id, emp.email, emp.officeNumber);
        } else if (empRole === "Intern") {
            output = generateInternCard(emp.name, emp.id, emp.email, emp.school);
        } else if (empRole === "Engineer") {
            output = generateEngineerCard(emp.name, emp.id, emp.email, emp.github)
        }

        $("#teamCards").append(output);
    });

    fs.writeFile("./outputs/team_output.html", $.html(), function(err){
        if (err)
            console.log(err);
        
        openTeamFile("./outputs/team_output.html")
    });
}

async function openTeamFile (fileName) {

    await open(fileName, {wait:true});
    console.log("Opening file");
}

function generateManagerCard(name, id, email, officeNumber) {
    return `<div class="col">
    <div class="card h-100">
        <div class="card-header">
            <h3>${name}</h3>
            <b><i class="fas fa-globe-americas"></i> Manager</b>
        </div>
        <div class="card-body">
        <p class="card-text">
            <div class="info">ID: ${id}</div><br>
            <div class="info">E-mail: <a href="mailto:${email}">${email}</a></div><br>
            <div class="info">Office Number: ${officeNumber}</div><br>
        </p>
        </div>
        <div class="card-footer">
        <small class="text-muted"></small>
        </div>
    </div>
</div>`
}

function generateInternCard(name, id, email, school) {
    return `<div class="col">
    <div class="card h-100">
        <div class="card-header">
            <h3>${name}</h3>
            <b><i class="fas fa-university"></i> Intern</b>
        </div>
        <div class="card-body">
        <p class="card-text">
            <div class="info">ID: ${id}</div><br>
            <div class="info">E-mail: <a href="mailto:${email}">${email}</a></div><br>
            <div class="info">School: ${school}</div><br>
        </p>
        </div>
        <div class="card-footer">
        <small class="text-muted"></small>
        </div>
    </div>
</div>`
}


function generateEngineerCard(name, id, email, github) {
    return `<div class="col">
    <div class="card h-100">
        <div class="card-header">
            <h3>${name}</h3>
            <b><i class="fas fa-keyboard"></i> Engineer</b>
        </div>
        <div class="card-body">
        <p class="card-text">
            <div class="info">ID: ${id}</div><br>
            <div class="info">E-mail: <a href="mailto:${email}">${email}</a></div><br>
            <div class="info">GitHub:  <a href="https://github.com/${github}" target="_blank" rel="noopener noreferrer">${github}</a></div><br>
        </p>
        </div>
        <div class="card-footer">
        <small class="text-muted"></small>
        </div>
    </div>
</div>`
}

addEmployee();
