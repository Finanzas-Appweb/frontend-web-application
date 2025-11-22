export class User {
    constructor({ 
        id = "", 
        username = "",
        firstName = "",
        lastName = "",
        dni = "",
        email = "", 
        phone = "",
        role = 1,
        createdAtUtc = null,
        defaultCurrency = 1,
        defaultRateType = 1
    }) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dni = dni;
        this.email = email;
        this.phone = phone;
        this.role = role; // 1 = Admin, 2 = Agent, 3 = User
        this.createdAtUtc = createdAtUtc;
        this.defaultCurrency = defaultCurrency; // 1 = PEN, 2 = USD
        this.defaultRateType = defaultRateType; // 1 = TEA, 2 = TNA
    }

    get roleText() {
        const roles = { 1: 'Admin', 2: 'Agent', 3: 'User' };
        return roles[this.role] || 'Unknown';
    }
}
