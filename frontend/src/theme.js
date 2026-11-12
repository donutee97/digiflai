/* ---------------------------------------------------------------
    TOKENS
    bg      #0A0E14  base
    panel   #10161D  card surface
    panel2  #161D26  raised surface
    line    #212B36  hairline
    cyan    #3DDBD9  active / data
    amber   #F2A93B  caution
    red     #E5484D  critical
    green   #5FD68A  nominal
    text    #E7EDF3
    muted   #7C8B9C
    font display/data: IBM Plex Mono | body: IBM Plex Sans
------------------------------------------------------------------*/


export const C = {
    bg: "#0A0E14",
    panel: "#10161D",
    panel2: "#161D26",
    line: "#212B36",
    cyan: "#3DDBD9",
    cyanDim: "#1F5D5C",
    amber: "#F2A93B",
    red: "#E5484D",
    green: "#5FD68A",
    text: "#E7EDF3",
    muted: "#7C8B9C",
    faint: "#3A4753",
};

/* ---------------------------------------------------------------
    PRIMITIVES
------------------------------------------------------------------*/

    export const stateStyle = {
    OPERATIVO: { c: C.green, label: "Operativo" },
    EN_MISION: { c: C.cyan, label: "En misión" },
    MANTENIMIENTO: { c: C.amber, label: "Mantenimiento" },
    FUERA_SERVICIO: { c: C.red, label: "Fuera de servicio" },
};

    export const nivelStyle = {
    CRITICA: C.red,
    ALTA: C.amber,
    MEDIA: "#E0C64A",
    BAJA: C.muted,
    CRITICO: C.red,
    ALTO: C.amber,
    MEDIO: "#E0C64A",
    BAJO: C.green,
};