import { therapy } from "../schema/appointment.schema.js";
import { client } from "./db/client.js";
import { QUERIES } from "./db/queries.js";

export const getAllTherapies = async () => {
  const therapies = (await client.query(QUERIES.getTherapies)).rows;
  return therapies.map((therapy) => ({
    id: therapy.id,
    therapyName: therapy.therapy_name,
  }));
};
