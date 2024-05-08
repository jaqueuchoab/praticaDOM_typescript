export default class Timeout {
  public id;
  public handler;
  public start;
  public timeLeft;

  constructor(handler: TimerHandler, time: number) {
    // Com os argumentos cria um settimeout, guardando logo seu id
    this.id = setTimeout(handler, time);
    this.handler = handler;
    // Solução para o problema da reinicialização do auto()
    // Guardando horário em que iniciou-se o timeout
    this.start = Date.now();
    this.timeLeft = time;
  }

  clear() {
    // A partir do id já guardado podemos limpar esse timeout
    clearTimeout(this.id);
  }

  pause() {
    // Quantidade tempo que passou depois de o pause ativo
    const passed = Date.now() - this.start;
    // timeLeft indica quanto tempo ainda falta para ser inciado o autoplay, inicialmente é o tempo passado para o Timeout
    this.timeLeft = this.timeLeft - passed;
    // Limpa qualquer timeout que esteja programado
    this.clear();
  }
  
  continue() {
    // Limpa qualquer timeout que esteja programado
    this.clear();
    // O nome timeout com o tempo restante
    this.id = setTimeout(this.handler, this.timeLeft);
    // Novo start para um próximo pause
    this.start = Date.now();
  }
}