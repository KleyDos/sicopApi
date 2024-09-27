import mongoose, { Schema } from "mongoose";

const concursos = new mongoose.Schema(
  {
    procedimiento: { type: String },
    institucion: { type: String },
    partida: { type: String },
    descripcion: { type: String },
    fecha: { type: String },
    monto: { type: String },
  },
  {
    collection: "Concursos",
  }
);

export default mongoose.model("Concursos", concursos);
