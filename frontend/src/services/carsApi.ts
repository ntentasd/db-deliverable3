import { authHeaders, baseApi, Metadata } from "./api";

export interface Car {
  license_plate: string;
  make: string;
  model: string;
  status: string;
  cost_per_km: number;
  location: string;
}

interface CarResponse {
  data: Car[];
  meta: Metadata;
}

const api = baseApi;

export const getAllCars = async () => {
  const response = await api.get("/cars");
  return response.data;
};

export const getAllCarsPaginated = async (page: number, page_size: number = 5): Promise<CarResponse> => {
  const response = await api.get(`/cars`, {
    params: { page, page_size },
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  return response.data;
}

export const getAvailableCars = async (page: number, page_size: number = 5): Promise<CarResponse> => {
  const response = await api.get(
    `/available`,
    { params: { page, page_size } },
  );
  return response.data;
}

export const getCarByLicensePlate = async (licensePlate: string) => {
  const response = await api.get(
    `/cars/${licensePlate}`,
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } },
  );
  return response.data;
}

export const addCar = async (car: {
  license_plate: string;
  make: string;
  model: string;
  cost_per_km: number;
  location: string;
}) => {
  try {
    const response = await api.post(
      '/cars',
      car, 
      { headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add car:', error)
    throw error;
  }
};

export const updateCarStatus = async (
  licensePlate: string,
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE"
) => {
  const response = await api.put(
    `/cars/${licensePlate}/status`,
    { status },
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } },
  );
  return response.data;
};

export const updateCar = async (car: Car) => {
  const inputCar = {
    make: car.make,
    model: car.model,
    status: car.status,
    cost_per_km: car.cost_per_km,
    location: car.location,
  };

  const response = await api.put(
    `/cars/${car.license_plate}`,
    inputCar,
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } },
  );
  return response.data;
};

export const deleteCar = async (licensePlate: string) => {
  const response = await api.delete(
    `/cars/${licensePlate}`,
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } },
  );
  return response.data;
};

export const getCarDetails = async (licensePlate: string) => {
  const response = await api.get(
    `/cars/${licensePlate}/details`,
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } },
  );
  return response.data;
};