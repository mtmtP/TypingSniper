/**
 * 動けば良し状態なので、汚いコードですがご勘弁を。
 */


`use strict`;
const targetDiv = document.getElementById("target");
const scopeDiv = document.getElementById("scope");
const textP = document.getElementById("text");//なんらかのデータを表示　
const marcP = document.getElementById("mark");//照準マーク
const distansP = document.getElementById("distans");//なんらかのデータを表示　
const HPDiv = document.getElementById("HP-area");
const magazineDiv = document.getElementById("magazine-div");
const wrapperDiv = document.getElementById("wrapper");
const levelChoiseDiv = document.getElementById("level-choise");
const startupDiv = document.getElementById("startup");
const commentDiv = document.getElementById("comment");
const list = document.getElementById("list");
const magazineUl = document.getElementById("magazine-ul");
const snipe = document.getElementById("snipe");
const grd = document.getElementById("grd-area");
const gameOverDiv = document.getElementById("game-over");
const timerArea = document.getElementById("timer-area");
const sniper = document.getElementById("sniper");
let damage, level, startTime, nowHP, levelNum;
let scopeInterval, randTextInterval, timerInterval;//連続実行用
let targetPin = {};
let scopePos = {};
let scopePin = {};
let x = 0;
let y = 0;
let gamePlay = false;
let isFirstGame = true;
let isGameOver = false;

//効果音を取得
const soundHit = new Audio('sound/hit.mp3');
const soundMiss = new Audio('sound/miss.mp3');
const soundFin = new Audio('sound/fin.mp3');
const soundMissFin = new Audio('sound/missFin.mp3');
const soundClash = new Audio('sound/clash.mp3');

//レベルごとの設定オブジェクト
let game1 = {
  HP: 150,
  magazine: 5,//残り弾数
  speed: 1200,//アルファベットスピード
  targetSize: 50,
  targetPos: { x: 420, y: 235 },//ターゲットの初期位置
  scopeWidth: { x: 200, y: 1 }, //スコープの振れ幅(実際の移動はこの半分)
  scopeF: function () {//レベル毎の独自の計算式
    x += 1;
    let obj = { x: x, y: y }//戻り値用の座標情報
    return obj;
  },
  setTime: null,
  message: `ロボットが攻めてきたぞ！
            赤く光ってるあたりが弱点のようだ。その「タイピング狙撃銃」でタイミングを合わせて攻撃してくれ！
            <br><br>スペースキーを押したら始まるぞ`
}

let game2 = {
  HP: 250,
  magazine: 6,//残り弾数
  speed: 800,//アルファベットスピード
  targetSize: 40,
  targetPos: { x: 330, y: 255 },
  scopeWidth: { x: 200, y: 50 },
  scopeF: function () {
    x += 2; //レベル毎の独自の計算式
    y += 0.3;
    let obj = { x: x, y: y }
    return obj;
  },
  setTime: null,
  message: `君のタイピング狙撃銃の耐久力も下がってきたようだ。
        照準が定まりにくいが、がんばってくれ！<br><br>
        スペースキーを押したら始まるぞ`
}

let game3 = {
  HP: 300,
  magazine: 7,//残り弾数
  speed: 700,//アルファベットスピード
  targetSize: 30,
  targetPos: { x: 387, y: 180 },
  scopeWidth: { x: 200, y: 50 },
  scopeF: function () {
    x = Math.floor(x + (8 - (Math.random() * 10)));
    y = y + x % 30 / 10;
    let obj = { x: x, y: y }
    return obj;
  },
  setTime: 20,
  message: `タイピング狙撃銃が壊れる寸前だ！
            今回はタイムリミットもあるから気をつけろ。
            ぼーっとしてると終わってしまうぞ！<br><br>
            スペースキーを押したら始まるぞ`
}

/**
 * レベルに応じたゲームスタート
 */
function gameStart(num) {
  levelNum = num; //レベルを判定
  switch (num) {
    case 1: level = game1;
      break;
    case 2: level = game2;
      break;
    case 3: level = game3;
      break;
  }

  //前の画面の残滓を消去
  if (isFirstGame) {
    wrapperDiv.removeChild(startupDiv);
  } else {
    removeAllChildren(list);//コメントエリアを削除
    removeAllChildren(magazineUl);//弾を消しておく
    removeClassChildren(wrapperDiv, "hole");//弾痕を削除
    removeClassChildren(wrapperDiv, "next");//ボタンを削除
  }

  //レベル毎の初期画面を描画
  grd.style.width = `${(level.HP) / 300 * 100}%`;//体力ゲージ
  nowHP = level.HP;　//体力を満タンに
  nowMagazine = level.magazine;　//弾を満タンに
  bulletShow(); //弾数を描画
  targetShow(); //ターゲットを描画
  startMessage(); //初期メッセージを描画


  document.onkeydown = (event) => {
    if (event.key === " ") {


      //時間制限があれば表示
      if (level.setTime !== null) {
        startTime = new Date();
        timerInterval = setInterval(countDown, 10, level);//残り時間を表示
      }
      //スコープを動かす関数を連続的に実行
      scopeInterval = setInterval(scopeMoove, 40);

      //ランダムでアルファベットを表示
      randTextInterval = setInterval(randAlphabet, level.speed);

      //ここからが本当のゲーム開始
      gamePlay = true;
      typing();
    }

  }

}





