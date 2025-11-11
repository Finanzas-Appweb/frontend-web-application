import { Simulation } from "../model/simulations.entity.js";

export class SimulationsAssembler {
    static toEntitiesFromResponse(response) {
        return response.data.map((s) => this.toEntityFromResource(s));
    }

    static toEntityFromResource(resource) {
        return new Simulation({
            id: resource.id,
            clientId: resource.clientId,
            propertyId: resource.propertyId,
            simulationInput: resource.simulationInput,
            simulationOutput: resource.simulationOutput,
            createdAt: resource.createdAt,
        });
    }
}
