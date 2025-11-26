export class Client {
    constructor({ 
        id = "", 
        firstName = "", 
        lastName = "", 
        fullName = "",
        email = "", 
        phone = "", 
        annualIncome = 0,
        createdByUserName = "",
        createdAtUtc = null
    }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName || `${firstName} ${lastName}`.trim();
        this.email = email;
        this.phone = phone;
        this.annualIncome = annualIncome;
        this.createdByUserName = createdByUserName;
        this.createdAtUtc = createdAtUtc;
    }
}
