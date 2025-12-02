function showWriter(){
document.querySelector('main').innerHTML = `
  <h1>Writer Hub</h1>
  <textarea rows="10" style="width:100%"></textarea><br>
  <input id="rhymeWord" placeholder="Word to rhyme">
  <button onclick="doRhyme()">Rhyme</button>
  <button onclick="showBeatFolders()">Beat Folders</button>
  <ul id="rhymeList"></ul>`;
}

function showStudio(){
  document.querySelector('main').innerHTML = `
    <h1>Studio</h1>
    <input id="songTitle" placeholder="New song title">
    <button onclick="addSong()">Add Song</button>
    <ul id="songList"></ul>`;
  loadSongs();
}

async function doRhyme(){
  const word = document.getElementById('rhymeWord').value;
  if(!word) return;
  const res = await fetch(`https://api.datamuse.com/words?rel_rhy=${word}&max=8`);
  const data = await res.json();
  const list = data.length ? data.map(x=>x.word) : ['No rhymes found'];
  document.getElementById('rhymeList').innerHTML =
        list.map(w=>`<li>${w}</li>`).join('');
}


// tiny song store
function addSong(){
  const title = document.getElementById('songTitle').value;
  if(!title) return;
  let songs = JSON.parse(localStorage.getItem('songs')||'[]');
  songs.push(title);
  localStorage.setItem('songs',JSON.stringify(songs));
  loadSongs();
}
function loadSongs(){
  const songs = JSON.parse(localStorage.getItem('songs')||'[]');
  document.getElementById('songList').innerHTML =
        songs.map(s=>`<li>${s}</li>`).join('');
}

// wire nav
document.querySelectorAll('nav button')[0].onclick = showWriter;
document.querySelectorAll('nav button')[1].onclick = showStudio;

function showFinance(){
  document.querySelector('main').innerHTML = `
    <h1>Finance</h1>
    <input id="desc" placeholder="What did you spend on?">
    <input id="amt"  type="number" step="0.01" placeholder="Dollars">
    <button onclick="addExpense()">Add</button>
    <ul id="expList"></ul>`;
  loadExp();
}
function addExpense(){
  const desc = document.getElementById('desc').value;
  const amt  = parseFloat(document.getElementById('amt').value)||0;
  if(!desc||!amt) return;
  let exp = JSON.parse(localStorage.getItem('exp')||'[]');
  exp.push({desc,amt,date:new Date().toLocaleDateString()});
  localStorage.setItem('exp',JSON.stringify(exp));
  loadExp();
}
function loadExp(){
  const exp = JSON.parse(localStorage.getItem('exp')||'[]');
  let total = exp.reduce((t,x)=>t+x.amt,0);
  document.getElementById('expList').innerHTML =
        exp.map(e=>`<li>${e.desc}  $${e.amt.toFixed(2)}</li>`).join('') +
        `<li><strong>Total: $${total.toFixed(2)}</strong></li>`;
}

function showPlans(){
  document.querySelector('main').innerHTML = `
    <h1>Monthly Plans</h1>
    <input id="taskIn" placeholder="New task">
    <button onclick="addTask()">Add</button>
    <div style="display:flex;gap:1rem;margin-top:1rem">
      <div class="card" data-stat="todo"><h4>To-Do</h4></div>
      <div class="card" data-stat="doing"><h4>Doing</h4></div>
      <div class="card" data-stat="done"><h4>Done</h4></div>
    </div>`;
  loadTasks();
}
function addTask(){
  const t = document.getElementById('taskIn').value;
  if(!t) return;
  let tasks = JSON.parse(localStorage.getItem('tasks')||'[]');
  tasks.push({id:Date.now(),text:t,stat:'todo'});
  localStorage.setItem('tasks',JSON.stringify(tasks));
  loadTasks();
}
function loadTasks(){
  const tasks = JSON.parse(localStorage.getItem('tasks')||'[]');
  ['todo','doing','done'].forEach(s=>{
    const box = document.querySelector(`.card[data-stat="${s}"]`);
    box.innerHTML = `<h4>${s.toUpperCase()}</h4>` +
      tasks.filter(t=>t.stat===s)
           .map(t=>`<div draggable="true" data-id="${t.id}">${t.text}</div>`)
           .join('');
  });
  // drag-drop logic
  document.querySelectorAll('[draggable="true"]').forEach(el=>{
    el.ondragstart = e => e.dataTransfer.setData('id',el.dataset.id);
  });
  document.querySelectorAll('.card').forEach(c=>{
    c.ondragover = e => e.preventDefault();
    c.ondrop = e => {
      const id = e.dataTransfer.getData('id');
      const newStat = c.dataset.stat;
      let tasks = JSON.parse(localStorage.getItem('tasks')||'[]');
      tasks = tasks.map(t=>t.id==id?{...t,stat:newStat}:t);
      localStorage.setItem('tasks',JSON.stringify(tasks));
      loadTasks();
    };
  });
}

function showAnalytics(){
  document.querySelector('main').innerHTML = `
    <h1>Analytics</h1>
    <canvas id="chart" style="max-width:600px"></canvas>`;
  drawChart();
}
function drawChart(){
  // dummy data - replace later with real stream counts
  const labels = ['Jan','Feb','Mar','Apr','May','Jun'];
  const streams = [1200, 1900, 3000, 5000, 3200, 4800];
  const ctx = document.getElementById('chart').getContext('2d');
  new Chart(ctx,{
    type:'line',
    data:{labels, datasets:[{label:'Streams',data:streams,borderColor:'#ffcc00',fill:false}]},
    options:{responsive:true,plugins:{legend:{display:false}}}}
  );
}

