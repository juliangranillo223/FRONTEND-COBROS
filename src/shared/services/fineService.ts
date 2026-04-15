import { apiRequest } from "../api";
import type {
  BackendCreateEstudianteMultaPayload,
  BackendCreateMultaPayload,
  BackendEstudianteMulta,
  BackendMulta,
} from "../models/backend";

export const fineService = {
  getAllFines() {
    return apiRequest<BackendMulta[]>("/api/multa");
  },

  getFineById(id: number) {
    return apiRequest<BackendMulta>(`/api/multa/${id}`);
  },

  createFine(payload: BackendCreateMultaPayload) {
    return apiRequest<BackendMulta>("/api/multa", {
      method: "POST",
      body: payload,
    });
  },

  getAllStudentFines() {
    return apiRequest<BackendEstudianteMulta[]>("/api/estudiante_multa");
  },

  getStudentFinesByCarne(carne: string) {
    return apiRequest<BackendEstudianteMulta[]>(`/api/estudiante_multa/carne/${encodeURIComponent(carne)}`);
  },

  getStudentFineById(id: number) {
    return apiRequest<BackendEstudianteMulta>(`/api/estudiante_multa/${id}`);
  },

  createStudentFine(payload: BackendCreateEstudianteMultaPayload) {
    return apiRequest<BackendEstudianteMulta>("/api/estudiante_multa", {
      method: "POST",
      body: payload,
    });
  },

  updateStudentFineStatus(id: number, payload: { EMU_ESTADO_MULTA: string; EMU_MODIFICADO_POR: string }) {
    return apiRequest<BackendEstudianteMulta>(`/api/estudiante_multa/${id}`, {
      method: "PUT",
      body: payload,
    });
  },
};
