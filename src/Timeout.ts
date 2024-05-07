export default class Timeout {
  public id;
  public handler;

  constructor(handler: TimerHandler, time: number) {
    // Com os argumentos cria um settimeout, guardando logo seu id
    this.id = setTimeout(handler, time);
    this.handler = handler;
  }

  clear() {
    // A partir do id já guardado podemos limpar esse timeout
    clearTimeout(this.id);
  }
}