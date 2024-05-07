import Timeout from "./Timeout";

export default class Slide {
  public container;
  public slides;
  public controls;
  public time;
  public index;
  public slide;
  public timeout : Timeout | null;

  // O constructor receberá esses argumentos e atenção para o time, onde se não for definido terá um padrão 
  constructor(container: Element, slides: Element[], controls: Element, time: number = 5000) {
    this.container = container;
    this.slides = slides;
    this.controls = controls;
    this.time = time;

    this.index = 0;
    this.slide = this.slides[this.index];
    this.timeout = null;

    console.log(this.container, this.slides, this.controls, this.time);
    this.init();
  }

  // hide esconderá o elemento passado como argumento
  hide(element: Element) {
    element.classList.remove("active");
  }

  // show irá mostrar o slide de index passado por argumento
  show(index: number) {
    // Guardando o index do elemento mostrado
    this.index = index;
    // Guardando o slide atual
    this.slide = this.slides[this.index];
    // Removendo o active de qualquer outro slide que estivesse ativo
    this.slides.forEach((slide) => this.hide(slide));
    // Adicionando no slide baseado no argumento index, a class active
    this.slides[index].classList.add("active");
    // Autoplay dos slides
    this.auto(this.time)
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
    const prev = (this.index > 0) ? (this.index - 1) : (this.slides.length - 1)
    this.show(prev);
  }

  // Para o próximo slide button/método
  next() {
    const next = (this.index + 1) < this.slides.length ? (this.index + 1) : 0
    this.show(next);
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


    // Adicionando evento e como callback uma chamada por arrow function para evitar o bind
    prevButton.addEventListener("pointerup", () => this.prev());
    nextButton.addEventListener("pointerup", () => this.next());
  }

  private init() {
    this.addControls();
    this.show(this.index);
  }
}