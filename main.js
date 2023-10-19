import './style.css'
import { RECORDING_STATE } from './constants';

document.querySelector('#app').innerHTML = `
  <div class="form-container">
    <h1>Audio Converter</h1>
    <form>
      <div class="record-audio" id="record"> <p>Record</p> </div>
      <p>OR</p>
      <label for="txt">Enter text</label>
      <input id="txt" type="text" class="txt" />
      <div>
        <label for="rate">Rate</label
        ><input type="range" min="0.5" max="2" value="1" step="0.1" id="rate" />
        <div class="rate-value">1</div>
        <div class="clearfix"></div>
      </div>
      <div>
        <label for="pitch">Pitch</label
        ><input type="range" min="0" max="2" value="1" step="0.1" id="pitch" />
        <div class="pitch-value">1</div>
        <div class="clearfix"></div>
      </div>
      <select></select>
      <div class="controls">
        <button id="play" type="submit">Play</button>
      </div>
    </form>
  </div>
`

const synth = window.speechSynthesis;
const recognition = new window.webkitSpeechRecognition()

const inputForm = document.querySelector("form");
const inputTxt = document.querySelector(".txt");
const voiceSelect = document.querySelector("select");

const pitch = document.querySelector("#pitch");
const pitchValue = document.querySelector(".pitch-value");
const rate = document.querySelector("#rate");
const rateValue = document.querySelector(".rate-value");

const recorder = document.querySelector('#record');
let currentRecordingState = RECORDING_STATE.IDLE

let voices = [];

function populateVoiceList() {
  voices = synth.getVoices().sort(function (a, b) {
    const aname = a.name.toUpperCase();
    const bname = b.name.toUpperCase();

    if (aname < bname) {
      return -1;
    } else if (aname == bname) {
      return 0;
    } else {
      return +1;
    }
  });
  const selectedIndex =
    voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = "";

  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement("option");
    option.textContent = `${voices[i].name} (${voices[i].lang})`;

    if (voices[i].default) {
      option.textContent += " -- DEFAULT";
    }

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
}

function initializeVoiceRecognition(){
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = true;
}

populateVoiceList();
initializeVoiceRecognition()

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak() {
  if (synth.speaking) {
    console.error("speechSynthesis.speaking");
    return;
  }

  if (inputTxt.value !== "") {
    const utterThis = new SpeechSynthesisUtterance(inputTxt.value);

    utterThis.onend = function (event) {
      console.log("SpeechSynthesisUtterance.onend");
    };

    utterThis.onerror = function (event) {
      console.error("SpeechSynthesisUtterance.onerror");
    };

    const selectedOption =
      voiceSelect.selectedOptions[0].getAttribute("data-name");

    for (let i = 0; i < voices.length; i++) {
      if (voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
        break;
      }
    }
    utterThis.pitch = pitch.value;
    utterThis.rate = rate.value;
    synth.speak(utterThis);
  }
}

inputForm.onsubmit = function (event) {
  event.preventDefault();

  speak();

  inputTxt.blur();
};

pitch.onchange = function () {
  pitchValue.textContent = pitch.value;
};

rate.onchange = function () {
  rateValue.textContent = rate.value;
};

voiceSelect.onchange = function () {
  speak();
};

function startRecording(){
  recognition.start()
  currentRecordingState = RECORDING_STATE.LISTENING
  recorder.innerHTML = "<p>Listening...</p>"
}

function stopRecording(){
  recognition.stop()
  currentRecordingState = RECORDING_STATE.IDLE
  recorder.innerHTML = "<p>Record.</p>"
}

recognition.onresult = (event) => {
  const inputSpeech = event.results[0][0].transcript;
  inputTxt.value = inputSpeech
};
recognition.onspeechend = () => {
  stopRecording()
};

recorder.addEventListener('click', () => {
  if(currentRecordingState === RECORDING_STATE.IDLE){
    startRecording()
  }else{
    stopRecording()
  }
})