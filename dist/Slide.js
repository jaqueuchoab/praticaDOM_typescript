import Timeout from "./Timeout.js";
export default class Slide {
    container;
    slides;
    controls;
    time;
    index;
    slide;
    timeout;
    pausedTimeout;
    paused;
    constructor(container, slides, controls, time = 5000) {
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
    hide(element) {
        element.classList.remove("active");
        if (element instanceof HTMLVideoElement) {
            element.currentTime = 0;
            element.pause();
        }
    }
    show(index) {
        this.index = index;
        this.slide = this.slides[this.index];
        localStorage.setItem("activeSlide", String(this.index));
        this.slides.forEach((slide) => this.hide(slide));
        this.slides[index].classList.add("active");
        if (this.slide instanceof HTMLVideoElement) {
            console.log("ocorre");
            this.autoVideo(this.slide);
        }
        else {
            this.auto(this.time);
        }
    }
    autoVideo(video) {
        video.muted = true;
        video.play();
        let firstPlay = true;
        video.addEventListener("playing", () => {
            if (firstPlay) {
                const videoDuration = video.duration * 1000;
                this.auto(videoDuration);
            }
            firstPlay = false;
        });
    }
    auto(time) {
        this.timeout?.clear();
        this.timeout = new Timeout(() => this.next(), time);
    }
    prev() {
        if (this.paused)
            return;
        const prev = (this.index > 0) ? (this.index - 1) : (this.slides.length - 1);
        this.show(prev);
    }
    next() {
        if (this.paused)
            return;
        const next = (this.index + 1) < this.slides.length ? (this.index + 1) : 0;
        this.show(next);
    }
    pause() {
        this.pausedTimeout = new Timeout(() => {
            this.pausedTimeout?.pause();
            this.paused = true;
            if (this.slide instanceof HTMLVideoElement)
                this.slide.pause();
        }, 300);
    }
    continue() {
        this.pausedTimeout?.clear();
        if (this.paused) {
            this.paused = false;
            this.pausedTimeout?.continue();
            if (this.slide instanceof HTMLVideoElement)
                this.slide.pause();
            this.auto(this.time);
        }
    }
    addControls() {
        const prevButton = document.createElement("button");
        const nextButton = document.createElement("button");
        prevButton.innerText = "anterior";
        nextButton.innerText = "próximo";
        this.controls.appendChild(prevButton);
        this.controls.appendChild(nextButton);
        this.controls.addEventListener("pointerdown", () => this.pause());
        this.controls.addEventListener("pointerup", () => this.continue());
        prevButton.addEventListener("pointerup", () => this.prev());
        nextButton.addEventListener("pointerup", () => this.next());
    }
    init() {
        this.addControls();
        this.show(this.index);
    }
}
//# sourceMappingURL=Slide.js.map