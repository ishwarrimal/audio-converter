import './style.css'
import './script'

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