const API_URL = import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VUE_APP_API_URL

export async function getServicesHistory() {
    try {
        const response = await fetch(API_URL+"/folio");
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

export async function getLastOnServicesHistory() {
    try {
        const response = await fetch(API_URL+"/folio");
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }
        const service = await response.json();
        return Math.max(...service.map(s => s.id));
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function getOneServicesHistory(idService){
    let service = []
    try {
        
        const response = await fetch(API_URL + "/folio/"+idService);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        service = await response.json();
    return service
    } catch (err) {
        return err
    }
}


export async function getOneTypeServicesById(idService){
    let service = []
    try {
        const response = await fetch(API_URL + "/type-services/"+idService);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        service = await response.json();
    return service[0].name
    } catch (err) {
        return err
    }
}

export async function getAllTypeServices(){
    let service = []
    try {
        const response = await fetch(API_URL + "/type-services/");
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        service = await response.json();
    return service
    } catch (err) {
        return err
    }
}