import { getOneCologneById } from "../colognes/getColognes";

export async function createSummaryService(data, noVehicle, nameService, chofer, tripulacion) {

    if (!data) return '';

    // =========================
    // VEHICLE
    // =========================
    const startKilometers = data.kilometers ?? 0;
    const closeKilometers = data.close_kilometers ?? null;
    const kilometersTraveled = data.kilometers_traveled ?? null;

    // =========================
    // UBICATION
    // =========================
    const crossing = data.crossing ?? '';
    const street = data.stret ?? '';

    let cologneName = '';
    if (data.id_cologne) {
        const cologne = await getOneCologneById(data.id_cologne);
        cologneName = cologne?.name ?? '';
    }

    // =========================
    // DATE
    // =========================
    const dateOpen = data.date_to_open ? data.date_to_open.slice(0, 10) : '';
    const timeOpen = data.time_to_open ? data.time_to_open.slice(11, 19) : '';

    const dateClose = data.date_to_close ? data.date_to_close.slice(0, 10) : null;
    const timeClose = data.time_to_close ? data.time_to_close.slice(11, 19) : null;

    const folio = data.folio ?? 'N/A';

    // =========================
    // ABOUT SERVICE
    // =========================

    const closeType = data.close_type !== '' ? data.close_type : 'Servicio inprocedente';
    const generalConclusion = data.general_and_conclusion !== '' ? data.general_and_conclusion : 'Incidente no localizado o falsa alarma.';
    const status = data.status ?? 'sin estatus';

    // =========================
    // TRIPULATION (OPTIMIZADO)
    // =========================
    let tripulacionTexto = '';

    if (Array.isArray(tripulacion) && tripulacion.length > 0) {

        tripulacionTexto = ' en compañía de ';

        tripulacion.forEach((name, i) => {
            if (i === 0) {
                tripulacionTexto += name;
            } else if (i === tripulacion.length - 1) {
                tripulacionTexto += ' y ' + name;
            } else {
                tripulacionTexto += ', ' + name;
            }
        });

        tripulacionTexto += '.';
    }

    // =========================
    // REPORTER
    // =========================
    const reporter = data.reporter ?? 'anonimo';
    const phoneReporter =
        data.phone_reporter && data.phone_reporter !== ''
            ? 'proporcionó el número de contacto telefónico ' + data.phone_reporter
            : 'no proporcionó algun número de contacto';

    // =========================
    // SUMMARY
    // =========================
    const resumenBase = `
${nameService.toUpperCase()}: ${folio}

El día ${dateOpen}, con ${timeOpen} horas, se recibió reporte de ${nameService.toLowerCase()} en la colonia ${cologneName}, ubicado sobre ${street}${crossing ? `, al cruce con ${crossing}` : ''}, mismo reporte fue realizado por reportante ${reporter}, quien ${phoneReporter}.

En seguimiento y atención al incidente reportado, se dirigió al lugar referido la unidad con número económico U-${noVehicle}, operada por ${chofer}${tripulacionTexto} A su arribo, el personal llevó a cabo una evaluación inicial de la situación.

Durante la atención del servicio, se realizaron las acciones y/o maniobras correspondientes, dejando constancia de: ${generalConclusion} Las labores se desarrollaron conforme a los procedimientos operativos establecidos.
`;

    // =========================
    // SI ESTÁ CERRADO
    // =========================
    if (dateClose && timeClose) {
        const resumenCierre = `
Una vez confirmada que la situación se encontraba controlada y se descartaron riesgos para la población y el personal, el servicio se dio por concluido el día ${dateClose} a las ${timeClose} horas, quedando el evento con estatus ${status} y tipo de cierre: ${closeType}.

La unidad inició su recorrido con un kilometraje de ${startKilometers} y finalizó con ${closeKilometers ?? 'N/A'}, registrando un total de ${kilometersTraveled ?? 'N/A'} kilómetros recorridos durante la atención del servicio.
`;

        return (resumenBase + resumenCierre).trim();
    }

    // =========================
    // SI SIGUE EN CURSO
    // =========================
    const resumenEnCurso = `

Actualmente el servicio continúa en atención, manteniéndose con estatus ${status}.
`;

    return (resumenBase + resumenEnCurso).trim();
}