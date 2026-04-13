const API_URL = import.meta.env.VITE_BACKEND_URL

export async function getAllBases() {
    try {
        const response = await fetch(API_URL+"/bases");
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }
        const service = await response.json();
        return service.sort((a, b) => b.id - a.id);
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function getAllBasesOperatives() {
    try {
        const response = await fetch(API_URL+"/bases");
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }
        const service = await response.json();
        return service.filter(e => e.status === 'Activa');
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function getBaseByName(nameRoute) {
    try {
        const response = await fetch(API_URL+"/bases/name/"+nameRoute);
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }
        const service = await response.json();
        return service;
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function getBaseById(id) {
    try {
        const response = await fetch(API_URL+"/bases/"+id);
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }
        const service = await response.json();
        return service;
    } catch (err) {
        console.error(err);
        return [];
    }
}