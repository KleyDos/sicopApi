import mongoose, { Schema } from "mongoose";

const concursos = mongoose.Schema(
  {
    institucion: { type: String, required: true },
    procedimiento: { type: String, required: true },
    sicopNo: { type: String, required: true },
    detalle: { type: String, required: true },
  },
  {
    collection: "Concursos",
  }
);

export default mongoose.model("Concursos", concursos);
