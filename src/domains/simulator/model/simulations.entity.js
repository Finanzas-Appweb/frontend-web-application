export class Simulation {
    constructor({
                    id = "",
                    clientId = "",
                    propertyId = "",
                    simulationInput = {},
                    simulationOutput = {},
                    createdAt = "",
                }) {
        this.id = id;
        this.clientId = clientId;
        this.propertyId = propertyId;
        this.simulationInput = simulationInput;
        this.simulationOutput = simulationOutput;
        this.createdAt = createdAt;
    }
}
