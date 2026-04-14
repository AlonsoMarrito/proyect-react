const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

const fetchOpts = { credentials: "include" };

export async function getAllColognes() {
    try {
        const response = await fetch(API_URL+"/colognes", fetchOpts);
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

export async function getOneCologneById(id) {
    try {
        const response = await fetch(API_URL+"/colognes/"+id);
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }
        const cologne = await response.json();
        console.log(cologne[0].name)
        return cologne[0];
    } catch (err) {
        console.error(err);
        return [];
    }
}