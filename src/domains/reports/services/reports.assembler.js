import { TopProperty } from "../model/topProperties.entity.js";
import { EntitySelection } from "../model/entitySelection.entity.js";
import { SimulationsByMonth } from "../model/simulationsByMonth.entity.js";

export class ReportsAssembler {
    static toTopProperties(response) {
        return response.data.map((r) => new TopProperty(r));
    }

    static toEntitySelections(response) {
        return response.data.map((r) => new EntitySelection(r));
    }

    static toSimulationsByMonth(response) {
        return response.data.map((r) => new SimulationsByMonth(r));
    }
}
