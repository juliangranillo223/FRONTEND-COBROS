interface StoredVehicle {
  plate?: string;
}

interface StoredRegistration {
  carnet?: string;
  fullName?: string;
  vehicles?: StoredVehicle[];
}

export interface PlateLookupResult {
  carnet: string;
  fullName: string;
  plate: string;
}

function parseStoredRegistrations(key: string): StoredRegistration[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const saved = window.localStorage.getItem(key);

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

export function findRegistrationByPlate(plate: string): PlateLookupResult | null {
  const normalizedPlate = plate.trim().toUpperCase();
  const registrations = [
    ...parseStoredRegistrations('parkingRegistrations'),
    ...parseStoredRegistrations('currentRegistration'),
  ];

  const match = registrations.find((registration) =>
    (registration.vehicles || []).some((vehicle) => vehicle.plate?.trim().toUpperCase() === normalizedPlate)
  );

  if (!match?.carnet) {
    return null;
  }

  return {
    carnet: match.carnet,
    fullName: match.fullName || 'Estudiante',
    plate: normalizedPlate,
  };
}
