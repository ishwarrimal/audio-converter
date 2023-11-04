import { RECORDING_STATE } from "./constants";

document.addEventListener("DOMContentLoaded", () => {
  const synth = window.speechSynthesis;
  const recognition = new window.webkitSpeechRecognition();

  const playButton = document.getElementById("play");
  const playAndDownloadButton = document.getElementById("play-download");

  const inputTxt = document.querySelector(".txt");
  const voiceSelect = document.querySelector("select");

  const pitch = document.querySelector("#pitch");
  const pitchValue = document.querySelector(".pitch-value");
  const rate = document.querySelector("#rate");
  const rateValue = document.querySelector(".rate-value");

  const recorder = document.querySelector("#record");
  let currentRecordingState = RECORDING_STATE.IDLE;
  let mediaRecorder;

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

  function initializeVoiceRecognition() {
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = true;
  }

  async function initializeMediaRecorder() {
    const constraints = { audio: true };
    return navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      return stream;
    });
  }

  populateVoiceList();
  initializeVoiceRecognition();

  async function startMediaRecording() {
    let chunks = [];
    let stream;
    function handleMediaRecorderStop() {
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
      const clipName = prompt("Enter a name for your sound clip");
      const clipContainer = document.createElement("article");
      const clipLabel = document.createElement("p");
      const audio = document.createElement("audio");
      const deleteButton = document.createElement("button");

      clipContainer.classList.add("clip");
      audio.setAttribute("controls", "");
      deleteButton.textContent = "Delete";
      clipLabel.textContent = clipName;

      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      document.querySelector("body").appendChild(clipContainer);

      audio.controls = true;
      const blob = new Blob(chunks, { type: "audio/webm; codecs=opus" });
      chunks = [];
      const audioURL = URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log("recorder stopped");

      deleteButton.onclick = (e) => {
        const evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
      };
    }
    return initializeMediaRecorder().then((str) => {
      stream = str;
      mediaRecorder = new MediaRecorder(str);
      mediaRecorder.onstop = handleMediaRecorderStop;
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      return true;
    });
  }

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  function speak(download = false) {
    if (synth.speaking) {
      console.error("speechSynthesis.speaking");
      return;
    }

    if (inputTxt.value !== "") {
      const utterThis = new SpeechSynthesisUtterance(inputTxt.value);

      utterThis.onend = function (event) {
        download && mediaRecorder.stop();
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
      download && mediaRecorder.start();
    }
  }

  function handlePlayClick(event, download = false) {
    event.preventDefault();
    speak(download);
    inputTxt.blur();
  }

  playButton.addEventListener("click", function (event) {
    handlePlayClick(event);
  });

  playAndDownloadButton.addEventListener("click", function (event) {
    event.preventDefault();
    const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);
    if (isMobileDevice) {
      alert("Download not supported currently in mobile device");
      return;
    }
    startMediaRecording().then((d) => handlePlayClick(event, true));
  });

  pitch.onchange = function () {
    pitchValue.textContent = pitch.value;
  };

  rate.onchange = function () {
    rateValue.textContent = rate.value;
  };

  voiceSelect.onchange = function () {
    speak();
  };

  function startRecording() {
    try {
      recognition.start();
      currentRecordingState = RECORDING_STATE.LISTENING;
      recorder.innerHTML = "<p>Listening...</p>";
    } catch (e) {
      console.log("Error ", e);
    }
  }

  function stopRecording() {
    recognition.stop();
    currentRecordingState = RECORDING_STATE.IDLE;
    recorder.innerHTML = "<p>Record.</p>";
  }

  recognition.onresult = (event) => {
    const inputSpeech = event.results[0][0].transcript;
    inputTxt.value = inputSpeech;
  };

  recognition.onspeechend = () => {
    stopRecording();
  };

  recorder.addEventListener("click", () => {
    if (currentRecordingState === RECORDING_STATE.IDLE) {
      startRecording();
    } else {
      stopRecording();
    }
  });
});
