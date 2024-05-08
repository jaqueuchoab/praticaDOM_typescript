import Timeout from "./Timeout.js";

export default class Slide {
  public container;
  public slides;
  public controls;
  public time;
  public index;
  public slide;
  public timeout : Timeout | null;
  public pausedTimeout : Timeout | null;
  public paused : boolean;

  // O constructor receberá esses argumentos e atenção para o time, onde se não for definido terá um padrão 
  constructor(container: Element, slides: Element[], controls: Element, time: number = 5000) {
    this.container = container;
    this.slides = slides;
    this.controls = controls;
    this.time = time;

    this.index = localStorage.getItem("activeSlide") ? Number(localStorage.getItem("activeSlide")) : 0;
    this.slide = this.slides[this.index];
    this.timeout = null;
    this.pausedTimeout = null;
    this.paused = false;

    console.log(this.container, this.slides, this.controls, this.time);
    this.init();
  }

  // hide esconderá o elemento passado como argumento
  hide(element: Element) {
    element.classList.remove("active");
    // Solução para o problema do video não reiniciar
    if(element instanceof HTMLVideoElement) {
      // Reinicia o time para 0
      element.currentTime = 0;
      // Pausa o video
      element.pause();
    }
  }

  // show irá mostrar o slide de index passado por argumento
  show(index: number) {
    // Guardando o index do elemento mostrado
    this.index = index;
    // Guardando o slide atual
    this.slide = this.slides[this.index];
    // Salvando qual slide está ativo no momento
    localStorage.setItem("activeSlide", String(this.index));
    // Removendo o active de qualquer outro slide que estivesse ativo
    this.slides.forEach((slide) => this.hide(slide));
    // Adicionando no slide baseado no argumento index, a class active
    this.slides[index].classList.add("active");
    // Autoplay dos slides
    // Iniciando configuração de video
    if(this.slide instanceof HTMLVideoElement) {
      console.log("ocorre");
      
      this.autoVideo(this.slide);
    } else {
      this.auto(this.time);
    }
  }

  autoVideo(video: HTMLVideoElement) {
    // Um video não pode ter autoplay de musica automatico, convensão de browsers
    video.muted = true;
    // Deixando o video em autoplay
    video.play();
    // Para garantir que o callback de playing ocorrerá apenas uma vez
    let firstPlay = true;
    // Problema que pode ocorrer, caso o video ainda nao tenha sido carregado a duration pode retornar um NaN, assim impactando negativamente no calculo dos milisegundos
    //Solução: verificar evento de playing no vídeo
    video.addEventListener("playing", () => {
      // Tempo duração dos vídeos em milisegundos
      if(firstPlay) {
        const videoDuration = video.duration * 1000;
        this.auto(videoDuration);
      }
      firstPlay = false;
    });
    // Caso, siga para um prox slide e retorne ao video ele não reinicia do começo
  }

  // Function que define como será o autoplay
  auto(time: number) {
    // Timeout especifico que remove bug durante sua execução, evita conflito entre o uso dos buttons para passar os slides e o autoplay
    //Limpeza do timeout
    this.timeout?.clear();
    // Inicialização do Timeout
    this.timeout = new Timeout(() => this.next(), time);
  }

  // Para o slide anterior button/método
  prev() {
    // Verificação do paused, conferir se prev está permitido
    if(this.paused) return;
    const prev = (this.index > 0) ? (this.index - 1) : (this.slides.length - 1)
    this.show(prev);
  }

  // Para o próximo slide button/método
  next() {
    // Verificação do paused, conferir se next está permitido
    if(this.paused) return;
    const next = (this.index + 1) < this.slides.length ? (this.index + 1) : 0
    this.show(next);
  }

  // Evento de pause do slide
  // Problema ocorrido: apenas qualquer click está fazendo com que seja pausado o slide
  pause() {
    // Identificar o momento em que houve o pause, e barrar a manipulação via next() e prev()
    // Solucionando problema de click e pause, usando o Timeout, iremos definir uma tempo para verificar se está pausado ou seja se o evento de pointerdown está ocorrendo
    this.pausedTimeout = new Timeout(() => {
      // Usando o pause da class Timeout, para melhorar o funcionamento do slide
      this.pausedTimeout?.pause();
      // Agora será necessario realizar a limpeza do timeout quando não for pausado, limpeza ocorre lá em continue()
      this.paused = true;
      // Solucionado problema de pause no video em si, e não só no slide
      if(this.slide instanceof HTMLVideoElement) this.slide.pause();
    }, 300);
    // Outro problema: visto que foi esperado os segundos para verificar se o pause estava ativo, o auto(), com o timeout não parou, assim a função continuo seu fluxo chamando a next() e se deparando com o pause como true, não reativando o auto()

  }

  continue() {
    //Limpar timeout do pause anterior
    this.pausedTimeout?.clear();
    if(this.paused) {
      // Identificar o momento em que o pointer foi solto, e permitir a continuação dos slides mudando pause para false
      this.paused = false;
      this.pausedTimeout?.continue();
      // Solucionado problema de pause no video em si, agora sendo o continue, pós pause
      if(this.slide instanceof HTMLVideoElement) this.slide.pause();
      // Solução do problema da função auto() e next(), chamar a função auto() e iniciar um novo time
      // Problema, inicia um novo time de 3 segundos e não continua do momento do pause
      this.auto(this.time);
    }
  }

  // Macete para permitir que seja passado os slides tocando nas imagens, os buttons estão no mesmo local que a imgs porém escondidos
  private addControls() {
    const prevButton = document.createElement("button");
    const nextButton = document.createElement("button");
    prevButton.innerText = "anterior";
    nextButton.innerText = "próximo";

    // Busca a div controls e adiciona os buttons como filhos
    this.controls.appendChild(prevButton);
    this.controls.appendChild(nextButton);

    // Evento de pause, usando o pointerdown, capturar o momento em que o mouse está pressionado 
    this.controls.addEventListener("pointerdown", () => this.pause());
    // Evento que dá continuação dos slides pós pause
    this.controls.addEventListener("pointerup", () => this.continue());



    // Adicionando evento e como callback uma chamada por arrow function para evitar o bind
    prevButton.addEventListener("pointerup", () => this.prev());
    nextButton.addEventListener("pointerup", () => this.next());
  }

  private init() {
    this.addControls();
    this.show(this.index);
  }
}