/**
 * 
 */
function startMessage() {
  var li = DOM(`li`, level.message);
  list.insertBefore(li, list.children[0]);
}
/**
 * 初期：弾数を描画
 */
function bulletShow() {
  snipe.style.display = "block";
  for (let i = 0; i < level.magazine; i++) {
    var li = DOM(`li`, `<img src = "img/bullet.png">`);
    magazineUl.appendChild(li);
  }
}

/**
 * 初期：ターゲットを描画
 */
function targetShow() {
  //ターゲットの位置を決定
  targetDiv.style.left = `${level.targetPos.x}px`;
  targetDiv.style.top = `${level.targetPos.y}px`;

  //ターゲットを描写
  targetDiv.style.width = `${level.targetSize}px`;
  targetDiv.style.height = `${level.targetSize}px`;

  //ターゲットの中心値を決定
  targetPin = {
    x: level.targetPos.x + level.targetSize / 2,
    y: level.targetPos.y + level.targetSize / 2,
  }
}


/**
 * スコープの位置をレベルごとの関数で決定
 */
function scopeMoove() {
  //スコープの初期位置（のちに削除
  scopePin = {
    x: targetPin.x,
    y: targetPin.y
  }
  let obj = level.scopeF();
  x = obj.x % level.scopeWidth.x;
  let xx = Math.abs((level.scopeWidth.x / 2) - x);
  y = obj.y % level.scopeWidth.y;
  let yy = Math.abs((level.scopeWidth.y / 2) - y);
  scopePin = {
    x: (targetPin.x + xx) - level.scopeWidth.x / 4,
    y: (targetPin.y + yy) - level.scopeWidth.y / 4
  }
  scopeDiv.style.left = `${scopePin.x - 50}px`;//スコープの大きさが直径100なので
  scopeDiv.style.top = `${scopePin.y - 50}px`;//Posは-50で固定
  measure();
}


/**
 * ターゲットからの距離を計算する関数
 */
function measure() {
  let y = Math.floor(Math.abs(targetPin.y - scopePin.y));
  let x = Math.abs(targetPin.x - scopePin.x);
  let z = Math.floor(Math.sqrt(Math.pow(y, 2) + Math.pow(x, 2)));
  //distansP.innerText = `x:${x}/y:${y}/z:${z}`;
  return z;
}


/**
 * 弾を減らす
 */
function removeBullet() {      //一行ずつ削除
  var parElm = document.getElementById("magazine-ul"); // 親要素ノード
  var list = parElm.getElementsByTagName('li'); // <li>要素ノード
  var num = list.length; // <li>要素の数
  if (num <= 0) { return; }  // 削除終了
  num--;
  parElm.removeChild(list[num]);   // 子ノードを末尾から削除
  console.log(`消しました`);
}


//なにかキーを押したら　の処理
function typing() {

  window.document.onkeydown = function (event) {
    if (!gamePlay) {
      return
    } else {
      removeBullet();//球数を減らす（絵だけ）
      console.log(event.key);
      var li = DOM(`li`);

      //1:キー合否判定
      if (textP.innerText === event.key) {//1-1キーがあってれば 
        makeDamageArea();
        var damageArea = document.getElementById(`damage-area${damageI}`);

        //2:ダメージ判定
        let z = measure();//ターゲットからの距離を返す
        if (z > 25) { //2-1 距離が離れてたらノーカウント
          bullet2();//ハズレ弾痕をつける           
          damageArea.innerText = `Miss`;
          li.innerText = `ハズレたぞ！ちゃんと狙え！`;
        } else {  //2-2ちゃんとターゲットに近ければ
          bullet();//弾痕をつける
          damage = Math.floor(100 - ((10 / 3) * z));//ダメージを計算
          damageArea.innerText = damage;
          li.innerText = `ダメージ:${damage}/距離:${z}`;

          nowHP -= damage; //HPからダメージを引く
          grd.style.width = `${(nowHP) / 300 * 100}%`;


        }

      } else {//1-2キーが間違ってたら
        soundMiss.play();
        li.innerText = `キーが間違ってるぞ！タイミングも大事だ。`;
      }

      list.insertBefore(li, list.children[0]);
      nowMagazine -= 1;//数値上の弾数を減らす

      //3:死亡判定
      if (nowHP <= 0) {
        targetFin();
        return;
      }


      if (nowMagazine <= 0) { //
        missFin();
      }
    }
  }
}

/**
 * ダメージ表示エリアを作成
 */
