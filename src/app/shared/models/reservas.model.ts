export interface Reserva {
    id:number,
    id_cuadro:number,
    nombre_cliente:string,
    email_cliente:string,
    dni_cliente?:string,
    estado?:string,
    fecha_reserva?:Date,
}