let damageI = 0;
function makeDamageArea() {
  damageI += 1;
  const damageArea = DOM(`p`, null, `damage hidden`);
  damageArea.id = `damage-area${damageI}`;
  damageArea.style.position = `absolute`;
  damageArea.style.top = `${scopePin.y - 70}px`;
  damageArea.style.left = `${scopePin.x - 10}px`;
  wrapper.appendChild(damageArea);
  setTimeout(showHide, 10, damageArea);
}


/**
 * クラス名を表示/非表示で切り替える 
 */
var showHide = function (element) {
  if (element.className === `damage show`) {
    element.className = `damage hidden`;
  } else {
    element.className = `damage show`;
    setTimeout(showHide, 500, element)
  }
}


/**
 * 弾痕をつける
 */
function bullet() {
  const hole = DOM(`img`, null, `hole`);
  hole.src = "img/hole.png";
  hole.style.top = `${scopePin.y - 10}px`;
  hole.style.left = `${scopePin.x - 10}px`;
  wrapper.appendChild(hole);
  soundHit.play();
}
/**
 * 弾痕をつける2
 */
function bullet2() {
  const hole = DOM(`img`, null, `hole`);
  hole.src = "img/hole2.png";
  hole.style.top = `${scopePin.y - 10}px`;
  hole.style.left = `${scopePin.x - 10}px`;
  wrapper.appendChild(hole);
  soundClash.play();
}

/**
 * ターゲットが死んだときの処理
 */
function targetFin() {
  gamePlay = false;
  soundFin.play();
  grd.style.width = `0px`;
  //HPDiv.innerText = 0;
  clearInterval(scopeInterval); //スコープの動きを止める
  clearInterval(randTextInterval);
  clearInterval(timerInterval);
  levelNum += 1;
  isFirstGame = false;
  if (levelNum > 3) {
    finalEnding();
  } else {
    //次のレベルへボタンを表示
    const next = DOM(`button`, `次のレベルへ`, `next`);
    next.onclick = function () {
      gameStart(levelNum);
    };
    //next.addEventListener("click", {name: levelNum, handleEvent: gameStart});
    wrapperDiv.appendChild(next);
  }
}

/**
 * ミスでの終了処理
 */
function missFin() {
  gamePlay = false;
  //setInterval(big,40);
  soundMissFin.play();
  clearInterval(scopeInterval); //スコープの動きを止める
  clearInterval(randTextInterval);
  clearInterval(timerInterval);
  const li = DOM(`li`, `残念だが、弾切れだ・・・`);
  commentDiv.appendChild(li);
  list.insertBefore(li, list.children[0]);
  snipe.className = "hide";
  gameOver();
}

/**
 * ゲームオーバー画面
 */
function gameOver() {
  gameOverDiv.className = `game-over-show`;

}

/**
 * ゲームクリア
 */
function finalEnding() {
  gamePlay = false;
  clearInterval(scopeInterval); //スコープの動きを止める
  clearInterval(randTextInterval);
  clearInterval(timerInterval);
  wrapperDiv.style.backgroundImage = `url("img/earth_good.png")`;
  sniper.style.backgroundImage = `url("img/pose_peace_sign_man.png")`;
  removeAllChildren(list);
  removeClassChildren(wrapperDiv, "hole");//弾痕を削除
  const li = DOM(`li`, `よくやった！これで地球の平和は保たれた。<br>君のおかげだ。ありがとう。`);
  commentDiv.appendChild(li);
  list.insertBefore(li, list.children[0]);
  scopeDiv.className = "hide";
  targetDiv.className = "hide";

}


/**
 * ランダムでアルファベットを生成
 */
//アルファベット配列を作成
const c = 'a'.charCodeAt(0);
const alphabets = Array.apply(null, new Array(26)).map((v, i) => {
  return String.fromCharCode(c + i);
});
//ランダムでアルファベットを書き出し
function randAlphabet() {
  const i = Math.floor(Math.random() * 26);
  const randA = alphabets[i];
  textP.innerText = randA;
}


/**
 * 子要素を全て削除する
 */
function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
/**
 * 特定のクラスの子要素を全て削除
 */
function removeClassChildren(element, className) {
  //子要素取得
  let children = document.getElementsByClassName(className);
  //子要素数取得
  let len = children.length;
  for (var i = 0; i < len; i++) {
    element.removeChild(children[0]);
  }
}

/**
 * カウントダウン関数
 * 指定の秒数からカウントダウンして、残り0秒になったら、
 * 指定した関数を実行する
 */
function countDown(obj) {
  endTime = obj.setTime - ((new Date() - startTime) / 1000);
  endTime = Math.round(endTime * 100) / 100;
  if (endTime < 0) {
    missFin()
  } else {
    timerArea.innerText = endTime.toFixed(2);//残り時間表示
  }
}

/**
 * DOM生成する関数
 */
function DOM(tag, html, className) {
  var element = document.createElement(`${tag}`);
  element.innerHTML = `${html}`;
  element.className = `${className}`;
  return element;
}

